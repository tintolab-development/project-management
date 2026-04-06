import { useNavigate } from "react-router-dom"
import clsx from "clsx"
import { Button } from "@/shared/ui/button"
import { Card } from "@/shared/ui/card"
import { Text } from "@/shared/ui/typography"
import { useAppStore } from "@/app/store/useAppStore"
import { STATUS_LABELS, STATUS_STYLE, TYPE_LABELS } from "@/shared/constants/labels"
import { STATUS_VALUES } from "@/shared/constants/labels"
import { getDomainMap } from "@/entities/domain/lib/domainTree"

export const WorkspacesPage = () => {
  const navigate = useNavigate()
  const activeWorkspace = useAppStore((s) => s.ui.activeWorkspace)
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace)
  const getSortedItems = useAppStore((s) => s.getSortedItems)
  const domains = useAppStore((s) => s.domains)
  const selectItem = useAppStore((s) => s.selectItem)

  const items = getSortedItems()
  const domainMap = getDomainMap(domains)
  const getDomainLabel = (id: string) => domainMap.get(id)?.name || id || "-"

  const workspaceItems = items.filter((item) => item.type === activeWorkspace)

  const meta =
    activeWorkspace === "information_request"
      ? "고객에게 요청할 정보와 고객 회신값, 최종 확인값을 3단계 상태로 관리합니다."
      : "선행 결정이 필요한 항목을 논의 → 방향합의 → 확정 흐름으로 관리합니다."

  const handleOpenItem = (itemId: string) => {
    selectItem(itemId)
    navigate("/items")
  }

  const handleKeyOpen = (itemId: string) => (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    handleOpenItem(itemId)
  }

  return (
    <section aria-label="워크스페이스">
      <div className="workspace-tabs" role="tablist" aria-label="워크스페이스 유형">
        <Button
          type="button"
          variant="ghost"
          role="tab"
          aria-selected={activeWorkspace === "information_request"}
          className={clsx(
            "workspace-tab",
            activeWorkspace === "information_request" && "active",
          )}
          onClick={() => setActiveWorkspace("information_request")}
        >
          고객정보 요청
        </Button>
        <Button
          type="button"
          variant="ghost"
          role="tab"
          aria-selected={activeWorkspace === "decision"}
          className={clsx(
            "workspace-tab",
            activeWorkspace === "decision" && "active",
          )}
          onClick={() => setActiveWorkspace("decision")}
        >
          의사결정 체크리스트
        </Button>
      </div>
      <Text as="div" variant="workspaceMeta">
        {meta}
      </Text>
      <div className="board">
        {STATUS_VALUES.map((status) => {
          const columnItems = workspaceItems.filter(
            (item) => item.status === status,
          )
          return (
            <div key={status} className="board-column">
              <div className="board-column-head">
                <Text as="span" variant="boardColumnHead">
                  {STATUS_LABELS[status]}
                </Text>
                <Text as="span" variant="boardColumnHead">
                  {columnItems.length}
                </Text>
              </div>
              {columnItems.map((item) => (
                <Card
                  key={item.id}
                  variant="compact"
                  role="button"
                  tabIndex={0}
                  className="mb-2.5 cursor-pointer outline-none transition-colors last:mb-0 hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  onClick={() => handleOpenItem(item.id)}
                  onKeyDown={handleKeyOpen(item.id)}
                  aria-label={`${item.code} ${item.title} 상세 열기`}
                >
                  <Text as="div" variant="listTitle" className="mb-1.5">
                    {item.code}
                  </Text>
                  <Text as="div" variant="cardDescription">
                    <Text as="span" variant="emphasis">
                      {item.title}
                    </Text>
                  </Text>
                  <div className="card-meta">
                    <span
                      className={clsx(
                        "pill",
                        STATUS_STYLE[item.status] || "dark",
                      )}
                    >
                      {STATUS_LABELS[item.status]}
                    </span>
                    <span className="pill primary">
                      {getDomainLabel(item.domain)}
                    </span>
                    <span className="pill dark">{TYPE_LABELS[item.type]}</span>
                  </div>
                </Card>
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}

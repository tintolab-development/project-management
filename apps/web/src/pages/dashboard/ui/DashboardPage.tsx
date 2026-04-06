import { useNavigate } from "react-router-dom"
import { useAppStore } from "@/app/store/useAppStore"
import { useAuthSessionStore } from "@/features/auth"
import {
  STATUS_LABELS,
  STATUS_STYLE,
  TYPE_LABELS,
} from "@/shared/constants/labels"
import { Card } from "@/shared/ui/card"
import { DomainProgressTable } from "@/shared/ui/domain-progress-table"
import { Pill, pillToneFromLegacyClass } from "@/shared/ui/pill"
import {
  Heading,
  StatLabel,
  StatSub,
  StatValue,
  Text,
} from "@/shared/ui/typography"
import { formatDateTime } from "@/shared/lib/formatDateTime"
import { getDomainMap, walkDomainsFlat } from "@/entities/domain/lib/domainTree"
import { panelHeadStyles } from "@/shared/ui/page-chrome"

import styles from "./DashboardPage.module.css"

const getStatusDoneCount = (items: { status: string }[]) =>
  items.filter(
    (item) => item.status === "방향합의" || item.status === "확정",
  ).length

const urgentCardInteractiveClass =
  "cursor-pointer outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

export const DashboardPage = () => {
  const navigate = useNavigate()
  const authUser = useAuthSessionStore((s) => s.user)
  const assignedProjects = authUser?.assignedProjects ?? []
  const getSortedItems = useAppStore((s) => s.getSortedItems)
  const domains = useAppStore((s) => s.domains)
  const history = useAppStore((s) => s.history)
  const selectItem = useAppStore((s) => s.selectItem)

  const items = getSortedItems()
  const domainMap = getDomainMap(domains)
  const getDomainLabel = (id: string) => domainMap.get(id)?.name || id || "-"

  const total = items.length
  const p0 = items.filter((item) => item.priority === "P0").length
  const discussing = items.filter((item) => item.status === "논의").length
  const confirmed = items.filter(
    (item) => item.status === "확정" || item.isLocked,
  ).length

  const stats = [
    { label: "전체 항목", value: total, sub: "프로젝트 내 전체 Item" },
    { label: "P0 항목", value: p0, sub: "즉시 의사결정 필요" },
    { label: "논의 중", value: discussing, sub: "추가 검토/회신 필요" },
    { label: "최종 확정", value: confirmed, sub: "기준으로 잠긴 항목" },
  ]

  const urgent = items
    .filter((item) => item.priority === "P0" && item.status !== "확정")
    .slice(0, 6)

  const domainProgressRows =
    domains.length === 0
      ? []
      : walkDomainsFlat(domains).map((domain) => {
          const domainItems = items.filter((item) => item.domain === domain.id)
          const done = getStatusDoneCount(domainItems)
          return {
            id: domain.id,
            label: domain.name,
            completed: done,
            total: domainItems.length,
          }
        })

  const handleOpenItem = (itemId: string) => {
    selectItem(itemId)
    navigate("/items")
  }

  const handleKeyOpenItem = (itemId: string) => (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    handleOpenItem(itemId)
  }

  return (
    <section aria-label="대시보드">
      {assignedProjects.length > 0 ? (
        <Card variant="subpanel" className={styles.assignedBanner}>
          <Text as="div" variant="small" className="text-muted-foreground">
            할당된 프로젝트
          </Text>
          <div className={styles.assignedPills}>
            {assignedProjects.map((p) => (
              <Pill key={p.id} tone="primary">
                {p.name}
              </Pill>
            ))}
          </div>
        </Card>
      ) : null}

      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <Card key={stat.label} variant="stat">
            <StatLabel>{stat.label}</StatLabel>
            <StatValue>{stat.value}</StatValue>
            <StatSub>{stat.sub}</StatSub>
          </Card>
        ))}
      </div>

      <div className={styles.panelGrid}>
        <Card variant="panel">
          <div className={panelHeadStyles.panelHead}>
            <Heading as="h3" variant="panel">
              즉시 확인할 P0 항목
            </Heading>
          </div>
          <div className={styles.listStack}>
            {urgent.length === 0 ? (
              <Text variant="muted" as="div">
                표시할 항목이 없습니다.
              </Text>
            ) : (
              urgent.map((item) => (
                <Card
                  key={item.id}
                  variant="compact"
                  role="button"
                  tabIndex={0}
                  className={urgentCardInteractiveClass}
                  onClick={() => handleOpenItem(item.id)}
                  onKeyDown={handleKeyOpenItem(item.id)}
                  aria-label={`${item.code} ${item.title} 상세 열기`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div>
                      <Text as="div" variant="cardTitle">
                        {item.code} · {item.title}
                      </Text>
                      <Text as="div" variant="cardDescription">
                        {item.description}
                      </Text>
                    </div>
                    <Pill tone="danger">{item.priority}</Pill>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    <Pill tone="dark">{TYPE_LABELS[item.type]}</Pill>
                    <Pill tone="primary">{getDomainLabel(item.domain)}</Pill>
                    <Pill
                      tone={pillToneFromLegacyClass(
                        STATUS_STYLE[item.status] || "dark",
                      )}
                    >
                      {STATUS_LABELS[item.status] || item.status}
                    </Pill>
                    <Pill tone="dark">담당: {item.owner || "-"}</Pill>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Card>

        <Card variant="panel">
          <div className={panelHeadStyles.panelHead}>
            <Heading as="h3" variant="panel">
              도메인별 진행 현황
            </Heading>
          </div>
          <div id="domainProgress">
            <DomainProgressTable rows={domainProgressRows} />
          </div>
        </Card>
      </div>

      <div className={styles.panelGridSingle}>
        <Card variant="panel">
          <div className={panelHeadStyles.panelHead}>
            <Heading as="h3" variant="panel">
              최근 변경 이력
            </Heading>
          </div>
          <div className={styles.historyList}>
            {[...history]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .slice(0, 8)
              .map((h) => (
                <Card key={h.id} variant="history">
                  <div>
                    <Text as="div" variant="emphasis">
                      {h.summary}
                    </Text>
                  </div>
                  <Text as="div" variant="small">
                    {h.actor}
                  </Text>
                  <Text as="div" variant="caption" className="mt-1">
                    {formatDateTime(h.createdAt)}
                  </Text>
                </Card>
              ))}
            {history.length === 0 ? (
              <Text variant="muted" as="div">
                이력이 없습니다.
              </Text>
            ) : null}
          </div>
        </Card>
      </div>
    </section>
  )
}

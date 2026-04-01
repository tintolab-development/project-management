import { useNavigate } from "react-router-dom"
import clsx from "clsx"
import { useAppStore } from "@/app/store/useAppStore"
import {
  STATUS_LABELS,
  STATUS_STYLE,
  TYPE_LABELS,
} from "@/shared/constants/labels"
import { formatDateTime } from "@/shared/lib/formatDateTime"
import { getDomainMap, walkDomainsFlat } from "@/entities/domain/lib/domainTree"

const pill = (text: string, style: string) => (
  <span className={clsx("pill", style)}>{text}</span>
)

const getStatusDoneCount = (items: { status: string }[]) =>
  items.filter(
    (item) => item.status === "방향합의" || item.status === "확정",
  ).length

export const DashboardPage = () => {
  const navigate = useNavigate()
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
      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-sub">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="panel-grid">
        <section className="panel">
          <div className="panel-head">
            <h3>즉시 확인할 P0 항목</h3>
          </div>
          <div className="list-stack">
            {urgent.length === 0 ? (
              <div className="muted">표시할 항목이 없습니다.</div>
            ) : (
              urgent.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  className="urgent-card"
                  onClick={() => handleOpenItem(item.id)}
                  onKeyDown={handleKeyOpenItem(item.id)}
                  aria-label={`${item.code} ${item.title} 상세 열기`}
                >
                  <div className="card-top">
                    <div>
                      <div className="card-title">
                        {item.code} · {item.title}
                      </div>
                      <div className="card-desc">{item.description}</div>
                    </div>
                    {pill(item.priority, "danger")}
                  </div>
                  <div className="card-meta">
                    {pill(TYPE_LABELS[item.type], "dark")}
                    {pill(getDomainLabel(item.domain), "primary")}
                    {pill(
                      STATUS_LABELS[item.status] || item.status,
                      STATUS_STYLE[item.status] || "dark",
                    )}
                    {pill(`담당: ${item.owner || "-"}`, "dark")}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h3>도메인별 진행 현황</h3>
          </div>
          <div id="domainProgress">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>도메인</th>
                  <th>진행</th>
                  <th>바</th>
                  <th>완료율</th>
                </tr>
              </thead>
              <tbody>
                {domains.length === 0 ? (
                  <tr>
                    <td colSpan={4}>등록된 도메인이 없습니다.</td>
                  </tr>
                ) : (
                  walkDomainsFlat(domains).map((domain) => {
                    const domainItems = items.filter(
                      (item) => item.domain === domain.id,
                    )
                    const done = getStatusDoneCount(domainItems)
                    const t = domainItems.length
                    const ratio = t === 0 ? 0 : Math.round((done / t) * 100)
                    return (
                      <tr key={domain.id}>
                        <td>{domain.name}</td>
                        <td>
                          {done} / {t}
                        </td>
                        <td>
                          <div className="bar-wrap">
                            <div className="bar" style={{ width: `${ratio}%` }} />
                          </div>
                        </td>
                        <td>{ratio}%</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="panel-grid single">
        <section className="panel">
          <div className="panel-head">
            <h3>최근 변경 이력</h3>
          </div>
          <div className="history-list">
            {[...history]
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )
              .slice(0, 8)
              .map((h) => (
                <div key={h.id} className="history-row">
                  <div>
                    <strong>{h.summary}</strong>
                  </div>
                  <div>{h.actor}</div>
                  <div className="time">{formatDateTime(h.createdAt)}</div>
                </div>
              ))}
            {history.length === 0 ? (
              <div className="muted">이력이 없습니다.</div>
            ) : null}
          </div>
        </section>
      </div>
    </section>
  )
}

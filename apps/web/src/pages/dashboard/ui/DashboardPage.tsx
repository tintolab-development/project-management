import { useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useAppStore } from "@/app/store/useAppStore"
import { sortItemsForGlobalList } from "@/entities/item/lib/sortItemsByBoard"
import { Card } from "@/shared/ui/card"
import { ItemBoardCard } from "@/entities/item/ui/ItemBoardCard"
import { DomainProgressTable } from "@/shared/ui/domain-progress-table"
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
import { cn } from "@/lib/utils"

import styles from "./DashboardPage.module.css"

const getStatusDoneCount = (items: { status: string }[]) =>
  items.filter(
    (item) => item.status === "방향합의" || item.status === "확정",
  ).length

export const DashboardPage = () => {
  const navigate = useNavigate()
  const domains = useAppStore((s) => s.domains)
  const history = useAppStore((s) => s.history)
  const selectItem = useAppStore((s) => s.selectItem)
  const itemsRaw = useAppStore((s) => s.items)

  const items = useMemo(
    () => sortItemsForGlobalList(itemsRaw),
    [itemsRaw],
  )
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

  return (
    <section aria-label="대시보드">
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <Card key={stat.label} variant="stat">
            <StatLabel appearance="dashboard">{stat.label}</StatLabel>
            <StatSub appearance="dashboard">{stat.sub}</StatSub>
            <StatValue appearance="dashboard">{stat.value}</StatValue>
          </Card>
        ))}
      </div>

      <div className={styles.panelGrid}>
        <Card variant="panel" className={styles.panelCardCapped}>
          <div
            className={cn(panelHeadStyles.panelHead, styles.panelHeadStatic)}
          >
            <Heading as="h3" variant="dashboardSection">
              즉시 확인할 P0 항목
            </Heading>
          </div>
          <div className={cn(styles.listStack, styles.panelBodyScroll)}>
            {urgent.length === 0 ? (
              <Text variant="dashboardEmpty" as="div">
                표시할 항목이 없습니다.
              </Text>
            ) : (
              urgent.map((item) => (
                <ItemBoardCard
                  key={item.id}
                  item={item}
                  getDomainLabel={getDomainLabel}
                  onOpen={handleOpenItem}
                />
              ))
            )}
          </div>
        </Card>

        <Card variant="panel" className={styles.panelCardCapped}>
          <div
            className={cn(panelHeadStyles.panelHead, styles.panelHeadStatic)}
          >
            <Heading as="h3" variant="dashboardSection">
              도메인별 진행 현황
            </Heading>
          </div>
          <div
            id="domainProgress"
            className={styles.panelBodyScroll}
          >
            <DomainProgressTable rows={domainProgressRows} />
          </div>
        </Card>
      </div>

      <div className={styles.panelGridSingle}>
        <Card variant="panel">
          <div className={panelHeadStyles.panelHead}>
            <Heading as="h3" variant="dashboardSection">
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
                    <Text as="div" variant="dashboardTitle" className="mb-1">
                      {h.summary}
                    </Text>
                  </div>
                  <Text as="div" variant="dashboardDesc">
                    {h.actor}
                  </Text>
                  <Text as="div" variant="dashboardCaption" className="mt-1">
                    {formatDateTime(h.createdAt)}
                  </Text>
                </Card>
              ))}
            {history.length === 0 ? (
              <Text variant="dashboardEmpty" as="div">
                이력이 없습니다.
              </Text>
            ) : null}
          </div>
        </Card>
      </div>
    </section>
  )
}

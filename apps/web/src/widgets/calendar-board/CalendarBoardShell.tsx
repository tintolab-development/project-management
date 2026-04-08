import type { ReactNode } from "react"

import styles from "./CalendarBoardShell.module.css"

type Props = {
  filters: ReactNode
  calendar: ReactNode
}

export const CalendarBoardShell = ({ filters, calendar }: Props) => (
  <div className={styles.root}>
    {filters}
    <div className={styles.calendarSection}>{calendar}</div>
  </div>
)

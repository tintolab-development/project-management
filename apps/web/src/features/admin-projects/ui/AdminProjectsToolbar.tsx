import { Button } from "@/shared/ui/button"

import styles from "./AdminProjectsToolbar.module.css"

type Props = {
  projectCount: number
  onCreateClick: () => void
}

export const AdminProjectsToolbar = ({
  projectCount,
  onCreateClick,
}: Props) => (
  <div className={styles.toolbar}>
    <p className={styles.count}>프로젝트 {projectCount}건</p>
    <Button
      type="button"
      appearance="fill"
      dimension="fixedLg"
      className={styles.createButton}
      onClick={onCreateClick}
    >
      프로젝트 생성
    </Button>
  </div>
)

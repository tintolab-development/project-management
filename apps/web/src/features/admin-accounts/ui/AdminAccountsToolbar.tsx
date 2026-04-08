import { Button } from "@/shared/ui/button"

import styles from "./AdminAccountsToolbar.module.css"

type Props = {
  organizationCount: number
  onCreateOrganizationClick: () => void
}

export const AdminAccountsToolbar = ({
  organizationCount,
  onCreateOrganizationClick,
}: Props) => (
  <div className={styles.toolbar}>
    <p className={styles.count}>총 {organizationCount} 소속</p>
    <Button
      type="button"
      appearance="fill"
      dimension="fixedLg"
      className={styles.createButton}
      onClick={onCreateOrganizationClick}
    >
      소속 생성
    </Button>
  </div>
)

import { Settings, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/shared/ui/button"

import type { AdminProject } from "../model/adminProject"
import {
  ADMIN_PROJECT_STATUS_LABEL,
} from "../lib/adminProjectLabels"

import styles from "./AdminProjectCard.module.css"

type Props = {
  project: AdminProject
  deleteDisabled?: boolean
  onDelete: (project: AdminProject) => void
}

export const AdminProjectCard = ({
  project,
  deleteDisabled = false,
  onDelete,
}: Props) => {
  const participants =
    project.participantNames.length > 0
      ? project.participantNames.join(", ")
      : "참가자 없음"

  const handleDeleteClick = () => {
    onDelete(project)
  }

  return (
    <Card className={styles.card}>
      <header className={styles.header}>
        <div className={styles.titleWrap}>
          <h2 className={styles.title}>{project.name}</h2>
          {project.description.trim().length > 0 ? (
            <p className={styles.desc}>{project.description}</p>
          ) : (
            <p className={styles.desc}>프로젝트 설명</p>
          )}
        </div>
        <div className={styles.actions}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${project.name} 프로젝트 설정`}
            disabled
          >
            <Settings className="size-4" aria-hidden />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`${project.name} 프로젝트 삭제`}
            disabled={deleteDisabled}
            onClick={handleDeleteClick}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </header>

      <div className={styles.badges} aria-label="프로젝트 유형·상태·플랫폼">
        <Badge
          variant="pillDark"
          className={`${styles.statusBadge} ${
            project.status === "in_progress"
              ? styles.statusInProgress
              : project.status === "upcoming"
                ? styles.statusUpcoming
                : styles.statusCompleted
          }`}
        >
          {ADMIN_PROJECT_STATUS_LABEL[project.status]}
        </Badge>
        {project.platformTags.map((tag) => (
          <Badge key={tag} variant="pillNeutral" className={styles.platformBadge}>
            {tag}
          </Badge>
        ))}
      </div>

      <Separator className={styles.divider} />

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>프로젝트 기간</p>
          <p className={styles.metaValue}>
            {project.startDate} ~ {project.endDate}
          </p>
        </div>
        <div className={styles.metaItem}>
          <p className={styles.metaLabel}>프로젝트 참가자</p>
          <p className={styles.metaValue}>
            {participants}
            {project.slug ? ` · ${project.slug}` : ""}
          </p>
        </div>
      </div>

    </Card>
  )
}

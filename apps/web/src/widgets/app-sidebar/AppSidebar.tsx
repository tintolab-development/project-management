import { NavLink } from "react-router-dom"
import clsx from "clsx"
import { useAppStore } from "@/app/store/useAppStore"

const navClass = ({ isActive }: { isActive: boolean }) =>
  clsx("nav-link", isActive && "active")

export const AppSidebar = () => {
  const project = useAppStore((s) => s.project)

  return (
    <aside className="sidebar" aria-label="주요 내비게이션">
      <div className="brand">
        <div className="brand-mark">
          <img
            src="/seol-logo.png"
            alt="설해원 로고"
            className="brand-logo"
            decoding="async"
          />
        </div>
        <div className="brand-copy">
          <div className="brand-name">Tintolab Decision Workspace</div>
          <div className="brand-sub">Issue Item management</div>
        </div>
      </div>

      <nav className="nav" aria-label="페이지">
        <NavLink to="/" className={navClass} end>
          Dashboard
        </NavLink>
        <NavLink to="/workspaces" className={navClass}>
          Workspaces
        </NavLink>
        <NavLink to="/items" className={navClass}>
          Items
        </NavLink>
        <NavLink to="/tree" className={navClass}>
          Item Tree
        </NavLink>
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-title">프로젝트</div>
        <div className="project-card">
          <div className="project-name">{project.name}</div>
          <div className="project-meta">{project.subtitle}</div>
        </div>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-title">의사결정 원칙</div>
        <ul className="principles">
          <li>이슈아이템 초안 틴토랩작성</li>
          <li>담당자 별 이슈아이템 확인</li>
          <li>확정처리된 리포트 메일송부</li>
          <li>확정처리 아이템 변경 시 일정반영</li>
        </ul>
      </div>

      <div className="sidebar-footer">Prototype v7</div>
    </aside>
  )
}

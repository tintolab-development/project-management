export type ProjectParticipantSeed = {
  id: string
  affiliation: string
  name: string
  jobTitle: string
}

/** MSW·소속 필터 옵션의 단일 출처 */
export const PROJECT_PARTICIPANTS_SEED: ProjectParticipantSeed[] = [
  {
    id: "pp-1",
    affiliation: "고객사",
    name: "김민수",
    jobTitle: "프로덕트 오너",
  },
  {
    id: "pp-2",
    affiliation: "고객사",
    name: "이서연",
    jobTitle: "디자이너",
  },
  {
    id: "pp-3",
    affiliation: "틴토랩",
    name: "박지훈",
    jobTitle: "프론트엔드",
  },
  {
    id: "pp-4",
    affiliation: "틴토랩",
    name: "최유진",
    jobTitle: "백엔드",
  },
  {
    id: "pp-5",
    affiliation: "틴토랩",
    name: "한도윤",
    jobTitle: "PM",
  },
  {
    id: "pp-6",
    affiliation: "파트너",
    name: "정나래",
    jobTitle: "QA",
  },
  {
    id: "pp-7",
    affiliation: "파트너",
    name: "오세훈",
    jobTitle: "인프라",
  },
  {
    id: "pp-8",
    affiliation: "고객사",
    name: "강하늘",
    jobTitle: "기획",
  },
]

export const PROJECT_PARTICIPANT_AFFILIATION_OPTIONS = [
  ...new Set(PROJECT_PARTICIPANTS_SEED.map((p) => p.affiliation)),
].sort((a, b) => a.localeCompare(b, "ko"))

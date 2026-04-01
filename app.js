
const STORAGE_KEY = "tdw-prototype-v6";

const TYPE_LABELS = {
  information_request: "고객정보 요청",
  decision: "의사결정",
  review: "검토 요청",
  issue: "이슈",
  change_request: "변경 요청"
};

const BASE_DOMAIN_DEFS = [
  { id: "common", name: "공통", aliases: ["common", "공통"] },
  { id: "reservation", name: "예약", aliases: ["reservation", "예약"] },
  { id: "web", name: "웹사이트", aliases: ["web", "website", "웹", "웹사이트", "웹 사이트"] },
  { id: "app", name: "모바일 앱", aliases: ["app", "mobileapp", "모바일앱", "모바일 앱", "앱"] },
  { id: "commerce", name: "쇼핑몰", aliases: ["commerce", "쇼핑몰", "커머스"] },
  { id: "ops", name: "운영/유지보수", aliases: ["ops", "operation", "operations", "운영", "유지보수", "운영유지보수", "운영/유지보수"] },
  { id: "integration", name: "외부연동", aliases: ["integration", "api", "외부연동", "연동"] }
];

const DOMAIN_VALUE_ALIASES = Object.fromEntries(
  BASE_DOMAIN_DEFS.map(domain => [domain.id, domain.aliases])
);

const PRIORITY_LABELS = {
  P0: "P0",
  P1: "P1",
  P2: "P2"
};

const STATUS_VALUES = ["논의", "방향합의", "확정"];

const STATUS_LABELS = {
  논의: "논의",
  방향합의: "방향합의",
  확정: "확정"
};

const STATUS_STYLE = {
  논의: "warn",
  방향합의: "primary",
  확정: "success"
};

const WORKSPACE_CONFIG = {
  information_request: {
    label: "고객정보 요청",
    statuses: STATUS_VALUES
  },
  decision: {
    label: "의사결정 체크리스트",
    statuses: STATUS_VALUES
  }
};

const HEADER_ALIASES = {
  code: ["code", "id", "itemcode", "itemid", "코드", "항목코드"],
  type: ["type", "유형"],
  domain: ["domain", "도메인"],
  title: ["title", "제목"],
  description: ["description", "설명"],
  priority: ["priority", "우선순위"],
  status: ["status", "상태"],
  owner: ["owner", "담당자"],
  dueDate: ["duedate", "due", "마감일", "일정"],
  clientResponse: ["clientresponse", "고객회신값", "고객회신", "회신값"],
  finalConfirmedValue: ["finalconfirmedvalue", "최종확인값", "최종 확인값", "확인값"]
};

const TYPE_VALUE_ALIASES = {
  information_request: ["information_request", "informationrequest", "고객정보요청", "고객정보 요청", "정보요청", "정보 요청"],
  decision: ["decision", "의사결정"],
  review: ["review", "검토요청", "검토 요청", "검토"],
  issue: ["issue", "이슈"],
  change_request: ["change_request", "changerequest", "변경요청", "변경 요청"]
};

const STATUS_VALUE_ALIASES = {
  논의: [
    "논의", "underreview", "under review", "논의중", "논의 중", "검토중", "검토 중",
    "reviewing", "sent", "responded", "open", "optionproposed", "needclarification",
    "draft", "recommended", "closed", "superseded"
  ],
  방향합의: ["방향합의", "방향 합의", "agreed", "합의"],
  확정: ["확정", "locked", "잠금", "최종기준확정", "최종 기준 확정", "확정잠금"]
};

const FIXED_IMPORT_ORDER = [
  "type",
  "domain",
  "title",
  "description",
  "priority",
  "status",
  "owner",
  "dueDate",
  "clientResponse",
  "finalConfirmedValue",
  "code"
];

let pendingImportRows = [];
let draggedTreeItemId = "";
let draggedTreeDomainId = "";
let state = loadState();

function nowIso() {
  return new Date().toISOString();
}

function formatDateTime(v) {
  if (!v) return "-";
  const d = new Date(v);
  return d.toLocaleString("ko-KR");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function uniqueId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
}

function normalizeTextValue(value) {
  return String(value ?? "").trim();
}

function fromAlias(value, map, fallback = "") {
  const key = normalizeKey(value);
  if (!key) return fallback;
  for (const [target, aliases] of Object.entries(map)) {
    if (aliases.some(alias => normalizeKey(alias) === key)) {
      return target;
    }
  }
  return fallback;
}

function resolveHeaderKey(value) {
  return fromAlias(value, HEADER_ALIASES, "");
}

function normalizeStatusValue(raw) {
  const mapped = fromAlias(raw, STATUS_VALUE_ALIASES, "");
  if (mapped && STATUS_VALUES.includes(mapped)) return mapped;
  return "논의";
}

function getDetailRefs() {
  return {
    empty: document.getElementById("emptyDetail"),
    wrap: document.getElementById("detailWrap"),
    code: document.getElementById("detailCode"),
    title: document.getElementById("detailTitle"),
    type: document.getElementById("detailType"),
    domain: document.getElementById("detailDomain"),
    priority: document.getElementById("detailPriority"),
    status: document.getElementById("detailStatus"),
    owner: document.getElementById("detailOwner"),
    dueDate: document.getElementById("detailDueDate"),
    description: document.getElementById("detailDescription"),
    clientResponse: document.getElementById("detailClientResponse"),
    finalConfirmedValue: document.getElementById("detailFinalConfirmedValue"),
    pills: document.getElementById("detailPills"),
    commentsList: document.getElementById("commentsList"),
    historyList: document.getElementById("historyList"),
    saveBtn: document.getElementById("saveItemBtn"),
    lockBtn: document.getElementById("lockToggleBtn"),
    commentAuthor: document.getElementById("commentAuthor"),
    commentBody: document.getElementById("commentBody"),
    addCommentBtn: document.getElementById("addCommentBtn")
  };
}

function autoResizeDetailTitle() {
  const el = getDetailRefs().title;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${Math.max(el.scrollHeight, 68)}px`;
}

function makeBaseDomains() {
  return BASE_DOMAIN_DEFS.map((domain, index) => ({
    id: domain.id,
    name: domain.name,
    parentId: "",
    order: index
  }));
}

function makeDomainId(name) {
  const cleaned = normalizeKey(name).replace(/[^a-z0-9가-힣]/g, "").slice(0, 16);
  return cleaned ? `dom-${cleaned}-${Date.now().toString(36).slice(-5)}` : uniqueId("DOM");
}

function findDomainByAny(value, domains = state.domains || []) {
  const key = normalizeKey(value);
  if (!key) return null;

  const direct = domains.find(domain =>
    normalizeKey(domain.id) === key || normalizeKey(domain.name) === key
  );
  if (direct) return direct;

  const aliasId = fromAlias(value, DOMAIN_VALUE_ALIASES, "");
  if (aliasId) {
    return domains.find(domain => domain.id === aliasId) || null;
  }

  return null;
}

function normalizeDomains(rawDomains) {
  const source = Array.isArray(rawDomains) && rawDomains.length ? rawDomains : makeBaseDomains();
  const normalized = [];
  const usedIds = new Set();

  source.forEach((domain, index) => {
    const name = normalizeTextValue(domain?.name || domain?.label || domain?.id) || `도메인 ${index + 1}`;
    let id = normalizeTextValue(domain?.id) || makeDomainId(name);
    if (usedIds.has(id)) id = makeDomainId(name);
    usedIds.add(id);

    normalized.push({
      id,
      name,
      parentId: normalizeTextValue(domain?.parentId || ""),
      order: Number.isFinite(Number(domain?.order)) ? Number(domain.order) : index
    });
  });

  const validIds = new Set(normalized.map(domain => domain.id));
  normalized.forEach(domain => {
    if (domain.parentId === domain.id || !validIds.has(domain.parentId)) {
      domain.parentId = "";
    }
  });

  const map = new Map(normalized.map(domain => [domain.id, domain]));
  normalized.forEach(domain => {
    const seen = new Set([domain.id]);
    let currentId = domain.parentId;
    while (currentId) {
      if (seen.has(currentId)) {
        domain.parentId = "";
        break;
      }
      seen.add(currentId);
      currentId = map.get(currentId)?.parentId || "";
    }
  });

  const normalizeBranch = (parentId = "") => {
    const siblings = normalized
      .filter(domain => (domain.parentId || "") === (parentId || ""))
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return a.name.localeCompare(b.name, "ko");
      });
    siblings.forEach((domain, index) => {
      domain.parentId = parentId || "";
      domain.order = index;
      normalizeBranch(domain.id);
    });
  };

  normalizeBranch("");
  return normalized;
}

function ensureDomainExistsByValue(value, domains) {
  const existing = findDomainByAny(value, domains);
  if (existing) return existing.id;

  const label = normalizeTextValue(value);
  if (!label) {
    const fallback = domains[0] || { id: "common" };
    return fallback.id;
  }

  const next = {
    id: makeDomainId(label),
    name: label,
    order: domains.length
  };
  domains.push(next);
  return next.id;
}

function getDefaultDomainId() {
  const first = getDomains()[0];
  return first ? first.id : "common";
}

function getChildDomains(parentId = "") {
  return (state.domains || [])
    .filter(domain => (domain.parentId || "") === (parentId || ""))
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name, "ko");
    });
}

function getDomains() {
  const ordered = [];
  const walk = (parentId = "") => {
    getChildDomains(parentId).forEach(domain => {
      ordered.push(domain);
      walk(domain.id);
    });
  };
  walk("");
  return ordered;
}

function getDomainMap() {
  return new Map((state.domains || []).map(domain => [domain.id, domain]));
}


function getDomainDepth(domainId) {
  const map = getDomainMap();
  let depth = 0;
  let current = map.get(domainId);
  const seen = new Set();

  while (current?.parentId && map.has(current.parentId) && !seen.has(current.parentId)) {
    seen.add(current.id);
    depth += 1;
    current = map.get(current.parentId);
  }

  return depth;
}

function getDomainPathIds(domainId) {
  const map = getDomainMap();
  const path = [];
  let current = map.get(domainId);
  const seen = new Set();

  while (current && !seen.has(current.id)) {
    seen.add(current.id);
    path.unshift(current.id);
    current = current.parentId ? map.get(current.parentId) : null;
  }

  return path;
}

function getDomainPathLabel(domainId, separator = " › ") {
  const map = getDomainMap();
  return getDomainPathIds(domainId)
    .map(id => map.get(id)?.name || id)
    .filter(Boolean)
    .join(separator);
}

function getDomainOptionLabel(domainId) {
  const map = getDomainMap();
  const domain = map.get(domainId);
  if (!domain) return domainId || "-";
  return `${"— ".repeat(getDomainDepth(domainId))}${domain.name}`;
}

function getDescendantDomainIds(domainId, includeSelf = false) {
  const ids = [];
  const walk = (parentId) => {
    getChildDomains(parentId).forEach(child => {
      ids.push(child.id);
      walk(child.id);
    });
  };
  if (includeSelf) ids.push(domainId);
  walk(domainId);
  return ids;
}

function getDomainItemCount(domainId, options = {}) {
  const { includeDescendants = false } = options;
  const targetIds = includeDescendants ? new Set(getDescendantDomainIds(domainId, true)) : new Set([domainId]);
  return state.items.filter(item => targetIds.has(item.domain)).length;
}

function getDomainTreeNodes(parentId = "") {
  return getChildDomains(parentId).map(domain => ({
    domain,
    children: getDomainTreeNodes(domain.id),
    items: getItems().filter(item => item.domain === domain.id)
  }));
}

function commitSiblingDomains(parentId, orderedDomains) {
  orderedDomains.forEach((domain, index) => {
    domain.parentId = parentId || "";
    domain.order = index;
  });
}

function normalizeDomainOrders() {
  const walk = (parentId = "") => {
    const siblings = getChildDomains(parentId);
    siblings.forEach((domain, index) => {
      domain.parentId = parentId || "";
      domain.order = index;
      walk(domain.id);
    });
  };
  walk("");
}

function canMoveDomainToParent(domainId, parentId) {
  if (!domainId) return false;
  if ((parentId || "") === domainId) return false;
  const descendants = new Set(getDescendantDomainIds(domainId));
  return !descendants.has(parentId);
}

function moveDomainNode(dragDomainId, parentId, insertIndex) {
  const domain = getDomainMap().get(dragDomainId);
  if (!domain) return;

  const nextParentId = parentId || "";
  if (!canMoveDomainToParent(dragDomainId, nextParentId)) {
    alert("하위 도메인 안으로는 상위 도메인을 이동할 수 없습니다.");
    return;
  }

  const oldParentId = domain.parentId || "";
  const oldSiblings = getChildDomains(oldParentId).filter(entry => entry.id !== dragDomainId);
  commitSiblingDomains(oldParentId, oldSiblings);

  const targetSiblings = getChildDomains(nextParentId).filter(entry => entry.id !== dragDomainId);
  const clampedIndex = Math.max(0, Math.min(Number(insertIndex) || 0, targetSiblings.length));
  targetSiblings.splice(clampedIndex, 0, domain);
  commitSiblingDomains(nextParentId, targetSiblings);

  normalizeDomainOrders();
  if (!state.ui.expandedDomainIds.includes(domain.id)) state.ui.expandedDomainIds.push(domain.id);
  if (nextParentId && !state.ui.expandedDomainIds.includes(nextParentId)) state.ui.expandedDomainIds.push(nextParentId);
  saveState();
  renderAll();
}

function getDomainLabel(domainId) {
  const found = getDomainMap().get(domainId);
  return found?.name || domainId || "-";
}

function normalizeDomainOrders() {
  const walk = (parentId = "") => {
    const siblings = getChildDomains(parentId);
    siblings.forEach((domain, index) => {
      domain.parentId = parentId || "";
      domain.order = index;
      walk(domain.id);
    });
  };
  walk("");
}

function getFallbackDomainId(excludeId = "") {
  const domains = getDomains().filter(domain => domain.id !== excludeId);
  return domains[0]?.id || "";
}

function updateDomainManagerSelect() {
  return;
}

function resolveDomainValue(raw, options = {}) {
  const { createIfMissing = false, fallback = getDefaultDomainId() } = options;
  const text = normalizeTextValue(raw);
  if (!text) return fallback;

  const existing = findDomainByAny(text);
  if (existing) return existing.id;

  const aliasId = fromAlias(text, DOMAIN_VALUE_ALIASES, "");
  if (aliasId) return aliasId;

  if (!createIfMissing) return text;

  const newDomain = createDomain(text, { silent: true });
  return newDomain?.id || fallback;
}

function ensureExpandedDomainState(domains = getDomains()) {
  const validIds = new Set(domains.map(domain => domain.id));
  const current = Array.isArray(state.ui.expandedDomainIds) ? state.ui.expandedDomainIds : [];
  const next = current.filter(id => validIds.has(id));

  if (!next.length) {
    state.ui.expandedDomainIds = domains.map(domain => domain.id);
    return;
  }

  state.ui.expandedDomainIds = next;
}

function excelSerialToDate(serial) {
  const n = Number(serial);
  if (!Number.isFinite(n)) return "";
  const base = new Date(Date.UTC(1899, 11, 30));
  const date = new Date(base.getTime() + n * 86400000);
  return date.toISOString().slice(0, 10);
}

function normalizeDateInput(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return "";

  if (/^\d{5}$/.test(value) || /^\d{4,5}\.\d+$/.test(value)) {
    return excelSerialToDate(value);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const m1 = value.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/);
  if (m1) {
    const y = m1[1];
    const mo = String(Number(m1[2])).padStart(2, "0");
    const d = String(Number(m1[3])).padStart(2, "0");
    return `${y}-${mo}-${d}`;
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return "";
}

function createSeedData() {
  const createdAt = nowIso();
  return {
    ui: {
      activeView: "dashboardView",
      activeWorkspace: "information_request",
      selectedItemId: "IR-001",
      expandedDomainIds: makeBaseDomains().map(domain => domain.id),
      itemsQuery: "",
      treeQuery: "",
      treePreviewItemId: ""
    },
    project: {
      id: "PRJ-001",
      name: "Seolhaewon Project",
      subtitle: "예약엔진 · 웹 · 앱 · 운영정책 협의"
    },
    domains: makeBaseDomains(),
    items: [
      {
        id: "IR-001",
        code: "IR-001",
        type: "information_request",
        domain: "reservation",
        title: "객실·골프·식음 상품 마스터 수령",
        description: "판매명/운영명, 판매단위/이용단위, 채널, 인원정책, 블랙아웃 캘린더를 수령합니다.",
        priority: "P0",
        status: "논의",
        owner: "설해원 운영팀",
        dueDate: "2026-03-21",
        clientResponse: "",
        finalConfirmedValue: "",
        isLocked: false,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "IR-002",
        code: "IR-002",
        type: "information_request",
        domain: "reservation",
        title: "상품별 재고 차감 단위 확정",
        description: "객실/골프/식음/웰니스/패키지의 inventory grain을 확정합니다.",
        priority: "P0",
        status: "논의",
        owner: "틴토랩 PM",
        dueDate: "2026-03-22",
        clientResponse: "골프와 식음 회차 운영 규칙은 추가 협의 필요",
        finalConfirmedValue: "",
        isLocked: false,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "IR-003",
        code: "IR-003",
        type: "information_request",
        domain: "integration",
        title: "PMS 인터페이스 명세 수령",
        description: "예약 생성/변경/취소, 객실상태, 체크인/체크아웃 가능 범위를 확인합니다.",
        priority: "P0",
        status: "논의",
        owner: "설해원 전산팀",
        dueDate: "2026-03-20",
        clientResponse: "조회/생성 API 지원 가능, 변경/취소는 확인 필요",
        finalConfirmedValue: "",
        isLocked: false,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "D-001",
        code: "D-001",
        type: "decision",
        domain: "reservation",
        title: "판매 가능 재고의 authoritative source 확정",
        description: "판매 가능 재고와 예약 상태의 기준 시스템을 Reservation Engine으로 둘지 결정합니다.",
        priority: "P0",
        status: "논의",
        owner: "설해원 의사결정자",
        dueDate: "2026-03-21",
        clientResponse: "PMS 기준 운영 관성 존재",
        finalConfirmedValue: "",
        isLocked: false,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "D-002",
        code: "D-002",
        type: "decision",
        domain: "reservation",
        title: "패키지 확보 방식을 Group Hold로 확정 후보화",
        description: "패키지를 순차예약이 아닌 Group Hold + All-or-Nothing Confirm 구조로 결정합니다.",
        priority: "P0",
        status: "방향합의",
        owner: "틴토랩 CTO",
        dueDate: "2026-03-22",
        clientResponse: "부분 성공은 지양",
        finalConfirmedValue: "Group Hold + All-or-Nothing Confirm 적용",
        isLocked: false,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "D-003",
        code: "D-003",
        type: "decision",
        domain: "web",
        title: "고객 승인 흐름을 화면 상단 고정형으로 노출",
        description: "웹/앱/예약 협의 항목 모두 상단에서 상태와 다음 액션이 보이도록 결정합니다.",
        priority: "P1",
        status: "확정",
        owner: "틴토랩 PM",
        dueDate: "2026-03-25",
        clientResponse: "동의",
        finalConfirmedValue: "상단 요약 고정 UI 채택",
        isLocked: true,
        createdAt,
        updatedAt: createdAt
      },
      {
        id: "IR-004",
        code: "IR-004",
        type: "information_request",
        domain: "app",
        title: "모바일 앱 로그인 정책 확인",
        description: "회원/비회원, 간편로그인, 본인확인, 예약 조회 정책을 확인합니다.",
        priority: "P1",
        status: "논의",
        owner: "설해원 마케팅팀",
        dueDate: "2026-03-27",
        clientResponse: "",
        finalConfirmedValue: "",
        isLocked: false,
        createdAt,
        updatedAt: createdAt
      }
    ],
    comments: [
      {
        id: "C-001",
        itemId: "IR-002",
        author: "틴토랩 PM",
        body: "골프 티타임과 식음 seating shift 기준이 설해원 운영표와 일치하는지 확인이 필요합니다.",
        createdAt
      },
      {
        id: "C-002",
        itemId: "D-001",
        author: "틴토랩 CTO",
        body: "판매 판단 시스템과 현장 운영 시스템을 분리하지 않으면 중복예약과 정합성 복구가 어려워집니다.",
        createdAt
      },
      {
        id: "C-003",
        itemId: "D-003",
        author: "설해원 담당자",
        body: "진행 상태가 한눈에 보여야 서울-양양 간 협의가 쉬워질 것 같습니다.",
        createdAt
      }
    ],
    history: [
      {
        id: "H-001",
        itemId: "IR-003",
        eventType: "item.updated",
        summary: "설해원 전산팀이 PMS 인터페이스 1차 회신을 등록",
        actor: "설해원 전산팀",
        createdAt
      },
      {
        id: "H-002",
        itemId: "D-002",
        eventType: "item.agreed",
        summary: "패키지 확보 구조를 Group Hold 방식으로 방향 합의",
        actor: "틴토랩 CTO",
        createdAt
      },
      {
        id: "H-003",
        itemId: "D-003",
        eventType: "item.locked",
        summary: "상단 고정형 승인 요약 UI를 최종 기준 확정",
        actor: "틴토랩 PM",
        createdAt
      }
    ]
  };
}

function normalizeState(raw) {
  const seed = createSeedData();
  const normalized = raw && typeof raw === "object" ? clone(raw) : seed;

  normalized.ui = {
    activeView: normalized.ui?.activeView || seed.ui.activeView,
    activeWorkspace: normalized.ui?.activeWorkspace || seed.ui.activeWorkspace,
    selectedItemId: normalized.ui?.selectedItemId || seed.ui.selectedItemId,
    expandedDomainIds: Array.isArray(normalized.ui?.expandedDomainIds) ? normalized.ui.expandedDomainIds : seed.ui.expandedDomainIds,
    itemsQuery: normalizeTextValue(normalized.ui?.itemsQuery || normalized.ui?.searchQuery || ""),
    treeQuery: normalizeTextValue(normalized.ui?.treeQuery || normalized.ui?.searchQuery || ""),
    treePreviewItemId: normalizeTextValue(normalized.ui?.treePreviewItemId || normalized.ui?.selectedItemId || ""),
    treeManageDomainId: normalizeTextValue(normalized.ui?.treeManageDomainId || "")
  };

  normalized.project = {
    ...seed.project,
    ...(normalized.project || {})
  };

  const workingDomains = normalizeDomains(normalized.domains);

  normalized.items = Array.isArray(normalized.items) ? normalized.items.map(item => {
    const nextStatus = normalizeStatusValue(item?.status);
    const resolvedDomainId = ensureDomainExistsByValue(item?.domain, workingDomains);
    return {
      owner: "",
      dueDate: "",
      clientResponse: "",
      finalConfirmedValue: item?.finalConfirmedValue || item?.agreedValue || "",
      isLocked: nextStatus === "확정",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ...item,
      domain: resolvedDomainId,
      status: nextStatus,
      finalConfirmedValue: item?.finalConfirmedValue || item?.agreedValue || "",
      isLocked: nextStatus === "확정" || !!item?.isLocked
    };
  }) : seed.items;

  normalized.domains = workingDomains;
  normalized.comments = Array.isArray(normalized.comments) ? normalized.comments : [];
  normalized.history = Array.isArray(normalized.history) ? normalized.history : [];

  const validExpandedIds = new Set(workingDomains.map(domain => domain.id));
  const nextExpandedIds = normalized.ui.expandedDomainIds.filter(id => validExpandedIds.has(id));
  normalized.ui.expandedDomainIds = nextExpandedIds.length
    ? nextExpandedIds
    : workingDomains.map(domain => domain.id);

  if (!normalized.items.some(item => item.id === normalized.ui.selectedItemId)) {
    normalized.ui.selectedItemId = normalized.items[0]?.id || null;
  }

  if (normalized.ui.treePreviewItemId && !normalized.items.some(item => item.id === normalized.ui.treePreviewItemId)) {
    normalized.ui.treePreviewItemId = "";
  }

  if (!workingDomains.some(domain => domain.id === normalized.ui.treeManageDomainId)) {
    normalized.ui.treeManageDomainId = workingDomains[0]?.id || "";
  }

  return normalized;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createSeedData();
  try {
    return normalizeState(JSON.parse(raw));
  } catch {
    return createSeedData();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error(error);
    alert("브라우저 저장소에 저장하지 못했습니다. 내보내기로 백업해 주세요.");
  }
}

function getItems() {
  return [...state.items].sort((a, b) => {
    if (a.code === b.code) return a.title.localeCompare(b.title, "ko");
    return a.code > b.code ? 1 : -1;
  });
}

function getItemById(itemId) {
  return state.items.find(item => item.id === itemId);
}

function getItemByCode(code) {
  const key = normalizeKey(code);
  return state.items.find(item => normalizeKey(item.code) === key || normalizeKey(item.id) === key);
}

function getComments(itemId) {
  return state.comments
    .filter(comment => comment.itemId === itemId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function getHistory(itemId) {
  return state.history
    .filter(history => history.itemId === itemId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function addHistory(itemId, eventType, summary, actor = "시스템") {
  state.history.unshift({
    id: uniqueId("H"),
    itemId,
    eventType,
    summary,
    actor,
    createdAt: nowIso()
  });
}

function pill(text, style = "dark") {
  return `<span class="pill ${style}">${escapeHtml(text)}</span>`;
}

function switchView(viewId) {
  state.ui.activeView = viewId;
  saveState();

  document.querySelectorAll(".view").forEach(view => view.classList.remove("active"));
  document.getElementById(viewId)?.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.view === viewId);
  });
}

function selectItem(itemId, options = {}) {
  const { openItemsView = false, openView = "" } = options;
  state.ui.selectedItemId = itemId;

  const nextView = openView || (openItemsView ? "itemsView" : "");
  if (nextView) {
    state.ui.activeView = nextView;
    switchView(nextView);
  }

  saveState();
  renderAll();
}

function bindOpenItemFromCards() {
  document.querySelectorAll("[data-open-item]").forEach(el => {
    el.onclick = () => {
      selectItem(el.dataset.openItem, { openItemsView: true });
    };
  });
}

function getStatusDoneCount(items) {
  return items.filter(item => item.status === "방향합의" || item.status === "확정").length;
}

function renderStats() {
  const items = getItems();
  const total = items.length;
  const p0 = items.filter(item => item.priority === "P0").length;
  const discussing = items.filter(item => item.status === "논의").length;
  const confirmed = items.filter(item => item.status === "확정" || item.isLocked).length;

  const stats = [
    { label: "전체 항목", value: total, sub: "프로젝트 내 전체 Item" },
    { label: "P0 항목", value: p0, sub: "즉시 의사결정 필요" },
    { label: "논의 중", value: discussing, sub: "추가 검토/회신 필요" },
    { label: "최종 확정", value: confirmed, sub: "기준으로 잠긴 항목" }
  ];

  document.getElementById("dashboardStats").innerHTML = stats.map(stat => `
    <div class="stat-card">
      <div class="stat-label">${escapeHtml(stat.label)}</div>
      <div class="stat-value">${escapeHtml(stat.value)}</div>
      <div class="stat-sub">${escapeHtml(stat.sub)}</div>
    </div>
  `).join("");
}

function renderUrgentList() {
  const urgent = getItems().filter(item => item.priority === "P0" && item.status !== "확정").slice(0, 6);
  document.getElementById("urgentList").innerHTML = urgent.map(item => `
    <div class="urgent-card" data-open-item="${escapeHtml(item.id)}">
      <div class="card-top">
        <div>
          <div class="card-title">${escapeHtml(item.code)} · ${escapeHtml(item.title)}</div>
          <div class="card-desc">${escapeHtml(item.description)}</div>
        </div>
        ${pill(item.priority, "danger")}
      </div>
      <div class="card-meta">
        ${pill(TYPE_LABELS[item.type], "dark")}
        ${pill(getDomainLabel(item.domain), "primary")}
        ${pill(STATUS_LABELS[item.status] || item.status, STATUS_STYLE[item.status] || "dark")}
        ${pill("담당: " + (item.owner || "-"), "dark")}
      </div>
    </div>
  `).join("") || `<div class="muted">표시할 항목이 없습니다.</div>`;

  bindOpenItemFromCards();
}

function renderDomainProgress() {
  const rows = getDomains().map(domain => {
    const items = getItems().filter(item => item.domain === domain.id);
    const total = items.length;
    const done = getStatusDoneCount(items);
    const ratio = total === 0 ? 0 : Math.round((done / total) * 100);

    return `
      <tr>
        <td>${escapeHtml(domain.name)}</td>
        <td>${done} / ${total}</td>
        <td>
          <div class="bar-wrap">
            <div class="bar" style="width:${ratio}%"></div>
          </div>
        </td>
        <td>${ratio}%</td>
      </tr>
    `;
  }).join("");

  document.getElementById("domainProgress").innerHTML = `
    <table class="progress-table">
      <thead>
        <tr>
          <th>도메인</th>
          <th>진행</th>
          <th>바</th>
          <th>완료율</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="4">등록된 도메인이 없습니다.</td></tr>`}</tbody>
    </table>
  `;
}

function renderRecentHistory() {
  const rows = [...state.history]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8)
    .map(history => `
      <div class="history-row">
        <div><strong>${escapeHtml(history.summary)}</strong></div>
        <div>${escapeHtml(history.actor)}</div>
        <div class="time">${escapeHtml(formatDateTime(history.createdAt))}</div>
      </div>
    `).join("");

  document.getElementById("recentHistory").innerHTML = rows || `<div class="muted">이력이 없습니다.</div>`;
}

function renderWorkspace() {
  const workspace = state.ui.activeWorkspace || "information_request";
  document.querySelectorAll(".workspace-tab").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.workspace === workspace);
  });

  document.getElementById("workspaceMeta").innerText =
    workspace === "information_request"
      ? "고객에게 요청할 정보와 고객 회신값, 최종 확인값을 3단계 상태로 관리합니다."
      : "선행 결정이 필요한 항목을 논의 → 방향합의 → 확정 흐름으로 관리합니다.";

  const items = getItems().filter(item => item.type === workspace);
  const columns = WORKSPACE_CONFIG[workspace]?.statuses || STATUS_VALUES;

  const board = columns.map(status => {
    const columnItems = items.filter(item => item.status === status);

    const cards = columnItems.map(item => `
      <div class="board-card" data-open-item="${escapeHtml(item.id)}">
        <div class="card-title">${escapeHtml(item.code)}</div>
        <div class="card-desc"><strong>${escapeHtml(item.title)}</strong></div>
        <div class="card-meta">
          ${pill(item.priority, item.priority === "P0" ? "danger" : item.priority === "P1" ? "warn" : "dark")}
          ${pill(getDomainLabel(item.domain), "primary")}
        </div>
        <div class="card-meta">
          ${pill("담당: " + (item.owner || "-"), "dark")}
          ${pill(item.dueDate || "-", "dark")}
        </div>
      </div>
    `).join("") || `<div class="muted">없음</div>`;

    return `
      <div class="board-column">
        <div class="board-column-head">
          <span>${escapeHtml(STATUS_LABELS[status])}</span>
          <span>${columnItems.length}</span>
        </div>
        ${cards}
      </div>
    `;
  }).join("");

  document.getElementById("workspaceBoard").innerHTML = board;
  bindOpenItemFromCards();
}

function getSearchQuery(mode = "items") {
  return mode === "tree"
    ? (state.ui.treeQuery || "")
    : (state.ui.itemsQuery || "");
}

function syncSearchInputs() {
  const itemsValue = getSearchQuery("items");
  const treeValue = getSearchQuery("tree");
  const searchInput = document.getElementById("searchInput");
  const treeSearchInput = document.getElementById("treeSearchInput");

  if (searchInput && searchInput.value !== itemsValue) searchInput.value = itemsValue;
  if (treeSearchInput && treeSearchInput.value !== treeValue) treeSearchInput.value = treeValue;
}

function setSearchQuery(mode, value, options = {}) {
  const { rerender = true } = options;
  const nextValue = normalizeTextValue(value);

  if (mode === "tree") {
    state.ui.treeQuery = nextValue;
  } else {
    state.ui.itemsQuery = nextValue;
  }

  syncSearchInputs();
  saveState();

  if (rerender) {
    if (mode === "tree") {
      renderTreeExplorer();
    } else {
      renderItems();
    }
  }
}

function buildFilterOptions() {
  const typeFilter = document.getElementById("typeFilter");
  const domainFilter = document.getElementById("domainFilter");
  const statusFilter = document.getElementById("statusFilter");
  const detailDomain = document.getElementById("detailDomain");
  const detailPriority = document.getElementById("detailPriority");
  const newDomain = document.getElementById("newDomain");
  const newPriority = document.getElementById("newPriority");

  const currentType = typeFilter?.value || "";
  const currentDomain = domainFilter?.value || "";
  const currentStatus = statusFilter?.value || "";
  const currentDetailDomain = detailDomain?.value || "";
  const currentNewDomain = newDomain?.value || "";

  const typeOptions = Object.entries(TYPE_LABELS).map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  const domainOptions = getDomains().map(domain => `<option value="${domain.id}">${escapeHtml(getDomainOptionLabel(domain.id))}</option>`).join("");
  const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  const statusOptions = STATUS_VALUES.map(status => `<option value="${status}">${STATUS_LABELS[status]}</option>`).join("");

  typeFilter.innerHTML = `<option value="">전체 유형</option>${typeOptions}`;
  domainFilter.innerHTML = `<option value="">전체 도메인</option>${domainOptions}`;
  statusFilter.innerHTML = `<option value="">전체 상태</option>${statusOptions}`;
  detailDomain.innerHTML = domainOptions;
  detailPriority.innerHTML = priorityOptions;
  newDomain.innerHTML = domainOptions;
  newPriority.innerHTML = priorityOptions;

  typeFilter.value = Array.from(typeFilter.options).some(option => option.value === currentType) ? currentType : "";
  domainFilter.value = Array.from(domainFilter.options).some(option => option.value === currentDomain) ? currentDomain : "";
  statusFilter.value = Array.from(statusFilter.options).some(option => option.value === currentStatus) ? currentStatus : "";

  const defaultDomain = getDefaultDomainId();
  detailDomain.value = Array.from(detailDomain.options).some(option => option.value === currentDetailDomain) ? currentDetailDomain : defaultDomain;
  newDomain.value = Array.from(newDomain.options).some(option => option.value === currentNewDomain) ? currentNewDomain : defaultDomain;
}

function itemMatchesSearch(item, query) {
  const key = normalizeKey(query);
  if (!key) return true;

  return [
    item.title,
    item.code,
    item.description,
    item.owner,
    item.clientResponse,
    item.finalConfirmedValue,
    getDomainLabel(item.domain)
  ].some(value => normalizeKey(value).includes(key));
}

function getFilteredItems() {
  const search = getSearchQuery("items");
  const type = document.getElementById("typeFilter").value;
  const domain = document.getElementById("domainFilter").value;
  const status = document.getElementById("statusFilter").value;

  return getItems().filter(item => {
    return (
      itemMatchesSearch(item, search) &&
      (!type || item.type === type) &&
      (!domain || item.domain === domain) &&
      (!status || item.status === status)
    );
  });
}

function ensureSelectedItemVisible(filteredItems) {
  if (!filteredItems.length) {
    state.ui.selectedItemId = null;
    saveState();
    return;
  }

  const exists = filteredItems.some(item => item.id === state.ui.selectedItemId);
  if (!exists) {
    state.ui.selectedItemId = filteredItems[0].id;
    saveState();
  }
}

function getStatusOptionsForItem(item) {
  if (item.status === "확정") return ["확정"];
  if (item.status === "방향합의") return ["논의", "방향합의", "확정"];
  return ["논의", "방향합의"];
}

function setDetailEditableState(item) {
  const refs = getDetailRefs();
  const locked = item.status === "확정" || item.isLocked;
  [
    refs.title,
    refs.domain,
    refs.priority,
    refs.status,
    refs.owner,
    refs.dueDate,
    refs.description,
    refs.clientResponse,
    refs.finalConfirmedValue
  ].forEach(el => {
    if (el) el.disabled = locked;
  });

  if (refs.saveBtn) refs.saveBtn.disabled = locked;
  if (refs.lockBtn) refs.lockBtn.textContent = locked ? "확정 해제" : "확정 처리";
}

function renderDetail() {
  const refs = getDetailRefs();
  const item = getItemById(state.ui.selectedItemId);

  if (!item) {
    refs.empty?.classList.remove("hidden");
    refs.wrap?.classList.add("hidden");
    return;
  }

  refs.empty?.classList.add("hidden");
  refs.wrap?.classList.remove("hidden");

  if (refs.code) refs.code.innerText = item.code;
  if (refs.title) refs.title.value = item.title;
  if (refs.type) refs.type.value = TYPE_LABELS[item.type];
  if (refs.domain) refs.domain.value = item.domain;
  if (refs.priority) refs.priority.value = item.priority;
  if (refs.owner) refs.owner.value = item.owner || "";
  if (refs.dueDate) refs.dueDate.value = item.dueDate || "";
  if (refs.description) refs.description.value = item.description || "";
  if (refs.clientResponse) refs.clientResponse.value = item.clientResponse || "";
  if (refs.finalConfirmedValue) refs.finalConfirmedValue.value = item.finalConfirmedValue || "";

  if (refs.status) {
    refs.status.innerHTML = getStatusOptionsForItem(item)
      .map(status => `<option value="${status}">${STATUS_LABELS[status]}</option>`)
      .join("");
    refs.status.value = item.status;
  }

  if (refs.pills) {
    refs.pills.innerHTML = `
      ${pill(item.priority, item.priority === "P0" ? "danger" : item.priority === "P1" ? "warn" : "dark")}
      ${pill(getDomainLabel(item.domain), "primary")}
      ${pill(STATUS_LABELS[item.status], STATUS_STYLE[item.status] || "dark")}
    `;
  }

  if (refs.commentsList) {
    refs.commentsList.innerHTML = getComments(item.id).map(comment => `
      <div class="comment-row">
        <div class="comment-author">${escapeHtml(comment.author)}</div>
        <div class="comment-meta">${escapeHtml(formatDateTime(comment.createdAt))}</div>
        <div>${escapeHtml(comment.body)}</div>
      </div>
    `).join("") || `<div class="muted">코멘트가 없습니다.</div>`;
  }

  if (refs.historyList) {
    refs.historyList.innerHTML = getHistory(item.id).map(history => `
      <div class="history-row">
        <div><strong>${escapeHtml(history.summary)}</strong></div>
        <div>${escapeHtml(history.actor)}</div>
        <div class="time">${escapeHtml(formatDateTime(history.createdAt))}</div>
      </div>
    `).join("") || `<div class="muted">이력이 없습니다.</div>`;
  }

  setDetailEditableState(item);
  autoResizeDetailTitle();
}

function renderItems() {
  const items = getFilteredItems();
  ensureSelectedItemVisible(items);
  const selectedId = state.ui.selectedItemId;

  document.getElementById("itemsList").innerHTML = items.map(item => `
    <div class="list-item ${item.id === selectedId ? "active" : ""}" data-select-item="${escapeHtml(item.id)}">
      <div class="list-top">
        <div class="list-main">
          <div class="detail-code list-code">${escapeHtml(item.code)}</div>
          <div class="list-title">${escapeHtml(item.title)}</div>
        </div>
      </div>
      <div class="list-meta">
        ${pill(TYPE_LABELS[item.type], "dark")}
        ${pill(getDomainLabel(item.domain), "primary")}
        ${pill(item.priority, item.priority === "P0" ? "danger" : item.priority === "P1" ? "warn" : "dark")}
        ${pill(STATUS_LABELS[item.status], STATUS_STYLE[item.status] || "dark")}
      </div>
    </div>
  `).join("") || `<div class="muted">조건에 맞는 항목이 없습니다.</div>`;

  document.querySelectorAll("[data-select-item]").forEach(el => {
    el.onclick = () => {
      state.ui.selectedItemId = el.dataset.selectItem;
      saveState();
      renderItems();
      renderDetail();
      renderTreeExplorer();
    };
  });

  renderDetail();
}

function openDomainInTree(domainId) {
  const current = new Set(state.ui.expandedDomainIds || []);
  current.add(domainId);
  state.ui.expandedDomainIds = [...current];
  saveState();
  switchView("itemTreeView");
  renderTreeExplorer();
}

function renderTreeExplorer() {
  const query = getSearchQuery("tree");
  const key = normalizeKey(query);
  const expandedIds = new Set(state.ui.expandedDomainIds || []);
  const previewItemId = state.ui.treePreviewItemId || "";
  const items = getItems();
  const domains = getDomains();

  const shouldShowItem = (item) => !key || itemMatchesSearch(item, query);
  const shouldShowDomainNode = (node) => {
    const domainMatch = key && normalizeKey(node.domain.name).includes(key);
    return !key || domainMatch || node.items.some(shouldShowItem) || node.children.some(shouldShowDomainNode);
  };

  const renderItemNode = (item, depth) => {
    const isPreviewOpen = previewItemId === item.id;
    const finalValue = normalizeTextValue(item.finalConfirmedValue);
    return `
      <div class="tree-outline-item" style="--tree-depth:${depth};">
        <div
          class="tree-item-row ${item.id === state.ui.selectedItemId ? "active" : ""}"
          data-tree-item-row="${escapeHtml(item.id)}"
          data-tree-item-id="${escapeHtml(item.id)}"
          data-tree-item-domain="${escapeHtml(item.domain)}"
          draggable="true"
        >
          <div class="tree-item-main">
            <div class="tree-item-code">${escapeHtml(item.code)}</div>
            <div class="tree-item-meta">
              <div class="tree-item-title">${escapeHtml(item.title)}</div>
              ${pill(STATUS_LABELS[item.status], STATUS_STYLE[item.status] || "dark")}
            </div>
          </div>
          <div class="tree-item-actions">
            <button class="tree-inline-btn" data-tree-preview-item="${escapeHtml(item.id)}">${isPreviewOpen ? "닫기" : "상세보기"}</button>
            <button class="tree-item-delete" data-tree-delete-item="${escapeHtml(item.id)}" title="아이템 삭제">×</button>
          </div>
        </div>
        ${isPreviewOpen ? `
          <div class="tree-item-preview">
            <div class="tree-preview-label">최종확인값</div>
            <div class="tree-preview-value ${finalValue ? "" : "tree-preview-empty"}">${escapeHtml(finalValue || "아직 최종 확인값이 입력되지 않았습니다.")}</div>
            <div class="tree-preview-actions">
              <button class="tree-inline-btn" data-tree-go-item="${escapeHtml(item.id)}">더보기</button>
            </div>
          </div>
        ` : ""}
      </div>
    `;
  };

  const renderDomainNode = (node, depth = 0) => {
    if (!shouldShowDomainNode(node)) return "";
    const isOpen = key ? true : expandedIds.has(node.domain.id);
    const descendantCount = getDescendantDomainIds(node.domain.id).length;
    const subtreeItemCount = getDomainItemCount(node.domain.id, { includeDescendants: true });
    const countLabel = `${descendantCount ? `하위 ${descendantCount} · ` : ""}아이템 ${subtreeItemCount}`;

    const childHtml = node.children.map(child => renderDomainNode(child, depth + 1)).join("");
    const itemHtml = node.items.filter(shouldShowItem).map(item => renderItemNode(item, depth + 1)).join("");
    const bodyHtml = childHtml + itemHtml || `<div class="tree-empty">아이템이 없습니다.</div>`;

    return `
      <div class="tree-domain-node" style="--tree-depth:${depth};">
        <div class="tree-domain-dropzone" data-tree-domain-dropzone="${escapeHtml(node.domain.id)}" data-drop-position="before"></div>
        <div class="tree-outline-head tree-group-head" data-tree-domain-row="${escapeHtml(node.domain.id)}" draggable="true">
          <button class="tree-toggle" data-tree-toggle="${escapeHtml(node.domain.id)}">${isOpen ? "▾" : "▸"}</button>
          <div class="tree-domain-main">
            <button class="tree-domain-link" data-tree-open-domain="${escapeHtml(node.domain.id)}">${escapeHtml(node.domain.name)}</button>
            <span class="tree-count">${escapeHtml(countLabel)}</span>
          </div>
          <div class="tree-domain-actions">
            <button class="tree-inline-btn" data-tree-add-child="${escapeHtml(node.domain.id)}">하위 추가</button>
            <button class="tree-inline-btn" data-tree-rename-domain="${escapeHtml(node.domain.id)}">이름변경</button>
            <button class="tree-item-delete tree-domain-delete" data-tree-delete-domain="${escapeHtml(node.domain.id)}" title="도메인 삭제">×</button>
          </div>
        </div>
        ${isOpen ? `<div class="tree-outline-body">${bodyHtml}</div>` : ""}
        <div class="tree-domain-dropzone" data-tree-domain-dropzone="${escapeHtml(node.domain.id)}" data-drop-position="after"></div>
      </div>
    `;
  };

  const treeHtml = getDomainTreeNodes().map(node => renderDomainNode(node, 0)).join("") || `<div class="tree-empty">조건에 맞는 이슈가 없습니다.</div>`;

  const container = document.getElementById("mainTree");
  if (container) {
    const allCollapsed = !key && state.domains.every(domain => !expandedIds.has(domain.id));
    container.classList.toggle("all-collapsed", allCollapsed);
    container.innerHTML = `
      <div class="tree-root-dropzone" data-tree-root-dropzone="start"></div>
      ${treeHtml}
      <div class="tree-root-dropzone" data-tree-root-dropzone="end"></div>
    `;
  }

  const summary = document.getElementById("treeSummaryText");
  if (summary) {
    summary.textContent = `도메인 ${domains.length}개 · 아이템 ${items.length}개`;
  }

  bindTreeExplorerEvents();
}

function toggleDomainOpen(domainId) {
  const current = new Set(state.ui.expandedDomainIds || []);
  if (current.has(domainId)) {
    current.delete(domainId);
  } else {
    current.add(domainId);
  }
  state.ui.expandedDomainIds = [...current];
  saveState();
  renderTreeExplorer();
}

function focusDomain(domainId) {
  toggleDomainOpen(domainId);
}

function toggleTreePreview(itemId) {
  state.ui.selectedItemId = itemId;
  state.ui.treePreviewItemId = state.ui.treePreviewItemId === itemId ? "" : itemId;
  saveState();
  renderTreeExplorer();
}

function deleteItem(itemId) {
  const item = getItemById(itemId);
  if (!item) return;

  const ok = confirm(`[${item.code}] ${item.title} 항목을 삭제하시겠습니까?
관련 코멘트와 이력도 함께 제거됩니다.`);
  if (!ok) return;

  state.items = state.items.filter(entry => entry.id !== itemId);
  state.comments = state.comments.filter(comment => comment.itemId !== itemId);
  state.history = state.history.filter(history => history.itemId !== itemId);

  if (state.ui.selectedItemId === itemId) {
    state.ui.selectedItemId = state.items[0]?.id || null;
  }
  if (state.ui.treePreviewItemId === itemId) {
    state.ui.treePreviewItemId = "";
  }

  saveState();
  renderAll();
}

function moveItemToDomain(itemId, targetDomainId) {
  const item = getItemById(itemId);
  const targetDomain = getDomainMap().get(targetDomainId);
  if (!item || !targetDomain || item.domain === targetDomainId) return;

  const beforeLabel = getDomainPathLabel(item.domain);
  item.domain = targetDomainId;
  item.updatedAt = nowIso();
  addHistory(item.id, "item.domainMoved", `${item.code} 항목 도메인 이동: ${beforeLabel} → ${getDomainPathLabel(targetDomainId)}`, "트리 이동");
  saveState();
  renderAll();
}

function clearTreeDragVisualState() {
  document.querySelectorAll(".dragging, .drag-over, .drop-before, .drop-inside, .drop-after").forEach(el => {
    el.classList.remove("dragging", "drag-over", "drop-before", "drop-inside", "drop-after");
  });
  document.querySelectorAll(".tree-domain-dropzone.active, .tree-root-dropzone.active").forEach(el => {
    el.classList.remove("active");
  });
}

function finalizeTreeDragState() {
  draggedTreeItemId = "";
  draggedTreeDomainId = "";
  clearTreeDragVisualState();
}

function runTreeDropAction(action) {
  try {
    action();
  } catch (error) {
    console.error(error);
    alert("드래그앤드롭 처리 중 오류가 발생했습니다. 다시 시도해 주세요.");
  } finally {
    finalizeTreeDragState();
  }
}

function bindTreeExplorerEvents() {
  document.querySelectorAll("[data-tree-toggle]").forEach(btn => {
    btn.onclick = () => toggleDomainOpen(btn.dataset.treeToggle);
  });

  document.querySelectorAll("[data-tree-open-domain]").forEach(btn => {
    btn.onclick = () => focusDomain(btn.dataset.treeOpenDomain);
  });

  document.querySelectorAll("[data-tree-preview-item]").forEach(btn => {
    btn.onclick = () => toggleTreePreview(btn.dataset.treePreviewItem);
  });

  document.querySelectorAll("[data-tree-go-item]").forEach(btn => {
    btn.onclick = () => selectItem(btn.dataset.treeGoItem, { openView: "itemsView" });
  });

  document.querySelectorAll("[data-tree-delete-item]").forEach(btn => {
    btn.onclick = (event) => {
      event.stopPropagation();
      deleteItem(btn.dataset.treeDeleteItem);
    };
  });

  document.querySelectorAll("[data-tree-add-child]").forEach(btn => {
    btn.onclick = (event) => {
      event.stopPropagation();
      createChildDomain(btn.dataset.treeAddChild);
    };
  });

  document.querySelectorAll("[data-tree-rename-domain]").forEach(btn => {
    btn.onclick = (event) => {
      event.stopPropagation();
      renameDomain(btn.dataset.treeRenameDomain);
    };
  });

  document.querySelectorAll("[data-tree-delete-domain]").forEach(btn => {
    btn.onclick = (event) => {
      event.stopPropagation();
      deleteDomainNode(btn.dataset.treeDeleteDomain);
    };
  });

  document.querySelectorAll("[data-tree-item-row]").forEach(row => {
    row.addEventListener("dragstart", event => {
      draggedTreeItemId = row.dataset.treeItemId || "";
      draggedTreeDomainId = "";
      row.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("application/x-tdw-item", row.dataset.treeItemId || "");
        event.dataTransfer.setData("text/plain", row.dataset.treeItemId || "");
      }
    });

    row.addEventListener("dragend", () => {
      finalizeTreeDragState();
    });

    row.addEventListener("dragover", event => {
      if (!draggedTreeDomainId) return;
      event.preventDefault();
      event.stopPropagation();
      row.classList.add("drop-inside");
    });

    row.addEventListener("dragleave", event => {
      event.stopPropagation();
      row.classList.remove("drop-inside");
    });

    row.addEventListener("drop", event => {
      if (!draggedTreeDomainId) return;
      event.preventDefault();
      event.stopPropagation();
      row.classList.remove("drop-inside");
      const targetDomainId = row.dataset.treeItemDomain || "";
      runTreeDropAction(() => {
        if (!targetDomainId) return;
        moveDomainNode(draggedTreeDomainId, targetDomainId, getChildDomains(targetDomainId).length);
      });
    });
  });

  document.querySelectorAll("[data-tree-domain-row]").forEach(row => {
    row.addEventListener("dragstart", event => {
      draggedTreeDomainId = row.dataset.treeDomainRow || "";
      draggedTreeItemId = "";
      row.classList.add("dragging");
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("application/x-tdw-domain", row.dataset.treeDomainRow || "");
        event.dataTransfer.setData("text/plain", row.dataset.treeDomainRow || "");
      }
    });

    row.addEventListener("dragend", () => {
      finalizeTreeDragState();
    });

    row.addEventListener("dragover", event => {
      event.preventDefault();
      event.stopPropagation();

      if (draggedTreeItemId) {
        row.classList.add("drag-over");
        return;
      }
      if (!draggedTreeDomainId) return;
      const rect = row.getBoundingClientRect();
      const ratio = (event.clientY - rect.top) / Math.max(rect.height, 1);
      const position = ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside";
      row.classList.remove("drop-before", "drop-inside", "drop-after");
      row.classList.add(`drop-${position}`);
    });

    row.addEventListener("dragleave", event => {
      event.stopPropagation();
      row.classList.remove("drag-over", "drop-before", "drop-inside", "drop-after");
    });

    row.addEventListener("drop", event => {
      event.preventDefault();
      event.stopPropagation();

      const domainId = row.dataset.treeDomainRow || "";

      if (draggedTreeItemId) {
        row.classList.remove("drag-over");
        runTreeDropAction(() => {
          if (!domainId) return;
          moveItemToDomain(draggedTreeItemId, domainId);
        });
        return;
      }

      if (!draggedTreeDomainId) return;
      const rect = row.getBoundingClientRect();
      const ratio = (event.clientY - rect.top) / Math.max(rect.height, 1);
      const position = ratio < 0.28 ? "before" : ratio > 0.72 ? "after" : "inside";
      row.classList.remove("drop-before", "drop-inside", "drop-after");
      runTreeDropAction(() => {
        if (!domainId) return;
        applyDomainDropPosition(draggedTreeDomainId, domainId, position);
      });
    });
  });

  document.querySelectorAll("[data-tree-domain-dropzone]").forEach(zone => {
    zone.addEventListener("dragover", event => {
      if (!draggedTreeDomainId) return;
      event.preventDefault();
      event.stopPropagation();
      zone.classList.add("active");
    });

    zone.addEventListener("dragleave", event => {
      event.stopPropagation();
      zone.classList.remove("active");
    });

    zone.addEventListener("drop", event => {
      if (!draggedTreeDomainId) return;
      event.preventDefault();
      event.stopPropagation();
      zone.classList.remove("active");
      const targetDomainId = zone.dataset.treeDomainDropzone || "";
      const position = zone.dataset.dropPosition || "after";
      runTreeDropAction(() => {
        if (!targetDomainId) return;
        applyDomainDropPosition(draggedTreeDomainId, targetDomainId, position);
      });
    });
  });

  document.querySelectorAll("[data-tree-root-dropzone]").forEach(zone => {
    zone.addEventListener("dragover", event => {
      if (!draggedTreeDomainId) return;
      event.preventDefault();
      event.stopPropagation();
      zone.classList.add("active");
    });

    zone.addEventListener("dragleave", event => {
      event.stopPropagation();
      zone.classList.remove("active");
    });

    zone.addEventListener("drop", event => {
      if (!draggedTreeDomainId) return;
      event.preventDefault();
      event.stopPropagation();
      zone.classList.remove("active");
      const roots = getChildDomains("");
      runTreeDropAction(() => {
        moveDomainNode(draggedTreeDomainId, "", zone.dataset.treeRootDropzone === "start" ? 0 : roots.length);
      });
    });
  });
}

function saveSelectedItem() {
  const item = getItemById(state.ui.selectedItemId);
  const refs = getDetailRefs();
  if (!item || !refs.title) return;

  if (item.status === "확정" || item.isLocked) {
    alert("확정된 항목은 직접 수정할 수 없습니다. 확정을 해제하거나 변경 요청 항목을 새로 생성해 주세요.");
    return;
  }

  const title = refs.title.value.trim();
  if (!title) {
    alert("제목을 입력해 주세요.");
    return;
  }

  const before = clone(item);

  item.title = title;
  item.domain = refs.domain.value;
  item.priority = refs.priority.value;
  item.status = normalizeStatusValue(refs.status.value);
  item.owner = refs.owner.value.trim();
  item.dueDate = refs.dueDate.value;
  item.description = refs.description.value.trim();
  item.clientResponse = refs.clientResponse.value.trim();
  item.finalConfirmedValue = refs.finalConfirmedValue.value.trim();
  item.isLocked = item.status === "확정";
  item.updatedAt = nowIso();

  if (JSON.stringify(before) !== JSON.stringify(item)) {
    addHistory(item.id, "item.updated", `${item.code} 항목을 수정`, "틴토랩 사용자");
  }

  saveState();
  renderAll();
}

function toggleLockSelectedItem() {
  const item = getItemById(state.ui.selectedItemId);
  if (!item) return;

  if (item.status !== "확정") {
    if (item.status !== "방향합의") {
      alert("확정 처리 전 상태를 먼저 방향합의로 맞춰 주세요.");
      return;
    }

    item.isLocked = true;
    item.status = "확정";
    addHistory(item.id, "item.locked", `${item.code} 항목을 최종 기준으로 확정`, "틴토랩 사용자");
  } else {
    item.isLocked = false;
    item.status = "방향합의";
    addHistory(item.id, "item.unlocked", `${item.code} 항목 확정 해제`, "틴토랩 사용자");
  }

  item.updatedAt = nowIso();
  saveState();
  renderAll();
}

function addComment() {
  const item = getItemById(state.ui.selectedItemId);
  const refs = getDetailRefs();
  if (!item || !refs.commentAuthor || !refs.commentBody) return;

  const author = refs.commentAuthor.value.trim();
  const body = refs.commentBody.value.trim();

  if (!author || !body) {
    alert("작성자와 코멘트 내용을 입력해 주세요.");
    return;
  }

  state.comments.push({
    id: uniqueId("C"),
    itemId: item.id,
    author,
    body,
    createdAt: nowIso()
  });

  addHistory(item.id, "comment.added", `${item.code} 항목에 코멘트 추가`, author);
  refs.commentBody.value = "";
  saveState();
  renderDetail();
  renderRecentHistory();
}

function openModal() {

  document.getElementById("modalOverlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.add("hidden");
}

function getNextCode(type) {
  const prefix = type === "information_request"
    ? "IR"
    : type === "decision"
      ? "D"
      : type === "review"
        ? "R"
        : type === "issue"
          ? "ISS"
          : "CR";

  const nums = state.items
    .filter(item => item.code.startsWith(prefix))
    .map(item => Number((item.code.split("-")[1] || "0")))
    .filter(num => !Number.isNaN(num));

  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

function setManagedDomainId(domainId) {
  state.ui.treeManageDomainId = domainId || "";
  saveState();
}

function moveDomainPosition() {
  return;
}

function deleteManagedDomain() {
  return;
}

function createItem() {
  const type = document.getElementById("newType").value;
  const domain = document.getElementById("newDomain").value;
  const priority = document.getElementById("newPriority").value;
  const owner = document.getElementById("newOwner").value.trim();
  const dueDate = document.getElementById("newDueDate").value;
  const title = document.getElementById("newTitle").value.trim();
  const description = document.getElementById("newDescription").value.trim();

  if (!title) {
    alert("제목을 입력해 주세요.");
    return;
  }

  const code = getNextCode(type);

  const item = {
    id: code,
    code,
    type,
    domain,
    title,
    description,
    priority,
    status: "논의",
    owner,
    dueDate,
    clientResponse: "",
    finalConfirmedValue: "",
    isLocked: false,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  state.items.push(item);
  state.ui.selectedItemId = item.id;
  addHistory(item.id, "item.created", `${item.code} 항목 생성`, "틴토랩 사용자");
  saveState();
  closeModal();
  clearModalInputs();
  switchView("itemsView");
  renderAll();
}

function clearModalInputs() {
  document.getElementById("newType").value = "information_request";
  document.getElementById("newDomain").value = getDefaultDomainId();
  document.getElementById("newPriority").value = "P1";
  document.getElementById("newOwner").value = "";
  document.getElementById("newDueDate").value = "";
  document.getElementById("newTitle").value = "";
  document.getElementById("newDescription").value = "";
}

function createDomain(name, options = {}) {
  const { silent = false, parentId = "" } = options;
  const value = normalizeTextValue(name);

  if (!value) {
    if (!silent) alert("도메인 이름을 입력해 주세요.");
    return null;
  }

  const existing = findDomainByAny(value);
  if (existing) {
    if (!state.ui.expandedDomainIds.includes(existing.id)) {
      state.ui.expandedDomainIds.push(existing.id);
    }
    saveState();
    if (!silent) {
      const input = document.getElementById("newDomainInput");
      if (input) input.value = "";
      renderAll();
    }
    return existing;
  }

  const domain = {
    id: makeDomainId(value),
    name: value,
    parentId: parentId || "",
    order: getChildDomains(parentId || "").length
  };

  state.domains.push(domain);
  normalizeDomainOrders();

  if (parentId && !state.ui.expandedDomainIds.includes(parentId)) {
    state.ui.expandedDomainIds.push(parentId);
  }
  if (!state.ui.expandedDomainIds.includes(domain.id)) {
    state.ui.expandedDomainIds.push(domain.id);
  }

  saveState();

  if (!silent) {
    const input = document.getElementById("newDomainInput");
    if (input) input.value = "";
    renderAll();
  }

  return domain;
}

function renameDomain(domainId) {
  const domain = getDomainMap().get(domainId);
  if (!domain) return;
  const nextName = prompt("도메인 이름을 입력해 주세요.", domain.name);
  const value = normalizeTextValue(nextName);
  if (!value || value === domain.name) return;

  const collision = (state.domains || []).find(entry => entry.id !== domainId && normalizeKey(entry.name) === normalizeKey(value));
  if (collision) {
    alert("같은 이름의 도메인이 이미 있습니다.");
    return;
  }

  domain.name = value;
  saveState();
  renderAll();
}

function deleteDomainNode(domainId) {
  const domain = getDomainMap().get(domainId);
  if (!domain) return;

  if ((state.domains || []).length <= 1) {
    alert("도메인은 최소 1개 이상 있어야 하므로 마지막 도메인은 삭제할 수 없습니다.");
    return;
  }

  const childDomains = getChildDomains(domain.id);
  const directItems = state.items.filter(item => item.domain === domain.id);

  let fallbackDomainId = domain.parentId || "";
  if (!fallbackDomainId) {
    fallbackDomainId = childDomains[0]?.id || getFallbackDomainId(domain.id);
  }
  const fallbackLabel = fallbackDomainId ? getDomainPathLabel(fallbackDomainId) : "-";

  const ok = confirm(`정말로 [${domain.name}] 도메인을 삭제하시겠습니까?

직속 하위 도메인은 상위 레벨로 승격되며, 직속 아이템 ${directItems.length}개는 [${fallbackLabel}]로 이동됩니다.`);
  if (!ok) return;

  childDomains.forEach(child => {
    child.parentId = domain.parentId || "";
  });

  directItems.forEach(item => {
    if (fallbackDomainId) {
      item.domain = fallbackDomainId;
      item.updatedAt = nowIso();
      addHistory(item.id, "item.domainReassigned", `${item.code} 항목 도메인 자동 이동: ${domain.name} → ${fallbackLabel}`, "도메인 삭제");
    }
  });

  state.domains = state.domains.filter(entry => entry.id !== domainId);
  state.ui.expandedDomainIds = (state.ui.expandedDomainIds || []).filter(id => id !== domainId);
  normalizeDomainOrders();
  saveState();
  renderAll();
}

function createChildDomain(parentDomainId) {
  const parent = getDomainMap().get(parentDomainId);
  if (!parent) return;
  const name = prompt(`[${parent.name}] 하위 도메인 이름을 입력해 주세요.`);
  if (!normalizeTextValue(name)) return;
  createDomain(name, { parentId: parentDomainId });
}

function toggleAllDomains(expand) {
  state.ui.expandedDomainIds = expand ? getDomains().map(domain => domain.id) : [];
  saveState();
  renderTreeExplorer();
}

function applyDomainDropPosition(dragDomainId, targetDomainId, position) {
  if (!dragDomainId || !targetDomainId || dragDomainId === targetDomainId) return;

  const targetDomain = getDomainMap().get(targetDomainId);
  if (!targetDomain) return;

  if (position === "inside") {
    moveDomainNode(dragDomainId, targetDomain.id, getChildDomains(targetDomain.id).length);
    return;
  }

  const parentId = targetDomain.parentId || "";
  const siblings = getChildDomains(parentId).filter(entry => entry.id !== dragDomainId);
  const targetIndex = siblings.findIndex(entry => entry.id === targetDomainId);
  if (targetIndex < 0) return;
  moveDomainNode(dragDomainId, parentId, position === "before" ? targetIndex : targetIndex + 1);
}
function exportJson() {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tdw-prototype-export-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function resetData() {
  const ok = confirm("샘플데이터를 초기화하시겠습니까?");
  if (!ok) return;
  state = createSeedData();
  saveState();
  renderAll();
}

function parseDelimited(text, delimiter) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  row.push(cell);
  rows.push(row);

  return rows
    .map(eachRow => eachRow.map(value => String(value ?? "").trim()))
    .filter(eachRow => eachRow.some(value => value !== ""));
}

function guessDelimiter(text) {
  const head = text.split(/\r?\n/).slice(0, 5).join("\n");
  const tabCount = (head.match(/\t/g) || []).length;
  const commaCount = (head.match(/,/g) || []).length;
  const semicolonCount = (head.match(/;/g) || []).length;

  if (tabCount > 0) return "\t";
  if (semicolonCount > commaCount) return ";";
  return ",";
}

function hasHeaderRow(firstRow) {
  return firstRow.some(cell => !!resolveHeaderKey(cell));
}

function mapRowByHeader(headerRow, row) {
  const mapped = {};
  headerRow.forEach((headerCell, idx) => {
    const key = resolveHeaderKey(headerCell);
    if (key && !(key in mapped)) {
      mapped[key] = row[idx] ?? "";
    }
  });
  return mapped;
}

function mapRowByFixedOrder(row) {
  const mapped = {};
  FIXED_IMPORT_ORDER.forEach((key, idx) => {
    mapped[key] = row[idx] ?? "";
  });
  return mapped;
}

function getImportDomainPreviewLabel(domainValue) {
  const existing = findDomainByAny(domainValue);
  if (existing) return existing.name;

  const aliasId = fromAlias(domainValue, DOMAIN_VALUE_ALIASES, "");
  if (aliasId) {
    return BASE_DOMAIN_DEFS.find(domain => domain.id === aliasId)?.name || aliasId;
  }

  return normalizeTextValue(domainValue) || getDomainLabel(getDefaultDomainId());
}

function normalizeImportRecord(raw, rowNo) {
  const type = fromAlias(raw.type, TYPE_VALUE_ALIASES, "information_request");
  const domain = normalizeTextValue(raw.domain);
  const title = String(raw.title ?? "").trim();
  const description = String(raw.description ?? "").trim();
  const priorityRaw = String(raw.priority ?? "").trim().toUpperCase();
  const priority = ["P0", "P1", "P2"].includes(priorityRaw) ? priorityRaw : "P1";
  const status = normalizeStatusValue(raw.status);
  const owner = String(raw.owner ?? "").trim();
  const dueDate = normalizeDateInput(raw.dueDate);
  const clientResponse = String(raw.clientResponse ?? "").trim();
  const finalConfirmedValue = String(raw.finalConfirmedValue ?? "").trim();
  const code = String(raw.code ?? "").trim().toUpperCase();

  if (!title) {
    return {
      valid: false,
      rowNo,
      message: "제목(title)이 비어 있습니다."
    };
  }

  return {
    valid: true,
    rowNo,
    itemData: {
      code,
      type,
      domain,
      title,
      description,
      priority,
      status,
      owner,
      dueDate,
      clientResponse,
      finalConfirmedValue,
      isLocked: status === "확정"
    }
  };
}

function prepareImport(text) {
  const delimiter = guessDelimiter(text);
  const rows = parseDelimited(text, delimiter);

  if (!rows.length) {
    return {
      results: [],
      actionableCount: 0,
      createCount: 0,
      updateCount: 0,
      skipCount: 0,
      errorCount: 1,
      errorMessage: "읽을 수 있는 행이 없습니다."
    };
  }

  const headerDetected = hasHeaderRow(rows[0]);
  const dataRows = headerDetected ? rows.slice(1) : rows;
  const results = [];
  const batchCodes = new Set();

  dataRows.forEach((row, index) => {
    const rowNo = headerDetected ? index + 2 : index + 1;
    const raw = headerDetected ? mapRowByHeader(rows[0], row) : mapRowByFixedOrder(row);
    const normalized = normalizeImportRecord(raw, rowNo);

    if (!normalized.valid) {
      results.push({
        rowNo,
        action: "error",
        message: normalized.message,
        title: "",
        code: String(raw.code ?? "").trim()
      });
      return;
    }

    const data = normalized.itemData;
    const codeKey = normalizeKey(data.code);

    if (codeKey) {
      if (batchCodes.has(codeKey)) {
        results.push({
          rowNo,
          action: "error",
          message: "같은 code가 같은 업로드 안에 중복되었습니다.",
          title: data.title,
          code: data.code,
          itemData: data
        });
        return;
      }
      batchCodes.add(codeKey);
    }

    const existing = data.code ? getItemByCode(data.code) : null;

    if (existing && (existing.status === "확정" || existing.isLocked)) {
      results.push({
        rowNo,
        action: "skip",
        message: "확정된 항목이어서 건너뜁니다.",
        title: data.title,
        code: data.code,
        itemData: data,
        existingId: existing.id
      });
      return;
    }

    results.push({
      rowNo,
      action: existing ? "update" : "create",
      message: existing ? "기존 code 일치 → 업데이트" : "신규 생성",
      title: data.title,
      code: data.code,
      itemData: data,
      existingId: existing ? existing.id : ""
    });
  });

  const actionableCount = results.filter(row => row.action === "create" || row.action === "update").length;
  const createCount = results.filter(row => row.action === "create").length;
  const updateCount = results.filter(row => row.action === "update").length;
  const skipCount = results.filter(row => row.action === "skip").length;
  const errorCount = results.filter(row => row.action === "error").length;

  return {
    results,
    actionableCount,
    createCount,
    updateCount,
    skipCount,
    errorCount,
    errorMessage: ""
  };
}

function actionPill(action) {
  if (action === "create") return pill("신규", "success");
  if (action === "update") return pill("업데이트", "primary");
  if (action === "skip") return pill("건너뜀", "warn");
  return pill("오류", "danger");
}

function renderImportPreview(parsed) {
  const wrap = document.getElementById("importPreview");
  const summary = `
    <div class="import-summary">
      ${pill(`실행 가능 ${parsed.actionableCount}`, parsed.actionableCount ? "success" : "dark")}
      ${pill(`신규 ${parsed.createCount}`, parsed.createCount ? "success" : "dark")}
      ${pill(`업데이트 ${parsed.updateCount}`, parsed.updateCount ? "primary" : "dark")}
      ${pill(`건너뜀 ${parsed.skipCount}`, parsed.skipCount ? "warn" : "dark")}
      ${pill(`오류 ${parsed.errorCount}`, parsed.errorCount ? "danger" : "dark")}
    </div>
  `;

  if (parsed.errorMessage) {
    wrap.innerHTML = `${summary}<div class="muted">${escapeHtml(parsed.errorMessage)}</div>`;
    return;
  }

  const rows = parsed.results.slice(0, 50).map(row => `
    <tr>
      <td>${row.rowNo}</td>
      <td>${actionPill(row.action)}</td>
      <td>${escapeHtml(row.code || "-")}</td>
      <td>${escapeHtml(row.itemData?.type ? TYPE_LABELS[row.itemData.type] : "-")}</td>
      <td>${escapeHtml(row.itemData?.domain ? getImportDomainPreviewLabel(row.itemData.domain) : "-")}</td>
      <td>${escapeHtml(row.itemData?.title || row.title || "-")}</td>
      <td>${escapeHtml(row.itemData?.status ? STATUS_LABELS[row.itemData.status] : "-")}</td>
      <td>${escapeHtml(row.message || "-")}</td>
    </tr>
  `).join("");

  const note = parsed.results.length > 50
    ? `<div class="muted" style="margin-top:10px;">미리보기는 처음 50행까지만 표시했습니다. 전체 실행 대상은 요약 수치를 기준으로 처리됩니다.</div>`
    : "";

  wrap.innerHTML = `
    ${summary}
    <table class="import-table">
      <thead>
        <tr>
          <th>행</th>
          <th>결과</th>
          <th>code</th>
          <th>유형</th>
          <th>도메인</th>
          <th>제목</th>
          <th>상태</th>
          <th>비고</th>
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="8">표시할 데이터가 없습니다.</td></tr>`}</tbody>
    </table>
    ${note}
  `;
}

function openImportModal() {
  document.getElementById("importOverlay").classList.remove("hidden");
}

function closeImportModal() {
  document.getElementById("importOverlay").classList.add("hidden");
}

function resetImportUi() {
  pendingImportRows = [];
  document.getElementById("importFileInput").value = "";
  document.getElementById("excelPasteArea").value = "";
  document.getElementById("importExecuteBtn").disabled = true;
  document.getElementById("importPreview").innerHTML = `<div class="muted">미리보기를 실행하면 등록/업데이트/건너뜀 결과가 표시됩니다.</div>`;
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
    reader.readAsText(file, "utf-8");
  });
}

async function getImportSourceText() {
  const file = document.getElementById("importFileInput").files?.[0];
  const pasted = document.getElementById("excelPasteArea").value.trim();

  if (file) {
    return await readFileAsText(file);
  }

  if (pasted) {
    return pasted;
  }

  throw new Error("CSV 파일을 선택하거나 엑셀 데이터를 붙여넣어 주세요.");
}

async function previewImport() {
  try {
    const text = await getImportSourceText();
    const parsed = prepareImport(text);
    pendingImportRows = parsed.results;
    renderImportPreview(parsed);
    document.getElementById("importExecuteBtn").disabled = parsed.actionableCount === 0;
  } catch (error) {
    pendingImportRows = [];
    document.getElementById("importExecuteBtn").disabled = true;
    document.getElementById("importPreview").innerHTML = `<div class="muted">${escapeHtml(error.message || "미리보기에 실패했습니다.")}</div>`;
  }
}

function applyImportedCreate(data) {
  const resolvedDomainId = resolveDomainValue(data.domain, { createIfMissing: true });
  const code = data.code || getNextCode(data.type);
  const item = {
    id: code,
    code,
    type: data.type,
    domain: resolvedDomainId,
    title: data.title,
    description: data.description,
    priority: data.priority,
    status: data.status,
    owner: data.owner,
    dueDate: data.dueDate,
    clientResponse: data.clientResponse,
    finalConfirmedValue: data.finalConfirmedValue,
    isLocked: data.status === "확정",
    createdAt: nowIso(),
    updatedAt: nowIso()
  };

  state.items.push(item);
  addHistory(item.id, "item.bulkCreated", `${item.code} 항목을 엑셀 일괄등록으로 생성`, "엑셀 일괄등록");
  return item;
}

function applyImportedUpdate(item, data) {
  item.type = data.type;
  item.domain = resolveDomainValue(data.domain, { createIfMissing: true });
  item.title = data.title;
  item.description = data.description;
  item.priority = data.priority;
  item.status = data.status;
  item.owner = data.owner;
  item.dueDate = data.dueDate;
  item.clientResponse = data.clientResponse;
  item.finalConfirmedValue = data.finalConfirmedValue;
  item.isLocked = data.status === "확정";
  item.updatedAt = nowIso();

  addHistory(item.id, "item.bulkUpdated", `${item.code} 항목을 엑셀 일괄등록으로 업데이트`, "엑셀 일괄등록");
  return item;
}

function executeImport() {
  const actionable = pendingImportRows.filter(row => row.action === "create" || row.action === "update");
  if (!actionable.length) {
    alert("실행 가능한 행이 없습니다. 먼저 미리보기를 확인해 주세요.");
    return;
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let lastTouchedId = "";

  actionable.forEach(row => {
    const data = row.itemData;
    if (!data) {
      skipped++;
      return;
    }

    if (row.action === "update") {
      const item = getItemById(row.existingId);
      if (!item || item.status === "확정" || item.isLocked) {
        skipped++;
        return;
      }
      const updatedItem = applyImportedUpdate(item, data);
      updated++;
      lastTouchedId = updatedItem.id;
      return;
    }

    if (row.action === "create") {
      const createdItem = applyImportedCreate(data);
      created++;
      lastTouchedId = createdItem.id;
    }
  });

  saveState();

  if (lastTouchedId) {
    state.ui.selectedItemId = lastTouchedId;
    state.ui.activeView = "itemsView";
    saveState();
  }

  alert(`일괄등록 완료\n신규 생성: ${created}\n업데이트: ${updated}\n건너뜀: ${skipped}`);
  closeImportModal();
  resetImportUi();
  renderAll();
  switchView("itemsView");
}

function csvEscape(value) {
  const stringValue = String(value ?? "");
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function downloadTemplateCsv() {
  const headers = [
    "코드",
    "유형",
    "도메인",
    "제목",
    "설명",
    "우선순위",
    "상태",
    "담당자",
    "마감일",
    "고객회신값",
    "최종확인값"
  ];

  const rows = [
    headers,
    ["IR-010", "고객정보 요청", "예약", "상품 마스터 수령", "객실/골프/식음 기준표 수령", "P0", "논의", "설해원 운영팀", "2026-03-25", "", ""],
    ["D-010", "의사결정", "외부연동", "PMS 책임경계 확정", "예약엔진과 PMS 역할 구분", "P0", "방향합의", "설해원 전산팀", "2026-03-26", "조회/생성 가능", "운영 시스템으로 한정"]
  ];

  const csv = "\uFEFF" + rows.map(row => row.map(csvEscape).join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tdw-import-template.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function bindEvents() {
  document.querySelectorAll(".nav-link").forEach(btn => {
    btn.onclick = () => switchView(btn.dataset.view);
  });

  document.querySelectorAll(".workspace-tab").forEach(btn => {
    btn.onclick = () => {
      state.ui.activeWorkspace = btn.dataset.workspace;
      saveState();
      renderWorkspace();
    };
  });

  document.getElementById("newItemBtn").onclick = openModal;
  document.getElementById("closeModalBtn").onclick = closeModal;
  document.getElementById("modalOverlay").addEventListener("click", event => {
    if (event.target.id === "modalOverlay") closeModal();
  });

  document.getElementById("bulkImportBtn").onclick = openImportModal;
  document.getElementById("closeImportModalBtn").onclick = () => {
    closeImportModal();
    resetImportUi();
  };
  document.getElementById("importOverlay").addEventListener("click", event => {
    if (event.target.id === "importOverlay") {
      closeImportModal();
      resetImportUi();
    }
  });

  document.getElementById("downloadTemplateBtn").onclick = downloadTemplateCsv;
  document.getElementById("importPreviewBtn").onclick = previewImport;
  document.getElementById("importExecuteBtn").onclick = executeImport;

  document.getElementById("createItemBtn").onclick = createItem;
  document.getElementById("exportBtn").onclick = exportJson;
  document.getElementById("resetBtn").onclick = resetData;
  document.getElementById("saveItemBtn").onclick = () => saveSelectedItem();
  document.getElementById("lockToggleBtn").onclick = () => toggleLockSelectedItem();
  document.getElementById("addCommentBtn").onclick = () => addComment();

  document.getElementById("detailTitle").addEventListener("input", () => autoResizeDetailTitle());

  document.getElementById("searchInput").addEventListener("input", event => {
    setSearchQuery("items", event.target.value);
  });

  document.getElementById("treeSearchInput").addEventListener("input", event => {
    setSearchQuery("tree", event.target.value);
  });

  ["typeFilter", "domainFilter", "statusFilter"].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("input", renderItems);
    el.addEventListener("change", renderItems);
  });

  document.getElementById("createDomainBtn").onclick = () => {
    const input = document.getElementById("newDomainInput");
    createDomain(input.value);
  };

  document.getElementById("newDomainInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      createDomain(event.currentTarget.value);
    }
  });
  document.getElementById("collapseAllDomainsBtn").onclick = () => toggleAllDomains(false);
  document.getElementById("expandAllDomainsBtn").onclick = () => toggleAllDomains(true);
}

function renderAll() {
  ensureExpandedDomainState();
  buildFilterOptions();
  syncSearchInputs();
  renderStats();
  renderUrgentList();
  renderDomainProgress();
  renderRecentHistory();
  renderWorkspace();
  renderItems();
  renderTreeExplorer();
  switchView(state.ui.activeView || "dashboardView");
}

function init() {
  bindEvents();
  renderAll();
}

init();

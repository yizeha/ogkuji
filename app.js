(() => {
  "use strict";

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  // =====================================
  // SUPABASE 설정
  // =====================================
  const SUPABASE_URL = "https://irqsagfsngctzaexxsqy.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_uzb2cxV8iHHGLCwbregX_g_zyJDqYt1";

  // =====================================
  // 로컬 백업 키
  // =====================================
  const LOCAL_MASTER_KEY = "kuji_master_local_backup_v4";
  const LOCAL_LAST_BOARD_KEY = "kuji_last_board_id_v4";

  // =====================================
  // DB row key
  // kuji_state 테이블에 board_id='master_store' 한 줄로 전체 저장
  // =====================================
  const REMOTE_MASTER_ROW_KEY = "master_store";

  const CONFIG = {
    defaultTotalTickets: 30,
    flashyTierMax: 3,
    defaultPaperImage: "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/paper.png",
    defaultCoverPaperImage: "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/paper.png",
    defaultEmptyResultImage: "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/logos/oji_goods.png",
    defaultBgImage: "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/bg.png",
    defaultBoardLogo: "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/logos/logo_board.png",
    defaultTopLogo: "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/logos/logo_top.png",
    useFanfare: true,
    drawDelayMs: 1000,
    defaultMileagePerOji: 1000,
    saveDebounceMs: 700,
    maxHistory: 20,
    maxLogs: 100,
    maxMemberLogs: 200,
  };

  const DB = {
    client: null,
    ready: false,
    saving: false,
    queued: false,
    timer: null,
    lastSavedAt: 0,
  };

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function uid() {
    try {
      return crypto.randomUUID();
    } catch {
      return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
  }

  function deepClone(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return obj;
    }
  }

  function shuffle(arr) {
    const clone = [...arr];
    for (let i = clone.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clone[i], clone[j]] = [clone[j], clone[i]];
    }
    return clone;
  }

  function nowTs() {
    return Date.now();
  }

  function nowText() {
    return new Date().toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function formatWon(v) {
    return `${Number(v || 0).toLocaleString("ko-KR")}원`;
  }

  function tierLabelToTierValue(label) {
    const map = { "A상": 1, "B상": 2, "C상": 3, "D상": 4, "E상": 5 };
    return map[label] || 999;
  }

  function createDefaultOjiPrize() {
    return {
      id: "OJI",
      tier: 99,
      label: "오지상",
      name: "마일리지 적립",
      stock: 99999,
      total: 99999,
      img: CONFIG.defaultEmptyResultImage,
      numbers: [],
    };
  }

  function createDefaultSettings() {
    return {
      totalTickets: CONFIG.defaultTotalTickets,
      kujiTitle: "오지상 쿠지",
      lastOnePrize: null,
      priceText: "14,000원",
      accountText: "기업은행 153-084786-01019 양*준",
      soundVolume: 0.35,
      soundMuted: false,
    };
  }

  function createDefaultMembers() {
    return {
      selectedId: null,
      list: [],
    };
  }

  function createBoardMeta(name = "기본 쿠지판") {
    return {
      id: uid(),
      name,
      bgImage: CONFIG.defaultBgImage,
      paperImage: CONFIG.defaultPaperImage,
    };
  }

  function createDefaultBoard(name = "기본 쿠지판") {
    return {
      meta: createBoardMeta(name),
      state: {
        mode: "broadcast",
        used: {},
        selectedNumbers: [],
        logs: [],
        history: [],
        queue: [],
        settings: createDefaultSettings(),
        prizes: [createDefaultOjiPrize()],
        ticketResults: {},
      },
    };
  }

  function createInitialBoards() {
    const base = createDefaultBoard("기본 쿠지판");
    const mha = createDefaultBoard("나히아 쿠지판");
    const kimetsu = createDefaultBoard("귀멸 쿠지판");
    const onepiece = createDefaultBoard("원피스 쿠지판");
    const aot = createDefaultBoard("진격 쿠지판");

    base.meta.bgImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/bg.png";
    base.meta.paperImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/paper.png";

    mha.meta.bgImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/bg_mha.png";
    mha.meta.paperImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/paper_mha.png";

    kimetsu.meta.bgImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/bg_kimetsu.png";
    kimetsu.meta.paperImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/paper_kimetsu.png";

    onepiece.meta.bgImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/bg_onepiece.png";
    onepiece.meta.paperImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/paper_onepiece.png";

    aot.meta.bgImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/bg_aot.png";
    aot.meta.paperImage = "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/boards/paper_aot.png";

    return [base, mha, kimetsu, onepiece, aot];
  }

  function normalizePrize(p) {
    const label = String(p?.label || "").trim() || "기타";
    return {
      id: p?.id || uid(),
      tier: Number.isFinite(Number(p?.tier)) ? Number(p.tier) : tierLabelToTierValue(label),
      label,
      name: String(p?.name || "").trim() || "상품",
      stock: Math.max(0, Number(p?.stock || 0)),
      total: typeof p?.total === "number" ? p.total : Math.max(0, Number(p?.stock || 0)),
      img: p?.img || CONFIG.defaultEmptyResultImage,
      numbers: Array.isArray(p?.numbers) ? p.numbers.map(Number).filter(Number.isFinite) : [],
    };
  }

  function normalizeLastOnePrize(p) {
    if (!p) return null;
    return {
      label: "LAST ONE",
      name: String(p.name || "").trim() || "라스트원 상품",
      desc: String(p.desc || "").trim() || "마지막 뽑기 오픈 시 보너스로 지급",
      img: p.img || CONFIG.defaultEmptyResultImage,
      claimed: !!p.claimed,
    };
  }

  function normalizeMembers(payload) {
    const base = payload || createDefaultMembers();
    if (!Array.isArray(base.list)) base.list = [];
    if (!("selectedId" in base)) base.selectedId = null;

    base.list = base.list.map((m) => ({
      id: m.id || uid(),
      name: String(m.name || "").trim(),
      mileage: Number(m.mileage || 0),
      mileageLogs: Array.isArray(m.mileageLogs) ? m.mileageLogs : [],
      winLogs: Array.isArray(m.winLogs) ? m.winLogs : [],
      createdAt: m.createdAt || nowTs(),
    })).filter((m) => m.name);

    return base;
  }

  function normalizeBoardState(payload) {
    const settings = payload?.settings || createDefaultSettings();
    if (!Number.isFinite(settings.totalTickets) || settings.totalTickets < 1) {
      settings.totalTickets = CONFIG.defaultTotalTickets;
    }
    settings.kujiTitle = settings.kujiTitle || "오지상 쿠지";
    settings.priceText = settings.priceText || "14,000원";
    settings.accountText = settings.accountText || "기업은행 153-084786-01019 양*준";
    settings.lastOnePrize = normalizeLastOnePrize(settings.lastOnePrize);

    if (typeof settings.soundVolume !== "number") settings.soundVolume = 0.35;
    if (typeof settings.soundMuted !== "boolean") settings.soundMuted = false;

    let prizes = Array.isArray(payload?.prizes) && payload.prizes.length
      ? payload.prizes.map(normalizePrize)
      : [createDefaultOjiPrize()];

    if (!prizes.find((p) => p.id === "OJI")) prizes.push(createDefaultOjiPrize());
    prizes = prizes.sort((a, b) => a.tier - b.tier);

    return {
      mode: payload?.mode || "broadcast",
      used: payload?.used || {},
      selectedNumbers: Array.isArray(payload?.selectedNumbers) ? payload.selectedNumbers.map(Number) : [],
      logs: Array.isArray(payload?.logs) ? payload.logs : [],
      history: [],
      queue: Array.isArray(payload?.queue) ? payload.queue : [],
      settings,
      prizes,
      ticketResults: payload?.ticketResults || {},
    };
  }

  function normalizeStore(raw) {
    const fallbackBoards = createInitialBoards();
    const safe = {
      currentBoardId: raw?.currentBoardId || fallbackBoards[0].meta.id,
      boards: {},
      members: normalizeMembers(raw?.members),
    };

    if (raw?.boards && typeof raw.boards === "object" && Object.keys(raw.boards).length) {
      Object.values(raw.boards).forEach((boardObj) => {
        if (!boardObj?.meta?.id) return;
        safe.boards[boardObj.meta.id] = {
          meta: {
            id: boardObj.meta.id,
            name: boardObj.meta.name || "쿠지판",
            bgImage: boardObj.meta.bgImage || CONFIG.defaultBgImage,
            paperImage: boardObj.meta.paperImage || CONFIG.defaultPaperImage,
          },
          state: normalizeBoardState(boardObj.state || {}),
        };
      });
    }

    if (!Object.keys(safe.boards).length) {
      fallbackBoards.forEach((boardObj) => {
        safe.boards[boardObj.meta.id] = boardObj;
      });
      safe.currentBoardId = fallbackBoards[0].meta.id;
    }

    if (!safe.boards[safe.currentBoardId]) {
      safe.currentBoardId = Object.keys(safe.boards)[0];
    }

    return safe;
  }

  const store = normalizeStore(null);

  const state = {
    mode: "broadcast",
    used: {},
    selectedNumbers: [],
    logs: [],
    history: [],
    queue: [],
    settings: createDefaultSettings(),
    prizes: [createDefaultOjiPrize()],
    ticketResults: {},
    editingPrizeId: null,
    selectedMemberId: null,
    memberSearchKeyword: "",
  };

  function getCurrentBoard() {
    return store.boards[store.currentBoardId];
  }

  function exportBoardState() {
    return {
      mode: state.mode,
      used: state.used,
      selectedNumbers: state.selectedNumbers,
      logs: state.logs,
      queue: state.queue,
      settings: deepClone(state.settings),
      prizes: deepClone(state.prizes),
      ticketResults: deepClone(state.ticketResults),
    };
  }

  function importBoardState(payload) {
    const safe = normalizeBoardState(payload);
    state.mode = safe.mode;
    state.used = safe.used;
    state.selectedNumbers = safe.selectedNumbers;
    state.logs = safe.logs;
    state.history = [];
    state.queue = safe.queue;
    state.settings = safe.settings;
    state.prizes = safe.prizes;
    state.ticketResults = safe.ticketResults;
    state.editingPrizeId = null;
  }

  function exportMasterPayload() {
    const current = getCurrentBoard();
    if (current) current.state = exportBoardState();

    return {
      currentBoardId: store.currentBoardId,
      boards: deepClone(store.boards),
      members: deepClone(store.members),
      savedAt: nowTs(),
      version: 4,
    };
  }

  function applyMasterPayload(payload) {
    const safe = normalizeStore(payload);
    store.currentBoardId = safe.currentBoardId;
    store.boards = safe.boards;
    store.members = safe.members;

    importBoardState(store.boards[store.currentBoardId].state);
    state.selectedMemberId = store.members.selectedId || null;
    state.memberSearchKeyword = "";
  }

  function pushHistory() {
    try {
      state.history.push(JSON.stringify({
        boardState: exportBoardState(),
        members: deepClone(store.members),
        currentBoardId: store.currentBoardId,
        selectedMemberId: state.selectedMemberId,
        memberSearchKeyword: state.memberSearchKeyword,
      }));
      if (state.history.length > CONFIG.maxHistory) state.history.shift();
    } catch {}
  }

  function restoreSnapshot(snapshotRaw) {
    if (!snapshotRaw) return;
    const snap = typeof snapshotRaw === "string" ? JSON.parse(snapshotRaw) : snapshotRaw;
    importBoardState(snap.boardState || {});
    store.members = normalizeMembers(snap.members);
    store.currentBoardId = snap.currentBoardId || store.currentBoardId;
    state.selectedMemberId = snap.selectedMemberId || null;
    state.memberSearchKeyword = snap.memberSearchKeyword || "";
    store.members.selectedId = state.selectedMemberId;
  }

  function initSupabase() {
    if (!window.supabase?.createClient) {
      console.warn("[KUJI] supabase-js가 없습니다.");
      DB.ready = false;
      DB.client = null;
      return;
    }
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("여기에") || SUPABASE_ANON_KEY.includes("여기에")) {
      console.warn("[KUJI] SUPABASE_URL / SUPABASE_ANON_KEY를 먼저 넣어야 합니더.");
      DB.ready = false;
      DB.client = null;
      return;
    }
    DB.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    DB.ready = true;
  }

  function saveLocalBackup() {
  try {
    localStorage.setItem(LOCAL_MASTER_KEY, JSON.stringify(exportMasterPayload()));
    localStorage.setItem(LOCAL_LAST_BOARD_KEY, store.currentBoardId || "");
    updateSaveStatusText(`로컬 백업 저장: ${new Date().toLocaleString("ko-KR")}`);
  } catch (e) {
    console.error("[KUJI] local backup save error:", e);
  }
}

  function loadLocalBackup() {
    try {
      const raw = localStorage.getItem(LOCAL_MASTER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error("[KUJI] local backup load error:", e);
      return null;
    }
  }

  async function saveRemoteNow() {
    if (!DB.ready || !DB.client) return false;
    if (DB.saving) {
      DB.queued = true;
      return false;
    }

    DB.saving = true;
    DB.queued = false;

    try {
      const payload = exportMasterPayload();

      const { error } = await DB.client
        .from("kuji_state")
        .upsert({
          board_id: REMOTE_MASTER_ROW_KEY,
          state: payload,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "board_id",
        });

      if (error) throw error;

      DB.lastSavedAt = nowTs();
updateSaveStatusText(`마지막 저장: ${new Date(DB.lastSavedAt).toLocaleString("ko-KR")}`);
return true;
    } catch (e) {
      console.error("[KUJI] remote save error:", e);
      return false;
    } finally {
      DB.saving = false;
      if (DB.queued) {
        DB.queued = false;
        saveRemoteDebounced();
      }
    }
  }

  function saveRemoteDebounced() {
    if (!DB.ready) return;
    if (DB.timer) clearTimeout(DB.timer);
    DB.timer = setTimeout(() => {
      saveRemoteNow();
    }, CONFIG.saveDebounceMs);
  }

  async function forceSaveAll() {
    saveLocalBackup();
    return await saveRemoteNow();
  }

  async function loadRemoteStore() {
    if (!DB.ready || !DB.client) return null;
    try {
      const { data, error } = await DB.client
        .from("kuji_state")
        .select("state")
        .eq("board_id", REMOTE_MASTER_ROW_KEY)
        .maybeSingle();

      if (error) throw error;
      return data?.state || null;
    } catch (e) {
      console.error("[KUJI] remote load error:", e);
      return null;
    }
  }

    // =====================================
  // DOM refs
  // =====================================
  const refs = {
    board: $("#board"),

    btnReset: $("#btnReset"),
    btnUndo: $("#btnUndo"),
    btnSave: $("#btnSave"),
    btnLoad: $("#btnLoad"),
    btnEmergencyRestore: $("#btnEmergencyRestore"),
btnExportJson: $("#btnExportJson"),
btnImportJson: $("#btnImportJson"),
jsonImportInput: $("#jsonImportInput"),

    winList: $("#winList"),
    prizeList: $("#prizeList"),
    prizeSummary: $("#prizeSummary"),

    btnToggleMode: $("#btnToggleMode"),
    adminPanel: $("#adminPanel"),
    btnCloseAdmin: $("#btnCloseAdmin"),

    totalTicketsInput: $("#totalTicketsInput"),
    kujiTitleText: $("#kujiTitleText"),
    kujiTitleInput: $("#kujiTitleInput"),
    priceInput: $("#priceInput"),
    btnApplyBasicSettings: $("#btnApplyBasicSettings"),

    queueInput: $("#queueInput"),
    btnAddQueue: $("#btnAddQueue"),
    queueList: $("#queueList"),

    prizeNameInput: $("#prizeNameInput"),
    prizeTierSelect: $("#prizeTierSelect"),
    prizeStockInput: $("#prizeStockInput"),
    prizeImgUrlInput: $("#prizeImgUrlInput"),
    btnAddPrize: $("#btnAddPrize"),
    adminPrizeList: $("#adminPrizeList"),

    lastOneNameInput: $("#lastOneNameInput"),
    lastOneDescInput: $("#lastOneDescInput"),
    lastOneImgUrlInput: $("#lastOneImgUrlInput"),
    btnApplyLastOne: $("#btnApplyLastOne"),
    btnClearLastOne: $("#btnClearLastOne"),

    boardSelect: $("#boardSelect"),
    newBoardNameInput: $("#newBoardNameInput"),
    boardBgUrlInput: $("#boardBgUrlInput"),
    boardPaperUrlInput: $("#boardPaperUrlInput"),
    btnCreateBoard: $("#btnCreateBoard"),
    btnApplyBoard: $("#btnApplyBoard"),
    btnDeleteBoard: $("#btnDeleteBoard"),

    progressInner: $("#progressInner"),
    progressPercent: $("#progressPercent"),
    openedCount: $("#openedCount"),
    totalCount: $("#totalCount"),

    statTotalTickets: $("#statTotalTickets"),
    statRemainTickets: $("#statRemainTickets"),
    statOpenedTickets: $("#statOpenedTickets"),

    drawNicknameInput: $("#drawNicknameInput"),
    randomCountInput: $("#randomCountInput"),
    btnRandomPick: $("#btnRandomPick"),
    btnResetSelection: $("#btnResetSelection"),
    btnOpenSelected: $("#btnOpenSelected"),

    priceText: $("#priceText"),
    accountText: $("#accountText"),
    topBoardLogo: $("#topBoardLogo"),
    topLogo: $("#topLogo"),

    btnToggleSound: $("#btnToggleSound"),
    soundVolumeRange: $("#soundVolumeRange"),

    drawModal: $("#drawModal"),
    modalBackdrop: $("#modalBackdrop"),
    modalClose: $("#modalClose"),
    modalTitle: $("#modalTitle"),
    modalSub: $("#modalSub"),
    modalResultNumber: $("#modalResultNumber"),
    modalResultImg: $("#modalResultImg"),
    modalPaper: $("#modalPaper"),
    modalPaperImg: $("#modalPaperImg"),
    modalRevealBig: $("#modalRevealBig"),
    modalRevealSmall: $("#modalRevealSmall"),
    modalConfetti: $("#modalConfetti"),
    modalStagePeel: $("#modalStagePeel"),
    modalStageResult: $("#modalStageResult"),
    modalResultPanel: $("#modalResultPanel"),
    btnAutoPeel: $("#btnAutoPeel"),

    previewModal: $("#previewModal"),
    previewBackdrop: $("#previewBackdrop"),
    previewClose: $("#previewClose"),
    previewTitle: $("#previewTitle"),
    previewSub: $("#previewSub"),
    previewImg: $("#previewImg"),

    editPrizeSection: $("#editPrizeSection"),
    editPrizeNameInput: $("#editPrizeNameInput"),
    editPrizeTierSelect: $("#editPrizeTierSelect"),
    editPrizeStockInput: $("#editPrizeStockInput"),
    btnSavePrizeEdit: $("#btnSavePrizeEdit"),
    btnCancelPrizeEdit: $("#btnCancelPrizeEdit"),
    editPrizeHint: $("#editPrizeHint"),

    fanfare: $("#fanfare"),
    peelSound: $("#peelSound"),
    lastOneSound: $("#lastOneSound"),
    lowTierSound: $("#lowTierSound"),

    btnToggleMember: $("#btnToggleMember"),
    memberPanel: $("#memberPanel"),
    btnCloseMember: $("#btnCloseMember"),
    memberNameInput: $("#memberNameInput"),
    btnAddMember: $("#btnAddMember"),
    btnUseMemberForDraw: $("#btnUseMemberForDraw"),
    memberList: $("#memberList"),
    memberDetailEmpty: $("#memberDetailEmpty"),
    memberDetail: $("#memberDetail"),
    memberDetailName: $("#memberDetailName"),
    memberDetailSub: $("#memberDetailSub"),
    memberDetailMileage: $("#memberDetailMileage"),
    btnRenameMember: $("#btnRenameMember"),
    btnDeleteMember: $("#btnDeleteMember"),
    memberMileageLogList: $("#memberMileageLogList"),
    memberWinLogList: $("#memberWinLogList"),
    memberSearchInput: $("#memberSearchInput"),
    btnMemberSearch: $("#btnMemberSearch"),
    btnMileageAdd: $("#btnMileageAdd"),
    btnMileageUse: $("#btnMileageUse"),
  };

  let peelDragging = false;
  let peelStartX = 0;
  let peelCurrentX = 0;
  let peelDone = false;
  let autoPeelRaf = null;
  let autoPeelRunning = false;
  let pendingRevealData = null;
  let pendingDrawCommit = null;
  let pendingDrawCommitted = false;
  let currentDrawResolver = null;
  let currentViewingLogTs = null;
let btnEditWinnerName = null;
  

  function getEditingPrize() {
    return state.prizes.find((p) => p.id === state.editingPrizeId) || null;
  }

  function rebuildAssignments() {
    const total = state.settings.totalTickets;
    const allResultNumbers = shuffle(Array.from({ length: total }, (_, i) => i + 1));

    let cursor = 0;
    state.prizes.forEach((p) => {
      if (p.id === "OJI") {
        p.numbers = [];
        return;
      }
      p.numbers = allResultNumbers.slice(cursor, cursor + p.total).sort((a, b) => a - b);
      cursor += p.total;
      p.stock = p.total;
    });

    const tickets = shuffle(Array.from({ length: total }, (_, i) => i + 1));
    state.ticketResults = {};
    for (let i = 1; i <= total; i++) {
      state.ticketResults[String(i)] = tickets[i - 1];
    }

    state.used = {};
    state.selectedNumbers = [];
    state.logs = [];

    if (state.settings.lastOnePrize) state.settings.lastOnePrize.claimed = false;
  }

  function rebuildAssignmentsIfNeeded() {
    const total = state.settings.totalTickets;
    const hasTicketMap = state.ticketResults && Object.keys(state.ticketResults).length === total;
    const prizeHasNumbers = state.prizes
      .filter((p) => p.id !== "OJI")
      .every((p) => Array.isArray(p.numbers) && p.numbers.length === p.total);

    if (!hasTicketMap || !prizeHasNumbers) rebuildAssignments();
  }

  function findPrizeByResultNumber(resultNumber) {
    for (const p of state.prizes) {
      if (p.id === "OJI") continue;
      if (Array.isArray(p.numbers) && p.numbers.includes(resultNumber)) return p;
    }
    return state.prizes.find((p) => p.id === "OJI") || createDefaultOjiPrize();
  }



  function getOpenedCount() {
    return Object.keys(state.used).length;
  }

  function getSelectedMember() {
    return store.members.list.find((m) => m.id === state.selectedMemberId) || null;
  }

  function findMemberByName(name) {
    const needle = String(name || "").trim().toLowerCase();
    if (!needle) return null;
    return store.members.list.find((m) => String(m.name || "").trim().toLowerCase() === needle) || null;
  }

  function ensureMemberByName(name) {
    const trimmed = String(name || "").trim();
    if (!trimmed) return null;

    let member = findMemberByName(trimmed);
    if (member) return member;

    member = {
      id: uid(),
      name: trimmed,
      mileage: 0,
      mileageLogs: [],
      winLogs: [],
      createdAt: nowTs(),
    };
    store.members.list.push(member);
    store.members.list.sort((a, b) => a.name.localeCompare(b.name, "ko"));
    return member;
  }

  function addMileageToMember(memberName, amount, reason, logData = {}) {
    const member = ensureMemberByName(memberName);
    if (!member) return;

    member.mileage += Number(amount || 0);
    member.mileageLogs.unshift({
      id: uid(),
      amount: Number(amount || 0),
      reason: reason || "적립",
      timeText: nowText(),
      ts: nowTs(),
      ticketNumber: logData.ticketNumber || null,
      resultNumber: logData.resultNumber || null,
    });

    if (member.mileageLogs.length > CONFIG.maxMemberLogs) {
      member.mileageLogs = member.mileageLogs.slice(0, CONFIG.maxMemberLogs);
    }

    state.selectedMemberId = member.id;
    store.members.selectedId = member.id;
  }

  function addWinLogToMember(memberName, log) {
    const member = ensureMemberByName(memberName);
    if (!member) return;

    member.winLogs.unshift({
      id: uid(),
      prizeName: log.displayPrizeName || log.prizeName || "",
      prizeId: log.displayTierText || log.prizeId || "",
      ticketNumber: log.ticketNumber,
      resultNumber: log.resultNumber,
      who: log.who,
      hasLastOne: !!log.hasLastOne,
      isManual: !!log.isManual,
      time: log.time || "",
      ts: log.ts || nowTs(),
    });

    if (member.winLogs.length > CONFIG.maxMemberLogs) {
      member.winLogs = member.winLogs.slice(0, CONFIG.maxMemberLogs);
    }

    state.selectedMemberId = member.id;
    store.members.selectedId = member.id;
  }

  function applyBoardVisual() {
    const current = getCurrentBoard();
    if (!current) return;

    document.body.style.backgroundImage = `url("${current.meta.bgImage || CONFIG.defaultBgImage}")`;
    if (refs.topBoardLogo) refs.topBoardLogo.src = CONFIG.defaultBoardLogo;
    if (refs.topLogo) refs.topLogo.src = CONFIG.defaultTopLogo;
  }

  function getAllAudioEls() {
    return [refs.fanfare, refs.peelSound, refs.lastOneSound, refs.lowTierSound].filter(Boolean);
  }

  function applySoundSettings() {
    const volume = state.settings.soundMuted ? 0 : state.settings.soundVolume;

    getAllAudioEls().forEach((audio) => {
      try {
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.muted = !!state.settings.soundMuted;
      } catch {}
    });

    if (refs.soundVolumeRange) {
      refs.soundVolumeRange.value = String(Math.round((state.settings.soundVolume || 0) * 100));
    }

    if (refs.btnToggleSound) {
      refs.btnToggleSound.textContent = state.settings.soundMuted ? "🔇 음소거" : "🔊 사운드";
      refs.btnToggleSound.classList.toggle("muted", !!state.settings.soundMuted);
    }
  }

  function renderProgress() {
    const total = state.settings.totalTickets;
    const opened = getOpenedCount();
    const remain = Math.max(0, total - opened);
    const pct = total ? Math.round((opened / total) * 100) : 0;

    if (refs.openedCount) refs.openedCount.textContent = String(opened);
    if (refs.totalCount) refs.totalCount.textContent = String(total);
    if (refs.progressInner) refs.progressInner.style.width = `${pct}%`;
    if (refs.progressPercent) refs.progressPercent.textContent = `${pct}%`;

    if (refs.statTotalTickets) refs.statTotalTickets.textContent = `${total}장`;
    if (refs.statRemainTickets) refs.statRemainTickets.textContent = `${remain}장`;
    if (refs.statOpenedTickets) refs.statOpenedTickets.textContent = `${opened}장`;
  }

  function renderControlState() {
    if (refs.btnOpenSelected) {
      refs.btnOpenSelected.textContent = `오픈 (${state.selectedNumbers.length})`;
    }
  }

  function rebuildBoardSelect() {
    if (!refs.boardSelect) return;
    refs.boardSelect.innerHTML = "";

    Object.values(store.boards).forEach((boardObj) => {
      const opt = document.createElement("option");
      opt.value = boardObj.meta.id;
      opt.textContent = boardObj.meta.name;
      if (boardObj.meta.id === store.currentBoardId) opt.selected = true;
      refs.boardSelect.appendChild(opt);
    });
  }

  function buildBoard(total) {
    if (!refs.board) return;
    refs.board.innerHTML = "";

    const current = getCurrentBoard();
    const paperImage = current?.meta?.paperImage || CONFIG.defaultPaperImage;

    for (let i = 1; i <= total; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card-btn";
      btn.dataset.n = String(i);

      const img = document.createElement("img");
      img.src = paperImage;
      img.alt = "뽑기 카드";

      const label = document.createElement("div");
      label.className = "num-label";
      label.textContent = String(i);

      btn.appendChild(img);
      btn.appendChild(label);

      btn.addEventListener("click", () => {
        if (state.used[String(i)]) return;

        const idx = state.selectedNumbers.indexOf(i);
        if (idx >= 0) state.selectedNumbers.splice(idx, 1);
        else {
          state.selectedNumbers.push(i);
          state.selectedNumbers.sort((a, b) => a - b);
        }

        renderBoardState();
        renderControlState();
        saveStoreDebounced();
      });

      refs.board.appendChild(btn);
    }

    renderBoardState();
  }

  function renderBoardState() {
    if (!refs.board) return;
    [...refs.board.children].forEach((btn) => {
      const n = Number(btn.dataset.n);
      btn.classList.toggle("used", !!state.used[String(n)]);
      btn.classList.toggle("selected", state.selectedNumbers.includes(n));
    });
  }

  function formatNumberBadgeText(numbers) {
    if (!numbers || !numbers.length) return "번호 없음";
    return [...numbers].sort((a, b) => a - b).join(" · ");
  }

  function renderPrizes() {
    if (!refs.prizeList || !refs.prizeSummary) return;
    refs.prizeList.innerHTML = "";

    const total = state.settings.totalTickets;
    const opened = getOpenedCount();
    const left = total - opened;
    refs.prizeSummary.textContent = `남은 수량 ${left} / 총 ${total}`;

    const lastOne = state.settings.lastOnePrize;
    if (lastOne) {
      const card = document.createElement("div");
      card.className = "prizecard lastone-prize previewable";
      if (lastOne.claimed) card.classList.add("claimed");

      const head = document.createElement("div");
      head.className = "prizehead";

      const title = document.createElement("div");
      title.className = "prizetitle";

      const line1 = document.createElement("div");
      line1.className = "tierline";

      const tierDot = document.createElement("span");
      tierDot.className = "tier-dot lastone-dot";

      const tierText = document.createElement("span");
      tierText.className = "tier-text";
      tierText.textContent = lastOne.name;

      line1.appendChild(tierDot);
      line1.appendChild(tierText);

      const desc = document.createElement("div");
      desc.className = "lastone-desc";
      desc.textContent = lastOne.desc || "마지막 뽑기 오픈 시 지급";

      title.appendChild(line1);
      title.appendChild(desc);
      head.appendChild(title);

      const mediaWrap = document.createElement("div");
      mediaWrap.className = "lastone-media";

      const img = document.createElement("img");
      img.className = "prizeimg";
      img.src = lastOne.img || CONFIG.defaultEmptyResultImage;
      img.alt = lastOne.name;
      img.onerror = () => {
        img.src = CONFIG.defaultEmptyResultImage;
      };

      const badge = document.createElement("div");
      badge.className = "lastone-badge";
      badge.textContent = "LAST ONE";

      mediaWrap.appendChild(img);
      mediaWrap.appendChild(badge);

      card.appendChild(head);
      card.appendChild(mediaWrap);

      card.addEventListener("click", () => {
        openPreviewModal({
          title: lastOne.name,
          sub: lastOne.desc || "마지막 뽑기 오픈 시 지급",
          img: lastOne.img || CONFIG.defaultEmptyResultImage,
        });
      });

      refs.prizeList.appendChild(card);
    }

    state.prizes
      .slice()
      .sort((a, b) => a.tier - b.tier)
      .forEach((p) => {
        const card = document.createElement("div");
        card.className = "prizecard previewable";

        if (p.id !== "OJI") {
          if (p.tier === 1) card.classList.add("tier-a");
          if (p.tier === 2) card.classList.add("tier-b");
          if (p.tier === 3) card.classList.add("tier-c");
          if (p.tier === 4) card.classList.add("tier-d");
          if (p.tier === 5) card.classList.add("tier-e");
        }

        if (p.stock === 1 && p.id !== "OJI") card.classList.add("lastone");
        if (p.stock === 0 && p.id !== "OJI") card.classList.add("soldout");

        const head = document.createElement("div");
        head.className = "prizehead";

        const title = document.createElement("div");
        title.className = "prizetitle";

        const line1 = document.createElement("div");
        line1.className = "tierline";

        const tierDot = document.createElement("span");
        tierDot.className = "tier-dot";

        const tierText = document.createElement("span");
        tierText.className = "tier-text";
        tierText.textContent = p.label;

        const count = document.createElement("div");
        count.className = "prizecount";

        if (p.id === "OJI") {
          count.innerHTML = `<span class="remain">${left}</span>`;
        } else {
          count.innerHTML = `<span class="remain">${p.stock}</span><span class="slash">/</span><span class="total">${p.total}</span>`;
        }

        line1.appendChild(tierDot);
        line1.appendChild(tierText);
        line1.appendChild(count);

        const name = document.createElement("div");
        name.className = "prizename";
        name.textContent = p.name;

        title.appendChild(line1);
        title.appendChild(name);

        const mediaWrap = document.createElement("div");
        mediaWrap.className = "prize-media";

        const img = document.createElement("img");
        img.className = "prizeimg";
        img.src = p.img || CONFIG.defaultEmptyResultImage;
        img.alt = p.name;
        img.onerror = () => {
          img.src = CONFIG.defaultEmptyResultImage;
        };

        mediaWrap.appendChild(img);

        if (p.id !== "OJI") {
          const badge = document.createElement("div");
          badge.className = "number-badge";
          badge.textContent = formatNumberBadgeText(p.numbers);
          mediaWrap.appendChild(badge);
        }

        head.appendChild(title);
        card.appendChild(head);
        card.appendChild(mediaWrap);

        card.addEventListener("click", () => {
          openPreviewModal({
            title: `${p.label} ${p.name}`,
            sub: p.id === "OJI" ? "기본 꽝 상품" : `${p.label} · 남은 ${p.stock}/${p.total}`,
            img: p.img || CONFIG.defaultEmptyResultImage,
          });
        });

        refs.prizeList.appendChild(card);
      });
  }

  function renderQueue() {
    if (!refs.queueList) return;
    refs.queueList.innerHTML = "";

    if (!state.queue.length) {
      const empty = document.createElement("div");
      empty.style.color = "rgba(255,255,255,.55)";
      empty.style.fontSize = "12px";
      empty.textContent = "현재 대기자가 없습니다.";
      refs.queueList.appendChild(empty);
      return;
    }

    state.queue.slice(0, 40).forEach((item, idx) => {
      const wrap = document.createElement("div");
      wrap.className = "queue-item";

      const name = document.createElement("div");
      name.className = "queue-name";
      name.textContent = `${idx + 1}. ${item.name}`;

      const rm = document.createElement("button");
      rm.type = "button";
      rm.className = "queue-remove";
      rm.textContent = "삭제";
      rm.addEventListener("click", () => {
        state.queue = state.queue.filter((x) => x.id !== item.id);
        renderQueue();
        saveStoreDebounced();
      });

      wrap.appendChild(name);
      wrap.appendChild(rm);
      refs.queueList.appendChild(wrap);
    });
  }

  function renderWinList() {
    if (!refs.winList) return;
    refs.winList.innerHTML = "";

    if (!state.logs.length) {
      const empty = document.createElement("div");
      empty.style.color = "rgba(255,255,255,.55)";
      empty.style.fontSize = "12px";
      empty.textContent = "아직 당첨 결과가 없습니다.";
      refs.winList.appendChild(empty);
      return;
    }

    const sorted = state.logs.slice().sort((a, b) => {
      if (a.tier !== b.tier) return a.tier - b.tier;
      return b.ts - a.ts;
    });

    sorted.slice(0, 40).forEach((item) => {
      const row = document.createElement("div");
      row.className = "winrow";

      if (item.tier === 1) row.classList.add("tier-a");
      if (item.tier === 2) row.classList.add("tier-b");
      if (item.tier === 3) row.classList.add("tier-c");
      if (item.tier === 4) row.classList.add("tier-d");
      if (item.tier === 5) row.classList.add("tier-e");
      if (String(item.prizeId || "").includes("오지상")) row.classList.add("tier-oji");

      const tier = document.createElement("div");
      tier.className = "wintier";
      tier.textContent = item.prizeId;

      const main = document.createElement("div");
      main.className = "winmain";

      const name = document.createElement("div");
      name.className = "winname";
      name.textContent = `${item.prizeName} · 번호 ${item.resultNumber}`;

      const meta = document.createElement("div");
      meta.className = "winmeta";
      meta.textContent = `종이 ${item.ticketNumber} · 닉네임: ${item.who}${item.isManual ? " · 수동처리" : ""}`;

      const time = document.createElement("div");
      time.className = "wintime";
      time.textContent = item.time;

      main.appendChild(name);
      main.appendChild(meta);

      row.appendChild(tier);
      row.appendChild(main);
      row.appendChild(time);

      row.addEventListener("click", () => {
        openWinLogResult(item);
      });

      refs.winList.appendChild(row);
    });
  }

  function renderAdminPrizeList() {
    if (!refs.adminPrizeList) return;
    refs.adminPrizeList.innerHTML = "";

    const sorted = state.prizes.slice().sort((a, b) => a.tier - b.tier);

    sorted.forEach((p) => {
      const item = document.createElement("div");
      item.className = "admin-prize-item";

      const thumb = document.createElement("img");
      thumb.className = "admin-prize-thumb";
      thumb.src = p.img || CONFIG.defaultEmptyResultImage;
      thumb.alt = p.name;
      thumb.onerror = () => {
        thumb.src = CONFIG.defaultEmptyResultImage;
      };

      const meta = document.createElement("div");
      meta.className = "admin-prize-meta";

      const title = document.createElement("div");
      title.className = "admin-prize-title";
      title.textContent = `${p.label} ${p.name}`;

      const sub = document.createElement("div");
      sub.className = "admin-prize-sub";
      sub.textContent = p.id === "OJI"
        ? "기본 상품"
        : `남은 ${p.stock}/${p.total} · 번호 ${formatNumberBadgeText(p.numbers)}`;

      meta.appendChild(title);
      meta.appendChild(sub);

      const actions = document.createElement("div");
      actions.className = "admin-prize-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "admin-prize-edit";
      edit.textContent = p.id === "OJI" ? "기본" : "수정";

      const del = document.createElement("button");
      del.type = "button";
      del.className = "admin-prize-delete";
      del.textContent = p.id === "OJI" ? "기본" : "삭제";

      if (p.id === "OJI") {
        edit.disabled = true;
        del.disabled = true;
        edit.style.opacity = ".5";
        del.style.opacity = ".5";
        edit.style.cursor = "default";
        del.style.cursor = "default";
      } else {
        edit.addEventListener("click", () => openPrizeEditSection(p.id));
        del.addEventListener("click", () => {
          if (!confirm(`${p.label} ${p.name} 상품을 삭제할까요?`)) return;
          pushHistory();
          state.prizes = state.prizes.filter((x) => x.id !== p.id);
          if (state.editingPrizeId === p.id) closePrizeEditSection();
          rebuildAssignments();
          renderAll();
          saveStoreDebounced();
        });
      }

      actions.appendChild(edit);
      actions.appendChild(del);

      item.appendChild(thumb);
      item.appendChild(meta);
      item.appendChild(actions);

      refs.adminPrizeList.appendChild(item);
    });
  }

  function renderMembers() {
    if (!refs.memberList) return;
    refs.memberList.innerHTML = "";

    const keyword = String(state.memberSearchKeyword || "").trim().toLowerCase();

    const members = store.members.list
      .slice()
      .filter((member) => {
        if (!keyword) return true;
        return String(member.name || "").toLowerCase().includes(keyword);
      })
      .sort((a, b) => {
        if (b.mileage !== a.mileage) return b.mileage - a.mileage;
        return a.name.localeCompare(b.name, "ko");
      });

    if (!members.length) {
      const empty = document.createElement("div");
      empty.className = "member-detail-empty";
      empty.textContent = keyword ? "검색 결과가 없습니다." : "등록된 회원이 없습니다.";
      refs.memberList.appendChild(empty);
    } else {
      members.forEach((member) => {
        const card = document.createElement("div");
        card.className = "member-card";
        if (member.id === state.selectedMemberId) card.classList.add("active");

        const main = document.createElement("div");
        main.className = "member-card-main";

        const name = document.createElement("div");
        name.className = "member-card-name";
        name.textContent = member.name;

        const sub = document.createElement("div");
        sub.className = "member-card-sub";
        sub.textContent = `적립 ${member.mileageLogs.length}건 · 당첨 ${member.winLogs.length}건`;

        const mileage = document.createElement("div");
        mileage.className = "member-card-mileage";
        mileage.textContent = formatWon(member.mileage);

        main.appendChild(name);
        main.appendChild(sub);

        card.appendChild(main);
        card.appendChild(mileage);

        card.addEventListener("click", () => {
          state.selectedMemberId = member.id;
          store.members.selectedId = member.id;
          renderMembers();
          saveStoreDebounced();
        });

        refs.memberList.appendChild(card);
      });
    }

    const selected = getSelectedMember();
    if (!selected) {
      if (refs.memberDetailEmpty) refs.memberDetailEmpty.style.display = "block";
      if (refs.memberDetail) refs.memberDetail.style.display = "none";
      return;
    }

    if (refs.memberDetailEmpty) refs.memberDetailEmpty.style.display = "none";
    if (refs.memberDetail) refs.memberDetail.style.display = "flex";

    if (refs.memberDetailName) refs.memberDetailName.textContent = selected.name;
    if (refs.memberDetailSub) {
      refs.memberDetailSub.textContent =
        `등록일 ${new Date(selected.createdAt).toLocaleDateString("ko-KR")} · 적립 ${selected.mileageLogs.length}건 · 당첨 ${selected.winLogs.length}건`;
    }
    if (refs.memberDetailMileage) refs.memberDetailMileage.textContent = formatWon(selected.mileage);

    if (refs.memberMileageLogList) {
      refs.memberMileageLogList.innerHTML = "";
      if (!selected.mileageLogs.length) {
        const empty = document.createElement("div");
        empty.className = "member-detail-empty";
        empty.textContent = "마일리지 적립 내역이 없습니다.";
        refs.memberMileageLogList.appendChild(empty);
      } else {
        selected.mileageLogs.forEach((log) => {
          const item = document.createElement("div");
          item.className = "member-log-item";
          const signText = Number(log.amount) >= 0 ? "+" : "";
          item.innerHTML = `
            <div class="member-log-main">${signText}${formatWon(log.amount)} · ${log.reason}</div>
            <div class="member-log-sub">
              ${log.timeText}
              ${log.ticketNumber ? ` · 종이 ${log.ticketNumber}` : ""}
              ${log.resultNumber ? ` · 번호 ${log.resultNumber}` : ""}
            </div>
          `;
          refs.memberMileageLogList.appendChild(item);
        });
      }
    }

    if (refs.memberWinLogList) {
      refs.memberWinLogList.innerHTML = "";
      if (!selected.winLogs.length) {
        const empty = document.createElement("div");
        empty.className = "member-detail-empty";
        empty.textContent = "당첨 내역이 없습니다.";
        refs.memberWinLogList.appendChild(empty);
      } else {
        selected.winLogs.forEach((log) => {
          const item = document.createElement("div");
          item.className = "member-log-item";
          item.innerHTML = `
            <div class="member-log-main">${log.prizeId} · ${log.prizeName}</div>
            <div class="member-log-sub">
              ${log.time || ""}
              ${log.ticketNumber ? ` · 종이 ${log.ticketNumber}` : ""}
              ${log.resultNumber ? ` · 번호 ${log.resultNumber}` : ""}
              ${log.isManual ? " · 수동기록" : ""}
            </div>
          `;
          refs.memberWinLogList.appendChild(item);
        });
      }
    }
  }

  function renderAll() {
    const current = getCurrentBoard();
    if (current) current.state = exportBoardState();

    renderBoardState();
    renderPrizes();
    renderAdminPrizeList();
    renderWinList();
    renderQueue();
    renderProgress();
    renderControlState();
    rebuildBoardSelect();
    applyBoardVisual();
    applySoundSettings();
    renderMembers();

    if (refs.kujiTitleText) refs.kujiTitleText.textContent = state.settings.kujiTitle;
    if (refs.kujiTitleInput) refs.kujiTitleInput.value = state.settings.kujiTitle;
    if (refs.totalTicketsInput) refs.totalTicketsInput.value = String(state.settings.totalTickets);
    if (refs.priceText) refs.priceText.textContent = state.settings.priceText;
    if (refs.accountText) refs.accountText.textContent = state.settings.accountText;
    if (refs.priceInput) refs.priceInput.value = state.settings.priceText || "";

    if (refs.lastOneNameInput) refs.lastOneNameInput.value = state.settings.lastOnePrize?.name || "";
    if (refs.lastOneDescInput) refs.lastOneDescInput.value = state.settings.lastOnePrize?.desc || "";

    if (state.editingPrizeId) {
      const editingPrize = getEditingPrize();
      if (!editingPrize) closePrizeEditSection();
    } else {
      if (refs.editPrizeSection) refs.editPrizeSection.style.display = "none";
    }
  }

  function openPreviewModal({ title = "상품 미리보기", sub = "", img = "" }) {
    if (!refs.previewModal || !refs.previewImg) return;

    if (refs.previewTitle) refs.previewTitle.textContent = title;
    if (refs.previewSub) refs.previewSub.textContent = sub || "";

    refs.previewImg.src = img || CONFIG.defaultEmptyResultImage;
    refs.previewImg.onerror = () => {
      refs.previewImg.onerror = null;
      refs.previewImg.src = CONFIG.defaultEmptyResultImage;
    };

    refs.previewModal.classList.add("show");
    refs.previewModal.setAttribute("aria-hidden", "false");
  }

  function closePreviewModal() {
    if (!refs.previewModal) return;
    refs.previewModal.classList.remove("show");
    refs.previewModal.setAttribute("aria-hidden", "true");
    if (refs.previewImg) refs.previewImg.src = "";
  }

  function openPrizeEditSection(prizeId) {
    const prize = state.prizes.find((p) => p.id === prizeId);
    if (!prize || prize.id === "OJI") return;

    state.editingPrizeId = prize.id;

    if (refs.editPrizeSection) refs.editPrizeSection.style.display = "block";
    if (refs.editPrizeNameInput) refs.editPrizeNameInput.value = prize.name;
    if (refs.editPrizeTierSelect) refs.editPrizeTierSelect.value = prize.label;
    if (refs.editPrizeStockInput) refs.editPrizeStockInput.value = String(prize.total);

    const anyOpened = getOpenedCount() > 0;
    if (refs.editPrizeStockInput) refs.editPrizeStockInput.disabled = anyOpened;

    if (refs.editPrizeHint) {
      refs.editPrizeHint.textContent = anyOpened
        ? "이미 추첨이 시작되어 수량 변경은 잠겨 있습니다. 이름 / 등급만 수정할 수 있습니다."
        : "아직 추첨 전이라 이름 / 등급 / 수량 모두 수정할 수 있습니다.";
    }
  }

  function closePrizeEditSection() {
    state.editingPrizeId = null;
    if (refs.editPrizeSection) refs.editPrizeSection.style.display = "none";
    if (refs.editPrizeNameInput) refs.editPrizeNameInput.value = "";
    if (refs.editPrizeTierSelect) refs.editPrizeTierSelect.value = "A상";
    if (refs.editPrizeStockInput) {
      refs.editPrizeStockInput.value = "1";
      refs.editPrizeStockInput.disabled = false;
    }
  }

  function savePrizeEdit() {
    const prize = getEditingPrize();
    if (!prize) return alert("수정 중인 상품이 없습니다.");

    const nextName = String(refs.editPrizeNameInput?.value || "").trim();
    const nextLabel = refs.editPrizeTierSelect?.value || "A상";
    const nextTotal = Math.floor(Number(refs.editPrizeStockInput?.value || 0));

    if (!nextName) return alert("상품 이름을 입력하세요.");

    const anyOpened = getOpenedCount() > 0;
    if (!anyOpened) {
      if (!Number.isFinite(nextTotal) || nextTotal < 1) return alert("수량은 1 이상이어야 합니다.");

      const otherTotal = state.prizes
        .filter((p) => p.id !== "OJI" && p.id !== prize.id)
        .reduce((sum, p) => sum + p.total, 0);

      if (otherTotal + nextTotal > state.settings.totalTickets) {
        return alert("다른 상품 수량과 합치면 전체 뽑기 수를 초과합니다.");
      }
    }

    pushHistory();

    prize.name = nextName;
    prize.label = nextLabel;
    prize.tier = tierLabelToTierValue(nextLabel);

    if (!anyOpened) {
      prize.total = nextTotal;
      prize.stock = nextTotal;
      rebuildAssignments();
    }

    state.prizes.sort((a, b) => a.tier - b.tier);
    closePrizeEditSection();
    renderAll();
    saveStoreDebounced();
    alert("상품이 수정되었습니다.");
  }

    function stopPeelSound() {
    if (!refs.peelSound) return;
    try {
      refs.peelSound.pause();
      refs.peelSound.currentTime = 0;
    } catch {}
  }

  function stopAllRewardSounds() {
    [refs.fanfare, refs.lastOneSound, refs.lowTierSound].forEach((audio) => {
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
  }

  function playPeelSound() {
    if (!refs.peelSound) return;
    try {
      stopPeelSound();
      refs.peelSound.currentTime = 0;
      refs.peelSound.play().catch(() => {});
    } catch {}
  }

  function playFanfare() {
    if (!CONFIG.useFanfare || !refs.fanfare) return;
    try {
      stopAllRewardSounds();
      refs.fanfare.currentTime = 0;
      refs.fanfare.play().catch(() => {});
    } catch {}
  }

  function playLastOneSound() {
    if (!refs.lastOneSound) return;
    try {
      stopAllRewardSounds();
      refs.lastOneSound.currentTime = 0;
      refs.lastOneSound.play().catch(() => {});
    } catch {}
  }

  function playLowTierSound(tierText = "") {
    if (tierText === "오지상" || !refs.lowTierSound) return;
    try {
      stopAllRewardSounds();
      refs.lowTierSound.currentTime = 0;
      refs.lowTierSound.play().catch(() => {});
    } catch {}
  }

  function resetDrawModalState() {
    stopAutoPeel();
    stopPeelSound();

    if (refs.btnAutoPeel) {
      refs.btnAutoPeel.disabled = false;
      refs.btnAutoPeel.textContent = "자동 오픈 !";
    }

    if (refs.modalStagePeel) refs.modalStagePeel.style.display = "block";
    if (refs.modalStageResult) refs.modalStageResult.style.display = "none";

    if (refs.modalResultPanel) {
      refs.modalResultPanel.classList.remove("show", "tier-a", "tier-b", "tier-c", "tier-d", "tier-e", "lastone-result", "show-congrats");
    }

    if (refs.modalPaper) {
      refs.modalPaper.style.transform = "translateX(0px)";
      refs.modalPaper.classList.remove("dragging");
      refs.modalPaper.style.display = "block";
    }

    if (refs.modalConfetti) refs.modalConfetti.innerHTML = "";
    if (refs.modalResultNumber) refs.modalResultNumber.textContent = "";
    if (refs.modalRevealBig) refs.modalRevealBig.textContent = "";
    if (refs.modalRevealSmall) refs.modalRevealSmall.innerHTML = "";
    if (refs.modalResultImg) {
      refs.modalResultImg.removeAttribute("src");
      refs.modalResultImg.classList.add("is-hidden");
    }

    peelDragging = false;
    peelStartX = 0;
    peelCurrentX = 0;
    peelDone = false;
    pendingRevealData = null;
    pendingDrawCommit = null;
    pendingDrawCommitted = false;

    currentViewingLogTs = null;
showWinnerEditButton(false);
  }

  function openModal() {
    if (!refs.drawModal) return;
    resetDrawModalState();
    refs.drawModal.classList.add("show");
    refs.drawModal.style.display = "block";
    refs.drawModal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!refs.drawModal) return;
    stopAutoPeel();
    stopPeelSound();
    refs.drawModal.classList.remove("show");
    refs.drawModal.style.display = "none";
    refs.drawModal.setAttribute("aria-hidden", "true");

    currentViewingLogTs = null;
showWinnerEditButton(false);

    resolveCurrentDraw();
  }

  function stopAutoPeel() {
    if (autoPeelRaf) {
      cancelAnimationFrame(autoPeelRaf);
      autoPeelRaf = null;
    }
    autoPeelRunning = false;
  }

  function burstConfetti(count = 60) {
    if (!refs.modalConfetti) return;
    refs.modalConfetti.innerHTML = "";

    const colors = [
      "rgba(255,215,0,.95)",
      "rgba(177,76,255,.95)",
      "rgba(61,168,255,.95)",
      "rgba(255,255,255,.88)",
      "rgba(0,255,136,.92)",
      "rgba(255,120,210,.95)",
    ];

    const width = refs.modalConfetti.clientWidth || 720;
    const height = refs.modalConfetti.clientHeight || 420;

    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = `${Math.random() * width}px`;
      c.style.top = `${-20 - Math.random() * 80}px`;
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.width = `${8 + Math.random() * 8}px`;
      c.style.height = `${10 + Math.random() * 12}px`;

      c.animate(
        [
          { transform: "translate(0px, 0px) rotate(0deg)", opacity: 1 },
          { transform: `translate(${(Math.random() - 0.5) * 260}px, ${height + 120}px) rotate(${480 + Math.random() * 540}deg)`, opacity: 0 },
        ],
        {
          duration: 900 + Math.random() * 900,
          easing: "cubic-bezier(.18,.7,.2,1)",
          fill: "forwards",
        }
      );

      refs.modalConfetti.appendChild(c);
    }

    setTimeout(() => {
      if (refs.modalConfetti) refs.modalConfetti.innerHTML = "";
    }, 2400);
  }

  function resolveDrawerName() {
    const manualName = String(refs.drawNicknameInput?.value || "").trim();
    if (manualName) {
      ensureMemberByName(manualName);
      return { who: manualName, fromQueue: false };
    }

    const selectedMember = getSelectedMember();
    if (selectedMember?.name) {
      if (refs.drawNicknameInput) refs.drawNicknameInput.value = selectedMember.name;
      return { who: selectedMember.name, fromQueue: false };
    }

    const queueName = String(state.queue?.[0]?.name || "").trim();
    if (queueName) {
      ensureMemberByName(queueName);
      return { who: queueName, fromQueue: true };
    }

    return { who: "참여자", fromQueue: false };
  }

  function commitPendingDrawIfNeeded() {
    if (!pendingDrawCommit || pendingDrawCommitted) return;

    const tx = pendingDrawCommit;

    if (tx.prize.id !== "OJI") tx.prize.stock = Math.max(0, tx.prize.stock - 1);
    if (tx.lastOnePrize) tx.lastOnePrize.claimed = true;

    state.used[String(tx.ticketNumber)] = true;
    state.selectedNumbers = state.selectedNumbers.filter((x) => x !== tx.ticketNumber);

    state.logs.push(tx.log);
    if (state.logs.length > CONFIG.maxLogs) state.logs = state.logs.slice(-CONFIG.maxLogs);

    addWinLogToMember(tx.log.who, tx.log);

    if (tx.prize.id === "OJI") {
      addMileageToMember(
        tx.log.who,
        CONFIG.defaultMileagePerOji,
        "오지상 기본상 자동 적립",
        {
          ticketNumber: tx.ticketNumber,
          resultNumber: tx.resultNumber,
        }
      );
    }

    if (tx.drawerInfo?.fromQueue) state.queue.shift();

    pendingDrawCommitted = true;
    renderAll();
    saveStoreDebounced();
  }

  function fillResultPanel(data) {
    const { prizeName, tierText, ticketNumber, who, prizeImg, tier, hasLastOne } = data;

    showWinnerEditButton(false);

    if (refs.modalTitle) refs.modalTitle.textContent = "결과 공개";
    if (refs.modalSub) refs.modalSub.textContent = "";

    if (refs.modalRevealBig) refs.modalRevealBig.textContent = prizeName || "";
    if (refs.modalRevealSmall) {
      refs.modalRevealSmall.innerHTML = `
        <div class="result-meta-line">종이 ${ticketNumber}</div>
        <div class="result-meta-line result-who">${who || "참여자"}</div>
      `;
    }

    if (refs.modalResultImg) {
      refs.modalResultImg.src = prizeImg || CONFIG.defaultEmptyResultImage;
      refs.modalResultImg.classList.remove("is-hidden");
    }

    if (refs.modalStagePeel) refs.modalStagePeel.style.display = "none";
    if (refs.modalStageResult) refs.modalStageResult.style.display = "block";

    if (refs.modalResultPanel) {
      refs.modalResultPanel.classList.remove("tier-a", "tier-b", "tier-c", "tier-d", "tier-e", "lastone-result", "show-congrats");
      if (hasLastOne) refs.modalResultPanel.classList.add("lastone-result", "show-congrats");
      else if (tier === 1) refs.modalResultPanel.classList.add("tier-a", "show-congrats");
      else if (tier === 2) refs.modalResultPanel.classList.add("tier-b", "show-congrats");
      else if (tier === 3) refs.modalResultPanel.classList.add("tier-c");
      else if (tier === 4) refs.modalResultPanel.classList.add("tier-d");
      else refs.modalResultPanel.classList.add("tier-e");

      refs.modalResultPanel.classList.add("show");
    }

    if (hasLastOne) {
      playLastOneSound();
      burstConfetti(180);
    } else if (tier === 1 || tier === 2) {
      playFanfare();
      burstConfetti(120);
    } else {
      playLowTierSound(tierText);
      burstConfetti(40);
    }
  }

  function showResultPanel() {
    if (!pendingRevealData) return;
    commitPendingDrawIfNeeded();
    fillResultPanel(pendingRevealData);
  }

  function finishPeelReveal() {
    if (peelDone) return;
    peelDone = true;
    stopPeelSound();

    if (refs.modalPaper) {
      refs.modalPaper.style.transform = "translateX(110%)";
      refs.modalPaper.classList.remove("dragging");
    }

    setTimeout(() => {
      if (refs.modalPaper) refs.modalPaper.style.display = "none";
      showResultPanel();
    }, 180);
  }

  function startAutoPeel() {
    if (!refs.modalPaper || peelDone || autoPeelRunning) return;
    autoPeelRunning = true;
    playPeelSound();

    const width = refs.modalPaper.offsetWidth || 540;
    const duration = 260;
    const start = performance.now();

    const animate = (now) => {
      if (!autoPeelRunning || peelDone) {
        stopAutoPeel();
        return;
      }

      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const x = width * 1.12 * eased;

      peelCurrentX = x;
      refs.modalPaper.style.transform = `translateX(${x}px)`;

      if (progress < 1) {
        autoPeelRaf = requestAnimationFrame(animate);
      } else {
        stopAutoPeel();
        finishPeelReveal();
      }
    };

    autoPeelRaf = requestAnimationFrame(animate);
  }

  function bindPeelEvents() {
    if (!refs.modalPaper) return;

    const startDrag = (clientX) => {
      if (peelDone) return;
      stopAutoPeel();
      peelDragging = true;
      peelStartX = clientX - peelCurrentX;
      refs.modalPaper.classList.add("dragging");
      playPeelSound();
    };

    const moveDrag = (clientX) => {
      if (!peelDragging || peelDone) return;
      const maxX = refs.modalPaper.offsetWidth;
      const dx = Math.max(0, Math.min(clientX - peelStartX, maxX));
      peelCurrentX = dx;
      refs.modalPaper.style.transform = `translateX(${dx}px)`;

      const threshold = refs.modalPaper.offsetWidth * 0.92;
      if (dx >= threshold) {
        peelDragging = false;
        refs.modalPaper.classList.remove("dragging");
        finishPeelReveal();
      }
    };

    const endDrag = () => {
      if (!peelDragging || peelDone) return;
      peelDragging = false;
      refs.modalPaper.classList.remove("dragging");
    };

    refs.modalPaper.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startDrag(e.clientX);
    });

    document.addEventListener("mousemove", (e) => moveDrag(e.clientX));
    document.addEventListener("mouseup", endDrag);

    refs.modalPaper.addEventListener("touchstart", (e) => {
      if (!e.touches.length) return;
      startDrag(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener("touchmove", (e) => {
      if (!e.touches.length) return;
      moveDrag(e.touches[0].clientX);
    }, { passive: true });

    document.addEventListener("touchend", endDrag);
  }


  function injectExtraUi() {
  if (btnEditWinnerName) return;

  const modalHeader = refs.drawModal?.querySelector(".modal-header");
  if (!modalHeader) return;

  if (!document.getElementById("kuji-extra-style")) {
    const style = document.createElement("style");
    style.id = "kuji-extra-style";
    style.textContent = `
      .modal-edit-top-btn{
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        border: 1px solid rgba(122,112,255,.55);
        background: rgba(122,112,255,.14);
        color: #fff;
        padding: 8px 12px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 900;
        font-size: 13px;
        line-height: 1;
        z-index: 3;
      }
      .modal-edit-top-btn:hover{
        background: rgba(122,112,255,.22);
      }
      .modal-edit-top-btn.is-hidden{
        display: none;
      }
      .winrow{
        cursor: pointer;
      }
      .winrow:hover{
        filter: brightness(1.05);
      }
    `;
    document.head.appendChild(style);
  }

  btnEditWinnerName = document.createElement("button");
  btnEditWinnerName.type = "button";
  btnEditWinnerName.id = "btnEditWinnerName";
  btnEditWinnerName.className = "modal-edit-top-btn is-hidden";
  btnEditWinnerName.textContent = "닉네임 수정";

  btnEditWinnerName.addEventListener("click", () => {
    editCurrentViewingWinnerName();
  });

  modalHeader.appendChild(btnEditWinnerName);
}

function showWinnerEditButton(show) {
  if (!btnEditWinnerName) return;
  btnEditWinnerName.classList.toggle("is-hidden", !show);
}

function findLogByTs(ts) {
  return state.logs.find((log) => log.ts === ts) || null;
}

function editCurrentViewingWinnerName() {
  if (!currentViewingLogTs) {
    alert("수정할 당첨 기록이 없습니다.");
    return;
  }

  const targetLog = findLogByTs(currentViewingLogTs);
  if (!targetLog) {
    alert("기록을 찾지 못했습니다.");
    return;
  }

  const oldName = String(targetLog.who || "").trim();
  const nextName = prompt("새 닉네임을 입력해주세요.", oldName);
  if (nextName === null) return;

  const trimmed = String(nextName || "").trim();
  if (!trimmed) {
    alert("닉네임은 비워둘 수 없습니다.");
    return;
  }

  if (trimmed === oldName) return;

  pushHistory();

  const ticketNumber = targetLog.ticketNumber;
  const resultNumber = targetLog.resultNumber;
  const isOjiMileage = String(targetLog.displayTierText || targetLog.prizeId || "").includes("오지상");

  // 1) 현재 기록 1건만 닉네임 변경
  targetLog.who = trimmed;

  // 2) 현재 보드 로그에서도 같은 ts 기록만 변경
  const currentBoard = getCurrentBoard();
  const currentBoardLogs = currentBoard?.state?.logs;
  if (Array.isArray(currentBoardLogs)) {
    const sameLog = currentBoardLogs.find((log) => log.ts === currentViewingLogTs);
    if (sameLog) sameLog.who = trimmed;
  }

  // 3) 오지상 당첨이면 그 1건의 마일리지 로그만 이동
  if (isOjiMileage) {
    const oldMember = findMemberByName(oldName);
    const newMember = ensureMemberByName(trimmed);

    if (oldMember && newMember) {
      const mileageLogIndex = oldMember.mileageLogs.findIndex((log) =>
        Number(log.ticketNumber) === Number(ticketNumber) &&
        Number(log.resultNumber) === Number(resultNumber) &&
        Number(log.amount) === Number(CONFIG.defaultMileagePerOji)
      );

      if (mileageLogIndex >= 0) {
        const [mileageLog] = oldMember.mileageLogs.splice(mileageLogIndex, 1);

        oldMember.mileage -= Number(mileageLog.amount || 0);
        newMember.mileage += Number(mileageLog.amount || 0);

        newMember.mileageLogs.unshift({
          ...mileageLog,
        });

        if (newMember.mileageLogs.length > CONFIG.maxMemberLogs) {
          newMember.mileageLogs = newMember.mileageLogs.slice(0, CONFIG.maxMemberLogs);
        }
      }
    }
  }

  // 4) 해당 회원의 winLogs에서도 같은 기록 1건만 이동
  const oldMember = findMemberByName(oldName);
  const newMember = ensureMemberByName(trimmed);

  if (oldMember && newMember) {
    const winLogIndex = oldMember.winLogs.findIndex((log) =>
      Number(log.ticketNumber) === Number(ticketNumber) &&
      Number(log.resultNumber) === Number(resultNumber) &&
      Number(log.ts) === Number(currentViewingLogTs)
    );

    if (winLogIndex >= 0) {
      const [winLog] = oldMember.winLogs.splice(winLogIndex, 1);
      winLog.who = trimmed;

      newMember.winLogs.unshift(winLog);
      if (newMember.winLogs.length > CONFIG.maxMemberLogs) {
        newMember.winLogs = newMember.winLogs.slice(0, CONFIG.maxMemberLogs);
      }
    }
  }

  // 5) 입력칸 이름도 현재 이름이면 같이 변경
  if (refs.drawNicknameInput?.value?.trim() === oldName) {
    refs.drawNicknameInput.value = trimmed;
  }

  renderAll();
  saveStoreDebounced();

  fillResultPanel({
    prizeName: targetLog.displayPrizeName || targetLog.prizeName || "",
    tierText: targetLog.displayTierText || targetLog.prizeId || "",
    ticketNumber: targetLog.ticketNumber,
    who: targetLog.who,
    prizeImg: targetLog.prizeImg || "",
    tier: targetLog.tier || 5,
    hasLastOne: !!targetLog.hasLastOne,
  });

  if (refs.modalTitle) refs.modalTitle.textContent = "당첨 결과 보기";
  if (refs.modalSub) refs.modalSub.textContent = targetLog.isManual ? "관리자 수동 처리 기록" : "";

  showWinnerEditButton(true);
}

function openWinLogResult(log) {
  if (!log) return;

  openModal();

  currentViewingLogTs = log.ts;

  fillResultPanel({
    prizeName: log.displayPrizeName || log.prizeName || "",
    tierText: log.displayTierText || log.prizeId || "",
    ticketNumber: log.ticketNumber,
    who: log.who,
    prizeImg: log.prizeImg || "",
    tier: log.tier || 5,
    hasLastOne: !!log.hasLastOne,
  });

  if (refs.modalTitle) refs.modalTitle.textContent = "당첨 결과 보기";
  if (refs.modalSub) refs.modalSub.textContent = log.isManual ? "관리자 수동 처리 기록" : "";

  showWinnerEditButton(true);
}



  function runModalPeelReveal({
    resultNumber,
    prizeName,
    prizeLabel,
    ticketNumber,
    who,
    prizeImg,
    tier,
    hasLastOne,
  }) {
    if (refs.modalStagePeel) refs.modalStagePeel.style.display = "block";
    if (refs.modalStageResult) refs.modalStageResult.style.display = "none";

    if (refs.modalTitle) refs.modalTitle.textContent = "번호 공개";
    if (refs.modalSub) refs.modalSub.textContent = "";
    if (refs.modalResultNumber) refs.modalResultNumber.textContent = `${resultNumber}`;

    if (refs.modalPaperImg) {
      refs.modalPaperImg.src = getCurrentBoard()?.meta?.paperImage || CONFIG.defaultCoverPaperImage;
    }

    pendingRevealData = {
      prizeName,
      tierText: prizeLabel,
      ticketNumber,
      who,
      prizeImg,
      tier,
      hasLastOne,
    };
  }

  async function startDraw(ticketNumber) {
    const beforeSnap = JSON.stringify({
      boardState: exportBoardState(),
      members: deepClone(store.members),
      currentBoardId: store.currentBoardId,
      selectedMemberId: state.selectedMemberId,
      memberSearchKeyword: state.memberSearchKeyword,
    });

    return new Promise((resolve) => {
      try {
        const nKey = String(ticketNumber);
        if (state.used[nKey]) {
          resolve();
          return;
        }

        currentDrawResolver = resolve;

        const resultNumber = Number(state.ticketResults[nKey]);
        if (!Number.isFinite(resultNumber)) {
          alert("결과 번호가 없습니다.");
          resolveCurrentDraw();
          return;
        }

        const prize = findPrizeByResultNumber(resultNumber);
        const openedBefore = getOpenedCount();
        const isLastDraw = openedBefore + 1 === state.settings.totalTickets;

        const lastOnePrize =
          isLastDraw &&
          state.settings.lastOnePrize &&
          !state.settings.lastOnePrize.claimed
            ? state.settings.lastOnePrize
            : null;

        const drawerInfo = resolveDrawerName();
        const who = drawerInfo.who;

        const displayPrizeName = lastOnePrize ? `${prize.name} + ${lastOnePrize.name}` : prize.name;
        const displayTierText = lastOnePrize ? `${prize.label} + LAST ONE` : prize.label;
        const displayImg = lastOnePrize ? (lastOnePrize.img || prize.img || "") : (prize.img || "");

        const log = {
          ticketNumber,
          resultNumber,
          who,
          prizeId: displayTierText,
          prizeName: displayPrizeName,
          displayPrizeName,
          displayTierText,
          prizeImg: displayImg,
          hasLastOne: !!lastOnePrize,
          tier: lastOnePrize ? 1 : prize.tier,
          time: new Date().toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
          ts: nowTs(),
        };

        pushHistory();
        openModal();

        pendingDrawCommit = {
          ticketNumber,
          resultNumber,
          prize,
          lastOnePrize,
          drawerInfo,
          log,
        };
        pendingDrawCommitted = false;

        if (refs.modalTitle) refs.modalTitle.textContent = lastOnePrize ? "라스트원 포함 결과 공개" : "결과 공개";
        if (refs.modalSub) refs.modalSub.textContent = `결과 번호 ${resultNumber}`;

        runModalPeelReveal({
          resultNumber,
          prizeName: displayPrizeName,
          prizeLabel: displayTierText,
          ticketNumber,
          who,
          prizeImg: displayImg,
          tier: lastOnePrize ? 1 : prize.tier,
          hasLastOne: !!lastOnePrize,
        });
      } catch (e) {
        console.error("[KUJI] startDraw error:", e);
        try {
          restoreSnapshot(beforeSnap);
          buildBoard(state.settings.totalTickets);
          renderAll();
          saveLocalBackup();
        } catch (rollbackError) {
          console.error("[KUJI] rollback error:", rollbackError);
        }

        pendingDrawCommit = null;
        pendingDrawCommitted = false;

        if (refs.drawModal?.classList.contains("show")) closeModal();
        else resolveCurrentDraw();

        alert("오류가 발생했습니다. 콘솔을 확인하세요.");
      }
    });
  }



  function resolveCurrentDraw() {
    if (typeof currentDrawResolver === "function") {
      const fn = currentDrawResolver;
      currentDrawResolver = null;
      fn();
    }
  }

  function randomSelectCards() {
    const count = Number(refs.randomCountInput?.value || 0);
    if (!Number.isFinite(count) || count < 1) {
      alert("랜덤 장수를 1 이상 입력하세요.");
      return;
    }

    const available = [];
    for (let i = 1; i <= state.settings.totalTickets; i++) {
      if (!state.used[String(i)] && !state.selectedNumbers.includes(i)) {
        available.push(i);
      }
    }

    if (!available.length) {
      alert("선택 가능한 뽑기가 없습니다.");
      return;
    }

    const picked = shuffle(available).slice(0, Math.min(count, available.length));
    state.selectedNumbers = [...new Set([...state.selectedNumbers, ...picked])].sort((a, b) => a - b);

    renderBoardState();
    renderControlState();
    saveStoreDebounced();
  }

  async function openSelectedCards() {
    if (!state.selectedNumbers.length) {
      alert("선택된 뽑기가 없습니다.");
      return;
    }

    const nums = [...state.selectedNumbers].sort((a, b) => a - b);
    for (let i = 0; i < nums.length; i++) {
      await startDraw(nums[i]);
      if (i < nums.length - 1) await sleep(250);
    }

    state.selectedNumbers = [];
    renderBoardState();
    renderControlState();
    saveStoreDebounced();
  }

  function addQueue() {
    const name = String(refs.queueInput?.value || "").trim();
    if (!name) return;

    state.queue.push({ id: uid(), name });
    if (refs.queueInput) refs.queueInput.value = "";
    renderQueue();
    saveStoreDebounced();
  }

  function addMemberFromInput() {
    const name = String(refs.memberNameInput?.value || "").trim();
    if (!name) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    const exists = findMemberByName(name);
    if (exists) {
      state.selectedMemberId = exists.id;
      store.members.selectedId = exists.id;
      renderMembers();
      saveStoreDebounced();
      alert("이미 등록된 회원입니다.");
      return;
    }
    

    pushHistory();
    const member = ensureMemberByName(name);
    state.selectedMemberId = member.id;
    store.members.selectedId = member.id;

    if (refs.memberNameInput) refs.memberNameInput.value = "";
    if (refs.memberSearchInput) refs.memberSearchInput.value = "";
    state.memberSearchKeyword = "";

    renderMembers();
    saveStoreDebounced();
  }

  function updateSaveStatusText(text) {
  const el = $("#saveStatusText");
  if (!el) return;
  el.textContent = text;
}

  function moveMemberDataToAnotherName(oldName, newName) {
  const oldMember = findMemberByName(oldName);
  if (!oldMember) {
    return ensureMemberByName(newName);
  }

  let targetMember = findMemberByName(newName);

  if (!targetMember) {
    oldMember.name = newName;

    if (Array.isArray(oldMember.mileageLogs)) {
      oldMember.mileageLogs.forEach((log) => {
        if (String(log.memberName || "").trim() === oldName) {
          log.memberName = newName;
        }
      });
    }

    if (Array.isArray(oldMember.winLogs)) {
      oldMember.winLogs.forEach((log) => {
        if (String(log.who || "").trim() === oldName) {
          log.who = newName;
        }
      });
    }

    targetMember = oldMember;
  } else if (targetMember.id !== oldMember.id) {
    targetMember.mileage = Number(targetMember.mileage || 0) + Number(oldMember.mileage || 0);

    targetMember.mileageLogs = [
      ...(Array.isArray(targetMember.mileageLogs) ? targetMember.mileageLogs : []),
      ...(Array.isArray(oldMember.mileageLogs) ? oldMember.mileageLogs : []),
    ]
      .map((log) => ({
        ...log,
        memberName: newName,
      }))
      .sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0))
      .slice(0, CONFIG.maxMemberLogs);

    targetMember.winLogs = [
      ...(Array.isArray(targetMember.winLogs) ? targetMember.winLogs : []),
      ...(Array.isArray(oldMember.winLogs) ? oldMember.winLogs : []),
    ]
      .map((log) => ({
        ...log,
        who: newName,
      }))
      .sort((a, b) => Number(b.ts || 0) - Number(a.ts || 0))
      .slice(0, CONFIG.maxMemberLogs);

    store.members.list = store.members.list.filter((m) => m.id !== oldMember.id);
  }

  state.selectedMemberId = targetMember.id;
  store.members.selectedId = targetMember.id;

  return targetMember;
}

  function useSelectedMemberForDraw() {
    const member = getSelectedMember();
    if (!member) {
      alert("먼저 회원을 선택해주세요.");
      return;
    }
    if (refs.drawNicknameInput) refs.drawNicknameInput.value = member.name;
  }

  function renameSelectedMember() {
    const member = getSelectedMember();
    if (!member) {
      alert("수정할 회원이 없습니다.");
      return;
    }

    const nextName = prompt("새 닉네임을 입력해주세요.", member.name || "");
    if (nextName === null) return;

    const trimmed = String(nextName || "").trim();
    if (!trimmed) {
      alert("닉네임은 비워둘 수 없습니다.");
      return;
    }

    const duplicated = store.members.list.find(
      (m) => m.id !== member.id && String(m.name || "").trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicated) {
      alert("같은 닉네임의 회원이 이미 있습니다.");
      return;
    }

    pushHistory();

    const oldName = member.name;
    member.name = trimmed;

    store.members.list.forEach((m) => {
      m.winLogs.forEach((log) => {
        if (log.who === oldName) log.who = trimmed;
      });
    });

    Object.values(store.boards).forEach((boardObj) => {
      const logs = boardObj?.state?.logs;
      if (Array.isArray(logs)) {
        logs.forEach((log) => {
          if (log.who === oldName) log.who = trimmed;
        });
      }
    });

    state.logs.forEach((log) => {
      if (log.who === oldName) log.who = trimmed;
    });

    if (refs.drawNicknameInput?.value?.trim() === oldName) {
      refs.drawNicknameInput.value = trimmed;
    }

    renderAll();
    saveStoreDebounced();
  }

  function deleteSelectedMember() {
    const member = getSelectedMember();
    if (!member) {
      alert("삭제할 회원이 없습니다.");
      return;
    }

    if (!confirm(`${member.name} 회원을 삭제할까요?\n회원 마일리지/회원 기록만 삭제됩니다.`)) return;

    pushHistory();

    store.members.list = store.members.list.filter((m) => m.id !== member.id);
    state.selectedMemberId = null;
    store.members.selectedId = null;

    renderMembers();
    saveStoreDebounced();
  }

  function adjustSelectedMemberMileage(mode) {
    const member = getSelectedMember();
    if (!member) {
      alert("회원을 먼저 선택해주세요.");
      return;
    }

    const raw = prompt(
      mode === "add" ? "추가할 마일리지를 입력해주세요." : "차감할 마일리지를 입력해주세요.",
      "1000"
    );
    if (raw === null) return;

    const amount = Math.floor(Number(raw));
    if (!Number.isFinite(amount) || amount <= 0) {
      alert("1 이상 숫자로 입력해주세요.");
      return;
    }

    const reasonRaw = prompt(
      mode === "add" ? "적립 사유를 입력해주세요." : "차감 사유를 입력해주세요.",
      mode === "add" ? "관리자 수동 적립" : "마일리지 사용"
    );
    if (reasonRaw === null) return;

    const reason = String(reasonRaw || "").trim() || (mode === "add" ? "관리자 수동 적립" : "마일리지 사용");

    pushHistory();

    if (mode === "add") {
      member.mileage += amount;
      member.mileageLogs.unshift({
        id: uid(),
        amount,
        reason,
        timeText: nowText(),
        ts: nowTs(),
      });
    } else {
      member.mileage -= amount;
      member.mileageLogs.unshift({
        id: uid(),
        amount: -amount,
        reason,
        timeText: nowText(),
        ts: nowTs(),
      });
    }

    if (member.mileageLogs.length > CONFIG.maxMemberLogs) {
      member.mileageLogs = member.mileageLogs.slice(0, CONFIG.maxMemberLogs);
    }

    renderMembers();
    saveStoreDebounced();
  }

    function setMode(mode) {
    state.mode = mode;
    document.body.setAttribute("data-mode", mode);

    if (refs.btnToggleMode) {
      refs.btnToggleMode.textContent = mode === "broadcast" ? "방송 모드" : "관리자 모드";
    }

    if (refs.adminPanel) {
      refs.adminPanel.classList.toggle("show", mode === "admin");
    }
  }

  function resetBoardOnly() {
    if (!confirm("현재 쿠지판의 뽑기 진행 상황만 초기화할까요?\n상품 목록은 유지됩니다.")) return;

    pushHistory();

    state.used = {};
    state.selectedNumbers = [];
    state.logs = [];
    state.queue = [];
    state.history = [];

    state.prizes.forEach((p) => {
      if (p.id !== "OJI") p.stock = p.total;
    });

    if (state.settings.lastOnePrize) {
      state.settings.lastOnePrize.claimed = false;
    }

    rebuildAssignments();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStoreDebounced();

    alert("쿠지판 진행 상황이 초기화되었습니다.");
  }

  function injectBoardResetButton() {
    const manageTitleEls = [...document.querySelectorAll(".admin-section-title")];
    const manageTitle = manageTitleEls.find((el) => el.textContent.trim() === "관리");
    const manageSection = manageTitle?.closest(".admin-section");
    const grid = manageSection?.querySelector(".admin-action-grid");
    if (!grid) return;
    if ($("#btnResetBoardOnly")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "btnResetBoardOnly";
    btn.className = "btn danger";
    btn.textContent = "쿠지판 초기화";
    btn.addEventListener("click", resetBoardOnly);

    grid.appendChild(btn);
  }

  async function saveStore() {
    try {
      const current = getCurrentBoard();
      if (current) current.state = exportBoardState();

      store.members = normalizeMembers(store.members);
      store.members.selectedId = state.selectedMemberId || null;

      saveLocalBackup();
      await saveRemoteNow();
      return true;
    } catch (e) {
      console.error("[KUJI] saveStore error:", e);
      saveLocalBackup();
      return false;
    }
  }

  function exportJsonBackup() {
  try {
    const payload = exportMasterPayload();
    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");

    a.href = url;
    a.download = `kuji-backup-${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    alert("JSON 백업 파일이 저장되었습니다.");
  } catch (e) {
    console.error("[KUJI] exportJsonBackup error:", e);
    alert("JSON 내보내기에 실패했습니다.");
  }
}

async function importJsonBackup(file) {
  if (!file) return;

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const raw = String(reader.result || "");
      const parsed = JSON.parse(raw);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("잘못된 JSON 형식");
      }

      if (!confirm("이 백업 파일로 현재 데이터를 덮어쓸까요?")) return;

      pushHistory();

      applyMasterPayload(parsed);
      rebuildAssignmentsIfNeeded();
      rebuildBoardSelect();
      applyBoardVisual();
      buildBoard(state.settings.totalTickets);
      renderAll();

      saveLocalBackup();
      await saveRemoteNow();

      alert("JSON 백업 파일을 불러왔습니다.");
    } catch (e) {
      console.error("[KUJI] importJsonBackup error:", e);
      alert("JSON 가져오기에 실패했습니다. 파일 형식을 확인해주세요.");
    } finally {
      if (refs.jsonImportInput) refs.jsonImportInput.value = "";
    }
  };

  reader.readAsText(file, "utf-8");
}

async function emergencyRestoreFromLocal() {
  try {
    const local = loadLocalBackup();
    if (!local) {
      alert("로컬 백업이 없습니다.");
      return;
    }

    if (!confirm("localStorage 백업으로 현재 데이터를 복구할까요?")) return;

    pushHistory();

    applyMasterPayload(local);
    rebuildAssignmentsIfNeeded();
    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();

    await saveRemoteNow();

    alert("로컬 백업으로 복구했습니다.");
  } catch (e) {
    console.error("[KUJI] emergencyRestoreFromLocal error:", e);
    alert("긴급 복구에 실패했습니다.");
  }
}


  function saveStoreDebounced() {
    try {
      const current = getCurrentBoard();
      if (current) current.state = exportBoardState();

      store.members = normalizeMembers(store.members);
      store.members.selectedId = state.selectedMemberId || null;

      saveLocalBackup();
      saveRemoteDebounced();
    } catch (e) {
      console.error("[KUJI] saveStoreDebounced error:", e);
      saveLocalBackup();
    }
  }

  async function loadStore() {
    let loaded = null;

    const remote = await loadRemoteStore();
    if (remote) {
      loaded = remote;
    } else {
      const local = loadLocalBackup();
      if (local) loaded = local;
    }

    if (!loaded) {
      const initial = normalizeStore(null);
      store.currentBoardId = initial.currentBoardId;
      store.boards = initial.boards;
      store.members = initial.members;
      importBoardState(store.boards[store.currentBoardId].state);
      state.selectedMemberId = store.members.selectedId || null;
      saveLocalBackup();
      return;
    }

    applyMasterPayload(loaded);

    const lastBoardId = localStorage.getItem(LOCAL_LAST_BOARD_KEY);
    if (lastBoardId && store.boards[lastBoardId]) {
      store.currentBoardId = lastBoardId;
      importBoardState(store.boards[store.currentBoardId].state);
    }
  }

  refs.btnToggleMode?.addEventListener("click", () => {
    setMode(state.mode === "broadcast" ? "admin" : "broadcast");
  });

  refs.btnCloseAdmin?.addEventListener("click", () => {
    setMode("broadcast");
  });

  refs.btnSave?.addEventListener("click", async () => {
    const ok = await saveStore();
    alert(ok ? "저장되었습니다." : "로컬 백업만 저장되었습니다.");
  });

  refs.btnLoad?.addEventListener("click", async () => {
    await loadStore();
    rebuildAssignmentsIfNeeded();
    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();
    alert("불러오기 완료");
  });

  refs.btnUndo?.addEventListener("click", () => {
    const snap = state.history.pop();
    if (!snap) {
      alert("되돌릴 내용이 없습니다.");
      return;
    }

    restoreSnapshot(snap);
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStoreDebounced();
  });

  refs.btnReset?.addEventListener("click", () => {
    if (!confirm("현재 쿠지판 데이터를 전체 초기화할까요?")) return;

    pushHistory();

    state.used = {};
    state.selectedNumbers = [];
    state.logs = [];
    state.queue = [];
    state.history = [];
    state.prizes = [createDefaultOjiPrize()];
    state.settings = createDefaultSettings();
    closePrizeEditSection();

    rebuildAssignments();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStoreDebounced();
  });

  refs.btnApplyBasicSettings?.addEventListener("click", () => {
    const title = String(refs.kujiTitleInput?.value || "").trim();
    const price = String(refs.priceInput?.value || "").trim();
    const total = Number(refs.totalTicketsInput?.value);

    if (!title) return alert("쿠지판 이름을 입력하세요.");
    if (!price) return alert("1회 가격을 입력하세요.");
    if (!Number.isFinite(total) || total < 1 || total > 500) {
      return alert("전체 뽑기 수는 1~500 사이로 입력하세요.");
    }

    pushHistory();

    state.settings.kujiTitle = title;
    state.settings.priceText = price;

    if (state.settings.totalTickets !== Math.floor(total)) {
      state.settings.totalTickets = Math.floor(total);
      rebuildAssignments();
      buildBoard(state.settings.totalTickets);
    }

    renderAll();
    saveStoreDebounced();
    alert("기본 설정이 적용되었습니다.");
  });

  refs.btnAddPrize?.addEventListener("click", () => {
    const name = String(refs.prizeNameInput?.value || "").trim();
    const label = refs.prizeTierSelect?.value || "A상";
    const stock = Number(refs.prizeStockInput?.value || 0);
    const imgUrl = String(refs.prizeImgUrlInput?.value || "").trim();

    if (!name) return alert("상품 이름을 입력하세요.");
    if (!Number.isFinite(stock) || stock < 1) return alert("수량은 1 이상이어야 합니다.");
    if (!imgUrl) return alert("이미지 URL을 입력하세요.");

    const nonOjiTotal = state.prizes
      .filter((p) => p.id !== "OJI")
      .reduce((sum, p) => sum + p.total, 0);

    if (nonOjiTotal + stock > state.settings.totalTickets) {
      return alert("상품 수량 합계가 전체 뽑기 수를 넘습니다.");
    }

    pushHistory();

    state.prizes.push({
      id: "P" + Date.now() + Math.random().toString(16).slice(2, 6),
      tier: tierLabelToTierValue(label),
      label,
      name,
      stock,
      total: stock,
      img: imgUrl,
      numbers: [],
    });

    state.prizes.sort((a, b) => a.tier - b.tier);
    rebuildAssignments();
    renderAll();
    saveStoreDebounced();

    if (refs.prizeNameInput) refs.prizeNameInput.value = "";
    if (refs.prizeStockInput) refs.prizeStockInput.value = "1";
    if (refs.prizeImgUrlInput) refs.prizeImgUrlInput.value = "";

    alert("상품이 추가되었습니다.");
  });

  refs.btnSavePrizeEdit?.addEventListener("click", savePrizeEdit);
  refs.btnCancelPrizeEdit?.addEventListener("click", closePrizeEditSection);

  refs.btnApplyLastOne?.addEventListener("click", () => {
    const name = String(refs.lastOneNameInput?.value || "").trim();
    const desc = String(refs.lastOneDescInput?.value || "").trim() || "마지막 뽑기 오픈 시 보너스로 지급";
    const imgUrl = String(refs.lastOneImgUrlInput?.value || "").trim();

    if (!name) return alert("라스트원 상품 이름을 입력하세요.");
    if (!imgUrl) return alert("라스트원 이미지 URL을 입력하세요.");

    pushHistory();

    state.settings.lastOnePrize = {
      label: "LAST ONE",
      name,
      desc,
      img: imgUrl,
      claimed: false,
    };

    renderAll();
    saveStoreDebounced();

    if (refs.lastOneNameInput) refs.lastOneNameInput.value = "";
    if (refs.lastOneDescInput) refs.lastOneDescInput.value = "";
    if (refs.lastOneImgUrlInput) refs.lastOneImgUrlInput.value = "";

    alert("라스트원 상품이 적용되었습니다.");
  });

  refs.btnClearLastOne?.addEventListener("click", () => {
    if (!state.settings.lastOnePrize) return alert("등록된 라스트원 상품이 없습니다.");
    if (!confirm("라스트원 상품을 삭제할까요?")) return;

    pushHistory();
    state.settings.lastOnePrize = null;
    renderAll();
    saveStoreDebounced();
  });

  refs.btnCreateBoard?.addEventListener("click", () => {
    const name = String(refs.newBoardNameInput?.value || "").trim();
    const bgUrl = String(refs.boardBgUrlInput?.value || "").trim();
    const paperUrl = String(refs.boardPaperUrlInput?.value || "").trim();

    if (!name) return alert("새 쿠지판 이름을 입력하세요.");

    const newBoard = createDefaultBoard(name);
    if (bgUrl) newBoard.meta.bgImage = bgUrl;
    if (paperUrl) newBoard.meta.paperImage = paperUrl;

    store.boards[newBoard.meta.id] = newBoard;
    store.currentBoardId = newBoard.meta.id;

    importBoardState(newBoard.state);
    rebuildAssignments();
    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStoreDebounced();

    if (refs.newBoardNameInput) refs.newBoardNameInput.value = "";
    if (refs.boardBgUrlInput) refs.boardBgUrlInput.value = "";
    if (refs.boardPaperUrlInput) refs.boardPaperUrlInput.value = "";

    alert("새 쿠지판이 생성되었습니다.");
  });

  refs.btnApplyBoard?.addEventListener("click", () => {
    const selectedId = refs.boardSelect?.value;
    if (!selectedId || !store.boards[selectedId]) return alert("적용할 쿠지판을 선택하세요.");

    const target = store.boards[selectedId];
    const bgUrl = String(refs.boardBgUrlInput?.value || "").trim();
    const paperUrl = String(refs.boardPaperUrlInput?.value || "").trim();

    if (bgUrl) target.meta.bgImage = bgUrl;
    if (paperUrl) target.meta.paperImage = paperUrl;

    store.currentBoardId = selectedId;
    localStorage.setItem(LOCAL_LAST_BOARD_KEY, selectedId);

    importBoardState(target.state);
    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStoreDebounced();

    if (refs.boardBgUrlInput) refs.boardBgUrlInput.value = "";
    if (refs.boardPaperUrlInput) refs.boardPaperUrlInput.value = "";

    alert("쿠지판이 적용되었습니다.");
  });

  refs.btnDeleteBoard?.addEventListener("click", () => {
    const selectedId = refs.boardSelect?.value;
    if (!selectedId || !store.boards[selectedId]) return alert("삭제할 쿠지판을 선택하세요.");
    if (Object.keys(store.boards).length <= 1) return alert("쿠지판은 최소 1개는 있어야 합니다.");
    if (!confirm("선택한 쿠지판을 삭제할까요?")) return;

    delete store.boards[selectedId];

    if (store.currentBoardId === selectedId) {
      store.currentBoardId = Object.keys(store.boards)[0];
      localStorage.setItem(LOCAL_LAST_BOARD_KEY, store.currentBoardId || "");
      importBoardState(store.boards[store.currentBoardId].state);
    }

    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStoreDebounced();
  });

  refs.btnAddQueue?.addEventListener("click", addQueue);
  refs.queueInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addQueue();
  });

  refs.btnRandomPick?.addEventListener("click", randomSelectCards);

  refs.btnResetSelection?.addEventListener("click", () => {
    state.selectedNumbers = [];
    if (refs.drawNicknameInput) refs.drawNicknameInput.value = "";
    if (refs.randomCountInput) refs.randomCountInput.value = "";
    renderBoardState();
    renderControlState();
    saveStoreDebounced();
  });

  refs.btnOpenSelected?.addEventListener("click", openSelectedCards);

  refs.modalBackdrop?.addEventListener("click", closeModal);
  refs.modalClose?.addEventListener("click", closeModal);

  refs.previewClose?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePreviewModal();
  });

  refs.previewBackdrop?.addEventListener("click", closePreviewModal);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (refs.previewModal?.classList.contains("show")) {
        closePreviewModal();
        return;
      }
      if (refs.memberPanel?.classList.contains("show")) {
        refs.memberPanel.classList.remove("show");
        return;
      }
      if (refs.drawModal?.classList.contains("show")) {
        closeModal();
      }
    }
  });

  refs.btnToggleSound?.addEventListener("click", () => {
    state.settings.soundMuted = !state.settings.soundMuted;
    applySoundSettings();
    saveStoreDebounced();
  });

  refs.soundVolumeRange?.addEventListener("input", () => {
    const nextVolume = Number(refs.soundVolumeRange.value) / 100;
    state.settings.soundVolume = Math.max(0, Math.min(1, nextVolume));
    if (state.settings.soundVolume > 0 && state.settings.soundMuted) {
      state.settings.soundMuted = false;
    }
    applySoundSettings();
    saveStoreDebounced();
  });

  refs.btnAutoPeel?.addEventListener("click", startAutoPeel);

  refs.btnAddMember?.addEventListener("click", addMemberFromInput);
  refs.memberNameInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addMemberFromInput();
  });

  refs.btnUseMemberForDraw?.addEventListener("click", useSelectedMemberForDraw);

  refs.btnRenameMember?.addEventListener("click", renameSelectedMember);
  refs.btnDeleteMember?.addEventListener("click", deleteSelectedMember);

  refs.btnMileageAdd?.addEventListener("click", () => adjustSelectedMemberMileage("add"));
  refs.btnMileageUse?.addEventListener("click", () => adjustSelectedMemberMileage("use"));

  refs.btnEmergencyRestore?.addEventListener("click", emergencyRestoreFromLocal);

refs.btnExportJson?.addEventListener("click", exportJsonBackup);

refs.btnImportJson?.addEventListener("click", () => {
  refs.jsonImportInput?.click();
});

refs.jsonImportInput?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  importJsonBackup(file);
});

  refs.btnMemberSearch?.addEventListener("click", () => {
    state.memberSearchKeyword = String(refs.memberSearchInput?.value || "").trim();
    renderMembers();
  });

  refs.memberSearchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      state.memberSearchKeyword = String(refs.memberSearchInput?.value || "").trim();
      renderMembers();
    }
  });

  refs.memberSearchInput?.addEventListener("input", () => {
    state.memberSearchKeyword = String(refs.memberSearchInput?.value || "").trim();
    renderMembers();
  });

  refs.btnToggleMember?.addEventListener("click", () => {
    refs.memberPanel?.classList.add("show");
  });

  refs.btnCloseMember?.addEventListener("click", () => {
    refs.memberPanel?.classList.remove("show");
  });

  function boot() {
  initSupabase();
  loadStore().then(() => {
    rebuildAssignmentsIfNeeded();
    rebuildBoardSelect();
    applyBoardVisual();
    injectExtraUi();
    injectBoardResetButton();
    buildBoard(state.settings.totalTickets);
    renderAll();
    bindPeelEvents();
    setMode(state.mode || "broadcast");

    window.__KUJI__ = {
      state,
      store,
      rebuildAssignments,
      startDraw,
      addMileageToMember,
      saveStore,
      forceSaveAll,
      DB,
    };
  });
}

  boot();
})();
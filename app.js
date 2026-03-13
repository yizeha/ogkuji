(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

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
    MASTER_KEY: "kuji_multi_board_store_v1",
    drawDelayMs: 1000,
  };

  function createDefaultOjiPrize() {
    return {
      id: "OJI",
      tier: 99,
      label: "오지상",
      name: "(굿즈 or 마일리지)",
      stock: 99999,
      total: 99999,
      img: "https://pub-37a77700097c4252a3986c9f06eed562.r2.dev/logos/oji_goods.png",
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

  const store = {
    currentBoardId: null,
    boards: {},
  };

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
  };

  const board = $("#board");

  const btnReset = $("#btnReset");
  const btnUndo = $("#btnUndo");
  const btnSave = $("#btnSave");
  const btnLoad = $("#btnLoad");

  const winList = $("#winList");
  const prizeList = $("#prizeList");
  const prizeSummary = $("#prizeSummary");

  const btnToggleMode = $("#btnToggleMode");
  const adminPanel = $("#adminPanel");
  const btnCloseAdmin = $("#btnCloseAdmin");

  const totalTicketsInput = $("#totalTicketsInput");
  const kujiTitleText = $("#kujiTitleText");
  const kujiTitleInput = $("#kujiTitleInput");
  const priceInput = $("#priceInput");
  const btnApplyBasicSettings = $("#btnApplyBasicSettings");

  const queueInput = $("#queueInput");
  const btnAddQueue = $("#btnAddQueue");
  const queueList = $("#queueList");

  const prizeNameInput = $("#prizeNameInput");
  const prizeTierSelect = $("#prizeTierSelect");
  const prizeStockInput = $("#prizeStockInput");
  const prizeImgUrlInput = $("#prizeImgUrlInput");
  const btnAddPrize = $("#btnAddPrize");
  const adminPrizeList = $("#adminPrizeList");

  const lastOneNameInput = $("#lastOneNameInput");
  const lastOneDescInput = $("#lastOneDescInput");
  const lastOneImgUrlInput = $("#lastOneImgUrlInput");
  const btnApplyLastOne = $("#btnApplyLastOne");
  const btnClearLastOne = $("#btnClearLastOne");

  const boardSelect = $("#boardSelect");
  const newBoardNameInput = $("#newBoardNameInput");
  const boardBgUrlInput = $("#boardBgUrlInput");
  const boardPaperUrlInput = $("#boardPaperUrlInput");
  const btnCreateBoard = $("#btnCreateBoard");
  const btnApplyBoard = $("#btnApplyBoard");
  const btnDeleteBoard = $("#btnDeleteBoard");

  const progressInner = $("#progressInner");
  const progressPercent = $("#progressPercent");
  const openedCount = $("#openedCount");
  const totalCount = $("#totalCount");

  const statTotalTickets = $("#statTotalTickets");
  const statRemainTickets = $("#statRemainTickets");
  const statOpenedTickets = $("#statOpenedTickets");

  const drawNicknameInput = $("#drawNicknameInput");
  const randomCountInput = $("#randomCountInput");
  const btnRandomPick = $("#btnRandomPick");
  const btnResetSelection = $("#btnResetSelection");
  const btnOpenSelected = $("#btnOpenSelected");

  const priceText = $("#priceText");
  const accountText = $("#accountText");
  const topBoardLogo = $("#topBoardLogo");
  const topLogo = $("#topLogo");

  const btnToggleSound = $("#btnToggleSound");
  const soundVolumeRange = $("#soundVolumeRange");

  const drawModal = $("#drawModal");
  const modalBackdrop = $("#modalBackdrop");
  const modalClose = $("#modalClose");
  const modalTitle = $("#modalTitle");
  const modalSub = $("#modalSub");
  const modalResultNumber = $("#modalResultNumber");
  const modalResultImg = $("#modalResultImg");
  const modalPaper = $("#modalPaper");
  const modalRevealBig = $("#modalRevealBig");
  const modalRevealSmall = $("#modalRevealSmall");
  const modalConfetti = $("#modalConfetti");

  const previewModal = $("#previewModal");
  const previewBackdrop = $("#previewBackdrop");
  const previewClose = $("#previewClose");
  const previewTitle = $("#previewTitle");
  const previewSub = $("#previewSub");
  const previewImg = $("#previewImg");

  const editPrizeSection = $("#editPrizeSection");
  const editPrizeNameInput = $("#editPrizeNameInput");
  const editPrizeTierSelect = $("#editPrizeTierSelect");
  const editPrizeStockInput = $("#editPrizeStockInput");
  const editPrizeImgInput = $("#editPrizeImgInput");
  const btnSavePrizeEdit = $("#btnSavePrizeEdit");
  const btnCancelPrizeEdit = $("#btnCancelPrizeEdit");
  const editPrizeHint = $("#editPrizeHint");

  const fanfare = $("#fanfare");
  const peelSound = $("#peelSound");
  const lastOneSound = $("#lastOneSound");
  const lowTierSound = $("#lowTierSound");

  const modalStagePeel = $("#modalStagePeel");
  const modalStageResult = $("#modalStageResult");
  const modalPaperImg = $("#modalPaperImg");
  const modalResultPanel = $("#modalResultPanel");
  const modalHeader = drawModal?.querySelector(".modal-header");
  const btnAutoPeel = $("#btnAutoPeel");

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
  let extraUiInjected = false;
  let currentViewingLogTs = null;
let btnEditWinnerName = null;

  if (modalResultImg) {
    modalResultImg.onerror = () => {
      modalResultImg.onerror = null;
      modalResultImg.removeAttribute("src");
      modalResultImg.classList.add("is-hidden");
    };
  }

  function sleep(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  function uid() {
    try {
      return crypto.randomUUID();
    } catch {
      return String(Date.now()) + Math.random().toString(16).slice(2);
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

  function tierLabelToTierValue(label) {
    const map = {
      "A상": 1,
      "B상": 2,
      "C상": 3,
      "D상": 4,
      "E상": 5,
    };
    return map[label] || 999;
  }

  function normalizePrize(p) {
    const label = String(p.label || "").trim() || "기타";
    return {
      id: p.id,
      tier: Number.isFinite(Number(p.tier)) ? Number(p.tier) : tierLabelToTierValue(label),
      label,
      name: String(p.name || "").trim() || "상품",
      stock: Math.max(0, Number(p.stock) || 0),
      total: typeof p.total === "number" ? p.total : Math.max(0, Number(p.stock) || 0),
      img: p.img || CONFIG.defaultEmptyResultImage,
      numbers: Array.isArray(p.numbers) ? p.numbers.map(Number).filter(Number.isFinite) : [],
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

  function exportState() {
    return {
      mode: state.mode,
      used: state.used,
      selectedNumbers: state.selectedNumbers,
      logs: state.logs,
      queue: state.queue,
      settings: state.settings,
      prizes: state.prizes,
      ticketResults: state.ticketResults,
    };
  }

  function importState(payload) {
    state.mode = payload?.mode || "broadcast";
    state.used = payload?.used || {};
    state.selectedNumbers = Array.isArray(payload?.selectedNumbers) ? payload.selectedNumbers.map(Number) : [];
    state.logs = Array.isArray(payload?.logs) ? payload.logs : [];
    state.queue = Array.isArray(payload?.queue) ? payload.queue : [];
    state.history = [];
    state.editingPrizeId = null;

    state.settings = payload?.settings || createDefaultSettings();
    if (!Number.isFinite(state.settings.totalTickets) || state.settings.totalTickets < 1) {
      state.settings.totalTickets = CONFIG.defaultTotalTickets;
    }
    if (!state.settings.kujiTitle) {
      state.settings.kujiTitle = "오지상 쿠지";
    }
    state.settings.priceText = state.settings.priceText || "14,000원";
    state.settings.accountText = state.settings.accountText || "기업은행 153-084786-01019 양*준";
    state.settings.lastOnePrize = normalizeLastOnePrize(state.settings.lastOnePrize);

    if (typeof state.settings.soundVolume !== "number") {
      state.settings.soundVolume = 0.35;
    }
    if (typeof state.settings.soundMuted !== "boolean") {
      state.settings.soundMuted = false;
    }

    if (Array.isArray(payload?.prizes) && payload.prizes.length > 0) {
      state.prizes = payload.prizes.map(normalizePrize);
    } else {
      state.prizes = [createDefaultOjiPrize()];
    }

    if (!state.prizes.find((p) => p.id === "OJI")) {
      state.prizes.push(createDefaultOjiPrize());
    }

    state.prizes.sort((a, b) => a.tier - b.tier);
    state.ticketResults = payload?.ticketResults || {};
  }

  function getCurrentBoard() {
    return store.boards[store.currentBoardId];
  }

  function saveStore() {
    const current = getCurrentBoard();
    if (current) current.state = exportState();
    localStorage.setItem(CONFIG.MASTER_KEY, JSON.stringify(store));
  }

  function loadStore() {
    const raw = localStorage.getItem(CONFIG.MASTER_KEY);

    if (!raw) {
      const initialBoards = createInitialBoards();
      initialBoards.forEach((boardObj) => {
        store.boards[boardObj.meta.id] = boardObj;
      });
      store.currentBoardId = initialBoards[0].meta.id;
      importState(initialBoards[0].state);
      saveStore();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      store.currentBoardId = parsed.currentBoardId;
      store.boards = parsed.boards || {};

      const current = getCurrentBoard();
      if (!current) {
        const initialBoards = createInitialBoards();
        initialBoards.forEach((boardObj) => {
          store.boards[boardObj.meta.id] = boardObj;
        });
        store.currentBoardId = initialBoards[0].meta.id;
        importState(initialBoards[0].state);
      } else {
        importState(current.state);
      }
    } catch {
      const initialBoards = createInitialBoards();
      store.boards = {};
      initialBoards.forEach((boardObj) => {
        store.boards[boardObj.meta.id] = boardObj;
      });
      store.currentBoardId = initialBoards[0].meta.id;
      importState(initialBoards[0].state);
      saveStore();
    }
  }

  function makeLightState() {
    return {
      mode: state.mode,
      used: state.used,
      selectedNumbers: state.selectedNumbers,
      logs: state.logs.slice(-100),
      queue: state.queue,
      settings: state.settings,
      prizes: state.prizes,
      ticketResults: state.ticketResults,
    };
  }

  function pushHistory() {
    try {
      state.history.push(JSON.stringify(makeLightState()));
      if (state.history.length > 10) state.history.shift();
    } catch {}
  }

  function getAllAudioEls() {
    return [fanfare, peelSound, lastOneSound, lowTierSound].filter(Boolean);
  }

  function applySoundSettings() {
    const volume = state.settings.soundMuted ? 0 : state.settings.soundVolume;

    getAllAudioEls().forEach((audio) => {
      try {
        audio.volume = Math.max(0, Math.min(1, volume));
        audio.muted = !!state.settings.soundMuted;
      } catch {}
    });

    if (soundVolumeRange) {
      soundVolumeRange.value = String(Math.round((state.settings.soundVolume || 0) * 100));
    }

    if (btnToggleSound) {
      btnToggleSound.textContent = state.settings.soundMuted ? "🔇 음소거" : "🔊 사운드";
      btnToggleSound.classList.toggle("muted", !!state.settings.soundMuted);
    }
  }

  function applyBoardVisual() {
    const current = getCurrentBoard();
    if (!current) return;

    document.body.style.backgroundImage = `url("${current.meta.bgImage || CONFIG.defaultBgImage}")`;

    if (topBoardLogo) topBoardLogo.src = CONFIG.defaultBoardLogo;
    if (topLogo) topLogo.src = CONFIG.defaultTopLogo;
  }

  function rebuildBoardSelect() {
    if (!boardSelect) return;
    boardSelect.innerHTML = "";

    Object.values(store.boards).forEach((boardObj) => {
      const opt = document.createElement("option");
      opt.value = boardObj.meta.id;
      opt.textContent = boardObj.meta.name;
      if (boardObj.meta.id === store.currentBoardId) opt.selected = true;
      boardSelect.appendChild(opt);
    });
  }

  function rebuildAssignments() {
    const total = state.settings.totalTickets;
    const allNumbers = shuffle(Array.from({ length: total }, (_, i) => i + 1));

    let cursor = 0;
    state.prizes.forEach((p) => {
      if (p.id === "OJI") {
        p.numbers = [];
        return;
      }
      p.numbers = allNumbers.slice(cursor, cursor + p.total).sort((a, b) => a - b);
      cursor += p.total;
      p.stock = p.total;
    });

    const ticketNumbers = shuffle(Array.from({ length: total }, (_, i) => i + 1));
    state.ticketResults = {};
    for (let i = 1; i <= total; i++) {
      state.ticketResults[String(i)] = ticketNumbers[i - 1];
    }

    state.used = {};
    state.selectedNumbers = [];
    state.logs = [];
    if (state.settings.lastOnePrize) state.settings.lastOnePrize.claimed = false;
  }

  function findPrizeByResultNumber(resultNumber) {
    for (const p of state.prizes) {
      if (p.id === "OJI") continue;
      if (Array.isArray(p.numbers) && p.numbers.includes(resultNumber)) return p;
    }
    return state.prizes.find((p) => p.id === "OJI") || createDefaultOjiPrize();
  }

  function isOjiResultNumber(resultNumber) {
  return !state.prizes.some((p) => {
    if (p.id === "OJI") return false;
    return Array.isArray(p.numbers) && p.numbers.includes(resultNumber);
  });
}

  function getOpenedCount() {
    return Object.keys(state.used).length;
  }

  function getEditingPrize() {
    return state.prizes.find((p) => p.id === state.editingPrizeId) || null;
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.setAttribute("data-mode", mode);

    if (btnToggleMode) {
      btnToggleMode.textContent = mode === "broadcast" ? "방송 모드" : "관리자 모드";
    }

    if (adminPanel) adminPanel.classList.toggle("show", mode === "admin");
    saveStore();
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve("");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function closePrizeEditSection() {
    state.editingPrizeId = null;

    if (editPrizeSection) editPrizeSection.style.display = "none";
    if (editPrizeNameInput) editPrizeNameInput.value = "";
    if (editPrizeTierSelect) editPrizeTierSelect.value = "A상";
    if (editPrizeStockInput) {
      editPrizeStockInput.value = "1";
      editPrizeStockInput.disabled = false;
    }
    if (editPrizeImgInput) editPrizeImgInput.value = "";

    if (editPrizeHint) {
      editPrizeHint.textContent = "이미 추첨이 시작된 뒤에는 수량 변경을 막아두었습니다.";
    }
  }

  function openPrizeEditSection(prizeId) {
    const prize = state.prizes.find((p) => p.id === prizeId);
    if (!prize) return;

    if (prize.id === "OJI") {
      alert("기본 오지상 상품은 수정 대상에서 제외했습니다.");
      return;
    }

    state.editingPrizeId = prize.id;

    if (editPrizeSection) editPrizeSection.style.display = "block";
    if (editPrizeNameInput) editPrizeNameInput.value = prize.name;
    if (editPrizeTierSelect) editPrizeTierSelect.value = prize.label;
    if (editPrizeStockInput) editPrizeStockInput.value = String(prize.total);
    if (editPrizeImgInput) editPrizeImgInput.value = "";

    const anyOpened = getOpenedCount() > 0;
    if (editPrizeStockInput) editPrizeStockInput.disabled = anyOpened;

    if (editPrizeHint) {
      editPrizeHint.textContent = anyOpened
        ? "이미 추첨이 시작되어 수량 변경은 잠겨 있습니다. 이름 / 등급 / 이미지만 수정할 수 있습니다."
        : "아직 추첨 전이라 이름 / 등급 / 수량 / 이미지 모두 수정할 수 있습니다.";
    }

    editPrizeSection?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }

  async function savePrizeEdit() {
    const prize = getEditingPrize();
    if (!prize) {
      alert("수정 중인 상품이 없습니다.");
      return;
    }

    const nextName = (editPrizeNameInput?.value || "").trim();
    const nextLabel = editPrizeTierSelect?.value || "A상";
    const nextTotal = Number(editPrizeStockInput?.value || 0);
    const nextFile = editPrizeImgInput?.files?.[0] || null;

    if (!nextName) {
      alert("상품 이름을 입력하세요.");
      return;
    }

    const validLabels = ["A상", "B상", "C상", "D상", "E상"];
    if (!validLabels.includes(nextLabel)) {
      alert("등급 값이 올바르지 않습니다.");
      return;
    }

    const anyOpened = getOpenedCount() > 0;

    if (!anyOpened) {
      if (!Number.isFinite(nextTotal) || nextTotal < 1) {
        alert("수량은 1 이상이어야 합니다.");
        return;
      }

      const otherTotal = state.prizes
        .filter((p) => p.id !== "OJI" && p.id !== prize.id)
        .reduce((sum, p) => sum + p.total, 0);

      if (otherTotal + Math.floor(nextTotal) > state.settings.totalTickets) {
        alert("다른 상품 수량과 합치면 전체 뽑기 수를 초과합니다.");
        return;
      }
    }

    pushHistory();

    prize.name = nextName;
    prize.label = nextLabel;
    prize.tier = tierLabelToTierValue(nextLabel);

    if (nextFile) {
      try {
        const dataUrl = await readFileAsDataURL(nextFile);
        if (dataUrl) prize.img = dataUrl;
      } catch {
        alert("이미지 파일을 읽는 중 오류가 발생했습니다.");
        return;
      }
    }

    if (!anyOpened) {
      prize.total = Math.floor(nextTotal);
      prize.stock = Math.floor(nextTotal);
    }

    state.prizes.sort((a, b) => a.tier - b.tier);

    if (!anyOpened) rebuildAssignments();

    renderAll();
    saveStore();
    closePrizeEditSection();
    alert("상품이 수정되었습니다.");
  }

  function openPreviewModal({ title = "상품 미리보기", sub = "", img = "" }) {
    if (!previewModal || !previewImg) return;

    if (previewTitle) previewTitle.textContent = title;
    if (previewSub) previewSub.textContent = sub || "";

    previewImg.src = img || CONFIG.defaultEmptyResultImage;
    previewImg.onerror = () => {
      previewImg.onerror = null;
      previewImg.src = CONFIG.defaultEmptyResultImage;
    };

    previewModal.classList.add("show");
    previewModal.setAttribute("aria-hidden", "false");
  }

  function closePreviewModal() {
    if (!previewModal) return;
    previewModal.classList.remove("show");
    previewModal.setAttribute("aria-hidden", "true");
    if (previewImg) previewImg.src = "";
  }

  function addQueue() {
    const name = (queueInput?.value || "").trim();
    if (!name) return;

    state.queue.push({ id: uid(), name });
    if (queueInput) queueInput.value = "";
    renderQueue();
    saveStore();
  }

  function renderQueue() {
    if (!queueList) return;
    queueList.innerHTML = "";

    if (state.queue.length === 0) {
      const empty = document.createElement("div");
      empty.style.color = "rgba(255,255,255,.55)";
      empty.style.fontFamily = "var(--mono)";
      empty.style.fontSize = "12px";
      empty.textContent = "현재 대기자가 없습니다.";
      queueList.appendChild(empty);
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
        saveStore();
      });

      wrap.appendChild(name);
      wrap.appendChild(rm);
      queueList.appendChild(wrap);
    });
  }

  function renderControlState() {
    if (btnOpenSelected) {
      btnOpenSelected.textContent = `▶ OPEN! (${state.selectedNumbers.length})`;
    }
  }

  function randomSelectCards() {
    const count = Number(randomCountInput?.value || 0);
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

    if (available.length === 0) {
      alert("선택 가능한 뽑기가 없습니다.");
      return;
    }

    const picked = shuffle(available).slice(0, Math.min(count, available.length));
    state.selectedNumbers = [...new Set([...state.selectedNumbers, ...picked])].sort((a, b) => a - b);

    renderBoardState();
    renderControlState();
    saveStore();
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
    saveStore();
  }

  function buildBoard(total) {
    if (!board) return;
    board.innerHTML = "";

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
        saveStore();
      });

      board.appendChild(btn);
    }

    renderBoardState();
  }

  function renderBoardState() {
    if (!board) return;

    [...board.children].forEach((btn) => {
      const n = Number(btn.dataset.n);
      btn.classList.toggle("used", !!state.used[String(n)]);
      btn.classList.toggle("selected", state.selectedNumbers.includes(n));
    });
  }

  function formatNumberBadgeText(numbers) {
    if (!numbers || !numbers.length) return "번호 없음";
    const sorted = [...numbers].sort((a, b) => a - b);
    return sorted.join(" · ");
  }

  function renderPrizes() {
    if (!prizeList || !prizeSummary) return;
    prizeList.innerHTML = "";

    const total = state.settings.totalTickets;
    const opened = Object.keys(state.used).length;
    const left = total - opened;
    prizeSummary.textContent = `남은 수량 ${left} / 총 ${total}`;

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

      prizeList.appendChild(card);
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
          const subText = p.id === "OJI" ? "기본 꽝 상품" : `${p.label} · 남은 ${p.stock}/${p.total}`;
          openPreviewModal({
            title: `${p.label} ${p.name}`,
            sub: subText,
            img: p.img || CONFIG.defaultEmptyResultImage,
          });
        });

        prizeList.appendChild(card);
      });
  }

  function findManualTicketForPrize(prize) {
  if (!prize) return null;

  if (prize.id === "OJI") {
    const remainOjiTicket = Object.keys(state.ticketResults).find((ticketNo) => {
      if (state.used[ticketNo]) return false;
      const resultNumber = Number(state.ticketResults[ticketNo]);
      return isOjiResultNumber(resultNumber);
    });

    if (remainOjiTicket) {
      return {
        ticketNumber: Number(remainOjiTicket),
        resultNumber: Number(state.ticketResults[remainOjiTicket]),
      };
    }
    return null;
  }

  const remainPrizeNumbers = (prize.numbers || []).filter((num) => {
    const usedTicket = Object.keys(state.used).find((ticketNo) => {
      if (!state.used[ticketNo]) return false;
      return Number(state.ticketResults[ticketNo]) === Number(num);
    });
    return !usedTicket;
  });

  for (const resultNumber of remainPrizeNumbers) {
    const ticketNumber = Object.keys(state.ticketResults).find((ticketNo) => {
      return !state.used[ticketNo] && Number(state.ticketResults[ticketNo]) === Number(resultNumber);
    });

    if (ticketNumber) {
      return {
        ticketNumber: Number(ticketNumber),
        resultNumber: Number(resultNumber),
      };
    }
  }

  return null;
}

  function manualAwardPrize(prizeId) {
  const prize = state.prizes.find((p) => p.id === prizeId);
  if (!prize) {
    alert("수동당첨 대상 상품이 아닙니다.");
    return;
  }

  let manualCount = 1;

  if (prize.id === "OJI") {
    const remainOjiCount = Object.keys(state.ticketResults).filter((ticketNo) => {
      if (state.used[ticketNo]) return false;
      const resultNumber = Number(state.ticketResults[ticketNo]);
      return isOjiResultNumber(resultNumber);
    }).length;

    if (remainOjiCount <= 0) {
      alert("남아 있는 오지상 티켓이 없습니다.");
      return;
    }

    const countInput = prompt(
      `오지상 수동당첨을 몇 장 처리할까요?\n남은 가능 수량: ${remainOjiCount}장`,
      "1"
    );
    if (countInput === null) return;

    manualCount = Math.floor(Number(countInput));
    if (!Number.isFinite(manualCount) || manualCount < 1) {
      alert("수량은 1 이상 숫자로 입력해주이소.");
      return;
    }

    if (manualCount > remainOjiCount) {
      alert(`남은 오지상 가능 수량은 ${remainOjiCount}장입니더.`);
      return;
    }
  } else {
    if (prize.stock <= 0) {
      alert("이 상품은 이미 수량이 없습니다.");
      return;
    }
  }

  const nickname = prompt(
    `${prize.label} ${prize.name}\n수동 당첨 닉네임을 입력해주이소.`,
    ""
  );
  if (nickname === null) return;

  const who = String(nickname || "").trim();
  if (!who) {
    alert("닉네임을 입력해야 합니더.");
    return;
  }

  pushHistory();

  const createdLogs = [];

  for (let i = 0; i < manualCount; i++) {
    const matched = findManualTicketForPrize(prize);
    if (!matched) break;

    const openedBefore = Object.keys(state.used).length;
    const isLastDraw = openedBefore + 1 === state.settings.totalTickets;

    const lastOnePrize =
      isLastDraw &&
      state.settings.lastOnePrize &&
      !state.settings.lastOnePrize.claimed
        ? state.settings.lastOnePrize
        : null;

    if (prize.id !== "OJI") {
      prize.stock = Math.max(0, prize.stock - 1);
    }

    state.used[String(matched.ticketNumber)] = true;
    state.selectedNumbers = state.selectedNumbers.filter((x) => x !== matched.ticketNumber);

    if (lastOnePrize) {
      lastOnePrize.claimed = true;
    }

    const displayPrizeName = lastOnePrize
      ? `${prize.name} + ${lastOnePrize.name}`
      : prize.name;

    const displayTierText = lastOnePrize
      ? `${prize.label} + LAST ONE`
      : prize.label;

    const displayImg = lastOnePrize
      ? (lastOnePrize.img || prize.img || "")
      : (prize.img || "");

    const log = {
      ticketNumber: matched.ticketNumber,
      resultNumber: matched.resultNumber,
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
      ts: Date.now() + i,
      isManual: true,
    };

    state.logs.push(log);
    createdLogs.push(log);
  }

  if (state.logs.length > 100) {
    state.logs = state.logs.slice(-100);
  }

  renderAll();
  saveStore();

  if (!createdLogs.length) {
    alert("처리할 수 있는 수동당첨 티켓을 찾지 못했습니다.");
    return;
  }

  const lastLog = createdLogs[createdLogs.length - 1];

  openModal();
  fillResultPanel(
    {
      prizeName:
        createdLogs.length > 1
          ? `${lastLog.displayPrizeName} 외 ${createdLogs.length - 1}건`
          : lastLog.displayPrizeName,
      tierText: lastLog.displayTierText,
      ticketNumber: lastLog.ticketNumber,
      who,
      prizeImg: lastLog.prizeImg,
      tier: lastLog.tier,
      hasLastOne: !!lastLog.hasLastOne,
    },
    { withEffects: true }
  );

  if (modalTitle) modalTitle.textContent = "수동 당첨 처리";
  if (modalSub) {
    modalSub.textContent =
      createdLogs.length > 1
        ? `관리자 수동 처리 · 총 ${createdLogs.length}건 처리 완료`
        : `관리자 수동 처리 · 결과 번호 ${lastLog.resultNumber}`;
  }
}

  function renderAdminPrizeList() {
    if (!adminPrizeList) return;
    adminPrizeList.innerHTML = "";

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
      if (p.id === "OJI") sub.textContent = "기본 상품";
      else sub.textContent = `남은 ${p.stock}/${p.total} · 번호 ${p.numbers.join(", ")}`;

      meta.appendChild(title);
      meta.appendChild(sub);

      const actions = document.createElement("div");
      actions.className = "admin-prize-actions";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "admin-prize-edit";

      const manual = document.createElement("button");
      manual.type = "button";
      manual.className = "admin-prize-manual";

      const del = document.createElement("button");
      del.type = "button";
      del.className = "admin-prize-delete";

      if (p.id === "OJI") {
  edit.textContent = "기본";
  edit.disabled = true;
  edit.style.opacity = ".5";
  edit.style.cursor = "default";

  manual.textContent = "수동당첨";
  manual.disabled = false;
  manual.style.opacity = "1";
  manual.style.cursor = "pointer";
  manual.addEventListener("click", () => manualAwardPrize(p.id));

  del.textContent = "기본";
  del.disabled = true;
  del.style.opacity = ".5";
  del.style.cursor = "default";
}
      
      else {
        edit.textContent = "수정";
        edit.addEventListener("click", () => openPrizeEditSection(p.id));

        manual.textContent = "수동당첨";
        manual.addEventListener("click", () => manualAwardPrize(p.id));

        del.textContent = "삭제";
        del.addEventListener("click", () => {
          if (!confirm(`${p.label} ${p.name} 상품을 삭제할까요?`)) return;
          pushHistory();
          state.prizes = state.prizes.filter((item) => item.id !== p.id);

          if (state.editingPrizeId === p.id) closePrizeEditSection();

          rebuildAssignments();
          renderAll();
          saveStore();
        });
      }

      actions.appendChild(edit);
      actions.appendChild(manual);
      actions.appendChild(del);

      item.appendChild(thumb);
      item.appendChild(meta);
      item.appendChild(actions);
      adminPrizeList.appendChild(item);
    });
  }

  function renderWinList() {
    if (!winList) return;
    winList.innerHTML = "";

    if (state.logs.length === 0) {
      const empty = document.createElement("div");
      empty.style.color = "rgba(255,255,255,.55)";
      empty.style.fontFamily = "var(--mono)";
      empty.style.fontSize = "12px";
      empty.textContent = "아직 당첨 결과가 없습니다.";
      winList.appendChild(empty);
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
      if (item.prizeId === "오지상") row.classList.add("tier-oji");

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

      row.addEventListener("click", () => openWinLogResult(item));
      winList.appendChild(row);
    });
  }

  function stopPeelSound() {
    if (!peelSound) return;
    try {
      peelSound.pause();
      peelSound.currentTime = 0;
    } catch {}
  }

  function stopAutoPeel() {
    if (autoPeelRaf) {
      cancelAnimationFrame(autoPeelRaf);
      autoPeelRaf = null;
    }
    autoPeelRunning = false;

    if (btnAutoPeel) {
      btnAutoPeel.disabled = false;
      btnAutoPeel.textContent = "자동 오픈 !";
    }
  }

  function stopAllRewardSounds() {
    [fanfare, lastOneSound, lowTierSound].forEach((audio) => {
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
  }

  function playLowTierSound(tierText = "") {
  if (tierText === "오지상") return;
  if (!lowTierSound) return;
  try {
    stopAllRewardSounds();
    lowTierSound.currentTime = 0;
    lowTierSound.play().catch(() => {});
  } catch {}
}

  function playFanfare() {
    if (!CONFIG.useFanfare || !fanfare) return;
    try {
      stopAllRewardSounds();
      fanfare.currentTime = 0;
      fanfare.play().catch(() => {});
    } catch {}
  }

  function playLastOneSound() {
    if (!lastOneSound) return;
    try {
      stopAllRewardSounds();
      lastOneSound.currentTime = 0;
      lastOneSound.play().catch(() => {});
    } catch {}
  }

  function playPeelSound() {
    if (!peelSound) return;
    try {
      stopPeelSound();
      peelSound.currentTime = 0;
      peelSound.play().catch(() => {});
    } catch {}
  }

  function renderProgress() {
    const total = state.settings.totalTickets;
    const opened = Object.keys(state.used).length;
    const remain = Math.max(0, total - opened);
    const pct = total ? Math.round((opened / total) * 100) : 0;

    if (openedCount) openedCount.textContent = String(opened);
    if (totalCount) totalCount.textContent = String(total);
    if (progressInner) progressInner.style.width = `${pct}%`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;

    if (statTotalTickets) statTotalTickets.textContent = `${total}장`;
    if (statRemainTickets) statRemainTickets.textContent = `${remain}장`;
    if (statOpenedTickets) statOpenedTickets.textContent = `${opened}장`;
  }

  function renderAll() {
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

    if (kujiTitleText) kujiTitleText.textContent = state.settings.kujiTitle;
    if (kujiTitleInput) kujiTitleInput.value = state.settings.kujiTitle;
    if (totalTicketsInput) totalTicketsInput.value = String(state.settings.totalTickets);

    if (priceText) priceText.textContent = state.settings.priceText;
    if (accountText) accountText.textContent = state.settings.accountText;
    if (priceInput) priceInput.value = state.settings.priceText || "";

    if (lastOneNameInput) lastOneNameInput.value = state.settings.lastOnePrize?.name || "";
    if (lastOneDescInput) lastOneDescInput.value = state.settings.lastOnePrize?.desc || "";

    if (state.editingPrizeId) {
      const editingPrize = getEditingPrize();
      if (!editingPrize) closePrizeEditSection();
    } else {
      if (editPrizeSection) editPrizeSection.style.display = "none";
    }
  }

  function injectExtraUi() {
  if (extraUiInjected) return;
  extraUiInjected = true;

  const style = document.createElement("style");
  style.textContent = `
    .result-tier-badge{
      order: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin: 0 0 14px;
      padding: 8px 16px;
      border-radius: 999px;
      font-size: 18px;
      font-weight: 900;
      color: #fff6cf;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.18);
      box-shadow: 0 6px 18px rgba(0,0,0,.18);
      text-shadow: 0 2px 8px rgba(0,0,0,.45);
    }
    .winrow{
      cursor: pointer;
    }
    .winrow:hover{
      filter: brightness(1.05);
    }
    .admin-prize-manual{
      border: 1px solid rgba(255,195,77,.55);
      background: rgba(255,195,77,.12);
      color: var(--text);
      padding: 10px 12px;
      border-radius: 12px;
      cursor: pointer;
      font-weight: 900;
      font-size: 11px;
      white-space: nowrap;
    }
    .admin-prize-manual:hover{
      background: rgba(255,195,77,.22);
    }
    .modal-header{
      position: relative;
    }
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
  `;
  document.head.appendChild(style);

  if (drawModal && !drawModal.querySelector(".modal-flash")) {
    const flash = document.createElement("div");
    flash.className = "modal-flash";
    const modalBody = drawModal.querySelector(".modal-body");
    if (modalBody) modalBody.appendChild(flash);
  }

  if (modalHeader && !$("#btnEditWinnerName", modalHeader)) {
    btnEditWinnerName = document.createElement("button");
    btnEditWinnerName.type = "button";
    btnEditWinnerName.id = "btnEditWinnerName";
    btnEditWinnerName.className = "modal-edit-top-btn is-hidden";
    btnEditWinnerName.textContent = "닉네임 수정";

    btnEditWinnerName.addEventListener("click", () => {
      editCurrentViewingWinnerName();
    });

    modalHeader.appendChild(btnEditWinnerName);
  } else {
    btnEditWinnerName = $("#btnEditWinnerName", modalHeader);
  }
}

  function ensureResultTierBadge() {
    if (!modalResultPanel) return null;

    let badge = modalResultPanel.querySelector(".result-tier-badge");
    if (!badge) {
      badge = document.createElement("div");
      badge.className = "result-tier-badge";
      modalResultPanel.prepend(badge);
    }
    return badge;
  }

  function setResultTierBadge(text) {
    const badge = ensureResultTierBadge();
    if (!badge) return;
    badge.textContent = text || "";
    badge.style.display = text ? "inline-flex" : "none";
  }

  function resolveCurrentDraw() {
    if (typeof currentDrawResolver === "function") {
      const fn = currentDrawResolver;
      currentDrawResolver = null;
      fn();
    }
  }

  function commitPendingDrawIfNeeded() {
    if (!pendingDrawCommit || pendingDrawCommitted) return;

    const tx = pendingDrawCommit;

    if (tx.prize.id !== "OJI") tx.prize.stock = Math.max(0, tx.prize.stock - 1);
    if (tx.lastOnePrize) tx.lastOnePrize.claimed = true;

    state.used[String(tx.ticketNumber)] = true;
    state.selectedNumbers = state.selectedNumbers.filter((x) => x !== tx.ticketNumber);

    state.logs.push(tx.log);
    if (state.logs.length > 100) state.logs = state.logs.slice(-100);

    if (tx.drawerInfo?.fromQueue) state.queue.shift();

    pendingDrawCommitted = true;
    renderAll();
    saveStore();
  }

  function getModalFlashEl() {
    return drawModal?.querySelector(".modal-flash") || null;
  }

  function runModalFlash(times = 1, gap = 120) {
    const flash = getModalFlashEl();
    if (!flash) return;

    let count = 0;
    const playOnce = () => {
      flash.classList.remove("on");
      void flash.offsetWidth;
      flash.classList.add("on");
      count += 1;

      if (count < times) setTimeout(playOnce, gap);
    };

    playOnce();
  }

  function applyRewardFxLevel(level) {
    const card = drawModal?.querySelector(".modal-card");
    if (!card) return;

    card.classList.remove("fx-ultra", "fx-super", "fx-high", "fx-mid", "fx-low");

    if (level === "ultra") card.classList.add("fx-ultra");
    else if (level === "super") card.classList.add("fx-super");
    else if (level === "high") card.classList.add("fx-high");
    else if (level === "mid") card.classList.add("fx-mid");
    else card.classList.add("fx-low");
  }

  function fillResultPanel(data, options = {}) {
    const { prizeName, tierText, ticketNumber, who, prizeImg, tier, hasLastOne } = data;
    const { withEffects = true } = options;

    if (modalTitle) modalTitle.textContent = "결과 공개";
    if (modalSub) modalSub.textContent = "";

    setResultTierBadge(tierText || "");

    if (modalRevealBig) modalRevealBig.textContent = prizeName || "";

    if (modalRevealSmall) {
      modalRevealSmall.innerHTML = `
        <div class="result-meta-line">종이 ${ticketNumber}</div>
        <div class="result-meta-line result-who">${who || "참여자"}</div>
      `;
    }

    if (modalResultImg) {
      const finalImg = prizeImg || CONFIG.defaultEmptyResultImage;

      modalResultImg.classList.add("is-hidden");
      modalResultImg.removeAttribute("src");

      if (finalImg) {
        const tester = new Image();
        tester.onload = () => {
          modalResultImg.src = finalImg;
          modalResultImg.classList.remove("is-hidden");
        };
        tester.onerror = () => {
          modalResultImg.removeAttribute("src");
          modalResultImg.classList.add("is-hidden");
        };
        tester.src = finalImg;
      }
    }

    if (modalStagePeel) modalStagePeel.style.display = "none";
    if (modalStageResult) modalStageResult.style.display = "block";

    modalResultPanel?.classList.remove(
      "tier-a",
      "tier-b",
      "tier-c",
      "tier-d",
      "tier-e",
      "lastone-result",
      "show-congrats"
    );

    if (hasLastOne) modalResultPanel?.classList.add("lastone-result", "show-congrats");
    else if (tier === 1) modalResultPanel?.classList.add("tier-a", "show-congrats");
    else if (tier === 2) modalResultPanel?.classList.add("tier-b", "show-congrats");
    else if (tier === 3) modalResultPanel?.classList.add("tier-c", "show-congrats");
    else if (tier === 4) modalResultPanel?.classList.add("tier-d", "show-congrats");
    else modalResultPanel?.classList.add("tier-e");

    modalResultPanel?.classList.add("show");

    const card = drawModal?.querySelector(".modal-card");
    if (!card) return;

    card.classList.remove("fx-lastone-boom");

    if (!withEffects) {
      card.classList.remove(
        "fx-gold",
        "fx-purple",
        "fx-blue",
        "fx-green",
        "fx-flash",
        "fx-shake",
        "fx-ripple",
        "fx-ultra",
        "fx-super",
        "fx-high",
        "fx-mid",
        "fx-low"
      );
      return;
    }

    if (hasLastOne) {
      applyTierNeon(1);
      applyTierSpecialFx(1);
      applyRewardFxLevel("ultra");

      card.classList.add("fx-lastone-boom");
      runModalFlash(4, 120);

      burstConfetti(280);
      setTimeout(() => burstConfetti(220), 200);
      setTimeout(() => burstConfetti(180), 400);
      setTimeout(() => burstGlobalConfetti(240), 250);

      playLastOneSound();

      setTimeout(() => {
        card.classList.remove("fx-lastone-boom");
      }, 1400);
      return;
    }

    applyTierNeon(tier);

    if (tier === 1) {
      applyRewardFxLevel("super");
      applyTierSpecialFx(1);
      card.classList.add("fx-lastone-boom");

      runModalFlash(4, 120);
      burstConfetti(280);
      setTimeout(() => burstConfetti(220), 200);
      setTimeout(() => burstConfetti(180), 400);
      setTimeout(() => burstGlobalConfetti(220), 250);

      playFanfare();

      setTimeout(() => {
        card.classList.remove("fx-lastone-boom");
      }, 1400);
    } else if (tier === 2) {
      applyRewardFxLevel("high");
      applyTierSpecialFx(2);
      runModalFlash(2, 180);
      burstConfetti(110);
      setTimeout(() => burstConfetti(55), 240);
      playFanfare();
    } else if (tier === 3) {
      applyRewardFxLevel("mid");
      applyTierSpecialFx(3);
      runModalFlash(1, 120);
      burstConfetti(60);
      playLowTierSound(tierText);
    } else if (tier === 4) {
      applyRewardFxLevel("low");
      runModalFlash(1, 120);
      burstConfetti(28);
      playLowTierSound(tierText);
    } else {
      applyRewardFxLevel("low");
      runModalFlash(1, 120);
      playLowTierSound(tierText);
    }
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

  const nextName = prompt("새 닉네임을 입력해주이소.", targetLog.who || "");
  if (nextName === null) return;

  const trimmed = String(nextName || "").trim();
  if (!trimmed) {
    alert("닉네임은 비워둘 수 없습니다.");
    return;
  }

  pushHistory();
  targetLog.who = trimmed;

  renderAll();
  saveStore();

  fillResultPanel(
    {
      prizeName: targetLog.displayPrizeName || targetLog.prizeName || "",
      tierText: targetLog.displayTierText || targetLog.prizeId || "",
      ticketNumber: targetLog.ticketNumber,
      who: targetLog.who,
      prizeImg: targetLog.prizeImg || "",
      tier: targetLog.tier || 5,
      hasLastOne: !!targetLog.hasLastOne,
    },
    { withEffects: false }
  );

  showWinnerEditButton(true);
}

  function showWinnerEditButton(show) {
  if (!btnEditWinnerName) return;
  btnEditWinnerName.classList.toggle("is-hidden", !show);
}

  function openWinLogResult(log) {
  if (!log) return;

  openModal();

  currentViewingLogTs = log.ts;
  showWinnerEditButton(true);

  fillResultPanel(
    {
      prizeName: log.displayPrizeName || log.prizeName || "",
      tierText: log.displayTierText || log.prizeId || "",
      ticketNumber: log.ticketNumber,
      who: log.who,
      prizeImg: log.prizeImg || "",
      tier: log.tier || 5,
      hasLastOne: !!log.hasLastOne,
    },
    { withEffects: false }
  );

  if (modalTitle) modalTitle.textContent = "당첨 결과 보기";
  if (modalSub) modalSub.textContent = log.isManual ? "관리자 수동 처리 기록" : "";
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

    if (state.settings.lastOnePrize) state.settings.lastOnePrize.claimed = false;

    rebuildAssignments();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStore();

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

  function bindPeelEvents() {
    if (!modalPaper) return;

    const startDrag = (clientX) => {
      if (peelDone) return;
      stopAutoPeel();

      peelDragging = true;
      peelStartX = clientX - peelCurrentX;
      modalPaper.classList.add("dragging");
      playPeelSound();
    };

    const moveDrag = (clientX) => {
      if (!peelDragging || peelDone) return;

      const maxX = modalPaper.offsetWidth;
      const dx = Math.max(0, Math.min(clientX - peelStartX, maxX));
      peelCurrentX = dx;

      modalPaper.style.transform = `translateX(${dx}px)`;

      const threshold = modalPaper.offsetWidth * 0.92;
      if (dx >= threshold) {
        peelDragging = false;
        modalPaper.classList.remove("dragging");
        finishPeelReveal();
      }
    };

    const endDrag = () => {
      if (!peelDragging || peelDone) return;
      peelDragging = false;
      modalPaper.classList.remove("dragging");
    };

    modalPaper.addEventListener("mousedown", (e) => {
      e.preventDefault();
      startDrag(e.clientX);
    });

    document.addEventListener("mousemove", (e) => moveDrag(e.clientX));
    document.addEventListener("mouseup", () => endDrag());

    modalPaper.addEventListener(
      "touchstart",
      (e) => {
        if (!e.touches.length) return;
        startDrag(e.touches[0].clientX);
      },
      { passive: true }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (!e.touches.length) return;
        moveDrag(e.touches[0].clientX);
      },
      { passive: true }
    );

    document.addEventListener("touchend", () => endDrag());
  }

  function resetDrawModalState() {
    stopAutoPeel();
    stopPeelSound();

    if (btnAutoPeel) {
      btnAutoPeel.disabled = false;
      btnAutoPeel.textContent = "자동 오픈 !";
    }

    const card = drawModal?.querySelector(".modal-card");
    if (card) {
      card.classList.remove(
        "peel",
        "reveal-text-on",
        "fx-gold",
        "fx-purple",
        "fx-blue",
        "fx-green",
        "fx-flash",
        "fx-shake",
        "fx-ripple",
        "fx-lastone-boom",
        "fx-ultra",
        "fx-super",
        "fx-high",
        "fx-mid",
        "fx-low"
      );
    }

    if (modalStagePeel) modalStagePeel.style.display = "block";
    if (modalStageResult) modalStageResult.style.display = "none";

    modalResultPanel?.classList.remove(
      "show",
      "tier-a",
      "tier-b",
      "tier-c",
      "tier-d",
      "tier-e",
      "lastone-result",
      "show-congrats"
    );

    if (modalPaper) {
      modalPaper.style.transform = "translateX(0px)";
      modalPaper.classList.remove("dragging");
      modalPaper.style.display = "block";
    }

    if (modalConfetti) modalConfetti.innerHTML = "";
    if (modalResultNumber) modalResultNumber.textContent = "";
    if (modalRevealBig) modalRevealBig.textContent = "";
    if (modalRevealSmall) modalRevealSmall.innerHTML = "";

    if (modalResultImg) {
      modalResultImg.removeAttribute("src");
      modalResultImg.classList.add("is-hidden");
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

    const flash = getModalFlashEl();
    if (flash) flash.classList.remove("on");

    const globalConfetti = document.getElementById("globalConfetti");
    if (globalConfetti) globalConfetti.innerHTML = "";
  }

  function showResultPanel() {
    if (!pendingRevealData) return;
    commitPendingDrawIfNeeded();
    fillResultPanel(pendingRevealData, { withEffects: true });
  }

  function openModal() {
    if (!drawModal) return;
    resetDrawModalState();
    drawModal.classList.add("show");
    drawModal.style.display = "block";
    drawModal.setAttribute("aria-hidden", "false");
  }

  function startAutoPeel() {
    if (!modalPaper || peelDone || autoPeelRunning) return;
    if (modalStagePeel && modalStagePeel.style.display === "none") return;

    autoPeelRunning = true;

    if (btnAutoPeel) {
      btnAutoPeel.disabled = true;
      btnAutoPeel.textContent = "오픈 중...";
    }

    playPeelSound();

    const width = modalPaper.offsetWidth || 540;
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
      modalPaper.style.transform = `translateX(${x}px)`;

      if (progress < 1) {
        autoPeelRaf = requestAnimationFrame(animate);
      } else {
        stopAutoPeel();
        finishPeelReveal();
      }
    };

    autoPeelRaf = requestAnimationFrame(animate);
  }

  function finishPeelReveal() {
    if (peelDone) return;
    peelDone = true;

    stopPeelSound();

    if (modalPaper) {
      modalPaper.style.transform = "translateX(110%)";
      modalPaper.classList.remove("dragging");
    }

    setTimeout(() => {
      if (modalPaper) modalPaper.style.display = "none";
      showResultPanel();
    }, 180);
  }

  function closeModal() {
    if (!drawModal) return;

    stopPeelSound();
    stopAutoPeel();

    resetDrawModalState();
    drawModal.classList.remove("show");
    drawModal.style.display = "none";
    drawModal.setAttribute("aria-hidden", "true");

    resolveCurrentDraw();
  }

  function applyTierNeon(tier) {
    const card = drawModal?.querySelector(".modal-card");
    if (!card) return;

    card.classList.remove("fx-gold", "fx-purple", "fx-blue", "fx-green");
    if (tier === 1) card.classList.add("fx-gold");
    else if (tier === 2) card.classList.add("fx-purple");
    else if (tier === 3) card.classList.add("fx-blue");
    else card.classList.add("fx-green");
  }

  function applyTierSpecialFx(tier) {
    const card = drawModal?.querySelector(".modal-card");
    if (!card) return;

    card.classList.remove("fx-flash", "fx-shake", "fx-ripple");
    if (tier === 1) card.classList.add("fx-flash");
    if (tier === 2) card.classList.add("fx-shake");
    if (tier === 3) card.classList.add("fx-ripple");

    setTimeout(() => {
      card.classList.remove("fx-flash", "fx-shake", "fx-ripple");
    }, 900);
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
    if (modalStagePeel) modalStagePeel.style.display = "block";
    if (modalStageResult) modalStageResult.style.display = "none";

    if (modalTitle) modalTitle.textContent = "번호 공개";
    if (modalSub) modalSub.textContent = "";

    if (modalResultNumber) modalResultNumber.textContent = `${resultNumber}`;
    if (modalRevealBig) modalRevealBig.textContent = "";
    if (modalRevealSmall) modalRevealSmall.innerHTML = "";

    if (modalResultImg) {
      modalResultImg.removeAttribute("src");
      modalResultImg.classList.add("is-hidden");
    }

    if (modalPaperImg) {
      modalPaperImg.src = getCurrentBoard()?.meta?.paperImage || CONFIG.defaultCoverPaperImage;
    }

    if (modalPaper) {
      modalPaper.style.display = "block";
      modalPaper.style.transform = "translateX(0px)";
      modalPaper.classList.remove("dragging");
    }

    modalResultPanel?.classList.remove("show");

    peelDragging = false;
    peelStartX = 0;
    peelCurrentX = 0;
    peelDone = false;

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

  function burstConfetti(count = 44) {
    if (!modalConfetti) return;
    modalConfetti.innerHTML = "";

    const colors = [
      "rgba(255,215,0,.95)",
      "rgba(177,76,255,.95)",
      "rgba(61,168,255,.95)",
      "rgba(255,255,255,.88)",
      "rgba(0,255,136,.92)",
      "rgba(255,120,210,.95)",
    ];

    const width = modalConfetti.clientWidth || 720;
    const height = modalConfetti.clientHeight || 420;

    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";

      const fromTop = Math.random() < 0.7;
      const startX = Math.random() * width;
      const startY = fromTop ? -20 - Math.random() * 80 : Math.random() * (height * 0.25);

      c.style.left = `${startX}px`;
      c.style.top = `${startY}px`;
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.width = `${8 + Math.random() * 8}px`;
      c.style.height = `${10 + Math.random() * 12}px`;
      c.style.borderRadius = `${1 + Math.random() * 4}px`;

      const driftX = (Math.random() - 0.5) * 260;
      const fallY = height + 120 + Math.random() * 140;
      const rotate = 480 + Math.random() * 540;

      c.animate(
        [
          { transform: `translate(0px, 0px) rotate(0deg) scale(1)`, opacity: 1 },
          { transform: `translate(${driftX}px, ${fallY}px) rotate(${rotate}deg) scale(.92)`, opacity: 0 },
        ],
        {
          duration: 900 + Math.random() * 900,
          easing: "cubic-bezier(.18,.7,.2,1)",
          fill: "forwards",
        }
      );

      modalConfetti.appendChild(c);
    }

    setTimeout(() => {
      if (modalConfetti) modalConfetti.innerHTML = "";
    }, 2400);
  }

  function burstGlobalConfetti(amount = 160) {
    const container = document.getElementById("globalConfetti");
    if (!container) return;

    container.innerHTML = "";

    const colors = ["#ffd700", "#ff7edb", "#7ecbff", "#ffffff", "#7effc1", "#ff9c6a"];

    for (let i = 0; i < amount; i++) {
      const c = document.createElement("div");
      c.className = "global-confetti";

      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDuration = `${4 + Math.random() * 4}s`;
      c.style.animationDelay = `${Math.random() * 1.5}s`;
      c.style.transform = `rotate(${Math.random() * 360}deg)`;

      container.appendChild(c);
    }

    setTimeout(() => {
      container.innerHTML = "";
    }, 9000);
  }

  function resolveDrawerName() {
    const manualName = (drawNicknameInput?.value || "").trim();
    if (manualName) return { who: manualName, fromQueue: false };

    const queueName = (state.queue?.[0]?.name || "").trim();
    if (queueName) return { who: queueName, fromQueue: true };

    return { who: "참여자", fromQueue: false };
  }

  async function startDraw(ticketNumber) {
    const beforeSnap = JSON.stringify(exportState());

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

        const openedBefore = Object.keys(state.used).length;
        const isLastDraw = openedBefore + 1 === state.settings.totalTickets;

        const lastOnePrize =
          isLastDraw &&
          state.settings.lastOnePrize &&
          !state.settings.lastOnePrize.claimed
            ? state.settings.lastOnePrize
            : null;

        const drawerInfo = resolveDrawerName();
        const who = drawerInfo.who;

        const displayPrizeName = lastOnePrize ? `${prize.name} + ${lastOnePrize.name}` : `${prize.name}`;
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
          ts: Date.now(),
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

        if (modalTitle) modalTitle.textContent = lastOnePrize ? "라스트원 포함 결과 공개" : "결과 공개";
        if (modalSub) modalSub.textContent = `결과 번호 ${resultNumber}`;

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
          importState(JSON.parse(beforeSnap));
          buildBoard(state.settings.totalTickets);
          renderAll();
          saveStore();
        } catch (rollbackError) {
          console.error("[KUJI] rollback error:", rollbackError);
        }

        pendingDrawCommit = null;
        pendingDrawCommitted = false;

        if (drawModal?.classList.contains("show")) closeModal();
        else resolveCurrentDraw();

        alert("오류가 발생했습니다. 콘솔을 확인하세요.");
      }
    });
  }

  function rebuildAssignmentsIfNeeded() {
    const total = state.settings.totalTickets;
    const hasTicketMap = state.ticketResults && Object.keys(state.ticketResults).length === total;

    const prizeHasNumbers = state.prizes
      .filter((p) => p.id !== "OJI")
      .every((p) => Array.isArray(p.numbers) && p.numbers.length === p.total);

    if (!hasTicketMap || !prizeHasNumbers) {
      rebuildAssignments();
      saveStore();
    }
  }

  btnToggleMode?.addEventListener("click", () => {
    setMode(state.mode === "broadcast" ? "admin" : "broadcast");
  });

  btnCloseAdmin?.addEventListener("click", () => setMode("broadcast"));

  btnSave?.addEventListener("click", () => {
    saveStore();
    alert("저장되었습니다.");
  });

  btnLoad?.addEventListener("click", () => {
    loadStore();
    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();
    alert("불러오기 완료");
  });

  btnUndo?.addEventListener("click", () => {
    const snap = state.history.pop();
    if (!snap) {
      alert("되돌릴 내용이 없습니다.");
      return;
    }
    importState(JSON.parse(snap));
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStore();
  });

  btnReset?.addEventListener("click", () => {
    if (!confirm("현재 쿠지판 데이터를 전체 초기화할까요?")) return;

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
    saveStore();
  });

  btnApplyBasicSettings?.addEventListener("click", () => {
    const title = (kujiTitleInput?.value || "").trim();
    const price = (priceInput?.value || "").trim();
    const total = Number(totalTicketsInput?.value);

    if (!title) {
      alert("쿠지판 이름을 입력하세요.");
      return;
    }

    if (!price) {
      alert("1회 가격을 입력하세요.");
      return;
    }

    if (!Number.isFinite(total) || total < 1 || total > 500) {
      alert("전체 뽑기 수는 1~500 사이로 입력하세요.");
      return;
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
    saveStore();
    alert("기본 설정이 적용되었습니다.");
  });

  btnAddPrize?.addEventListener("click", () => {
    const name = (prizeNameInput?.value || "").trim();
    const label = prizeTierSelect?.value || "A상";
    const stock = Number(prizeStockInput?.value || 0);
    const imgUrl = (prizeImgUrlInput?.value || "").trim();

    if (!name) {
      alert("상품 이름을 입력하세요.");
      return;
    }

    if (!Number.isFinite(stock) || stock < 1) {
      alert("수량은 1 이상이어야 합니다.");
      return;
    }

    if (!imgUrl) {
      alert("이미지 URL을 입력하세요.");
      return;
    }

    const nonOjiTotal = state.prizes
      .filter((p) => p.id !== "OJI")
      .reduce((sum, p) => sum + p.total, 0);

    if (nonOjiTotal + stock > state.settings.totalTickets) {
      alert("상품 수량 합계가 전체 뽑기 수를 넘습니다.");
      return;
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
    saveStore();

    if (prizeNameInput) prizeNameInput.value = "";
    if (prizeStockInput) prizeStockInput.value = "1";
    if (prizeImgUrlInput) prizeImgUrlInput.value = "";

    alert("상품이 추가되었습니다. 숫자가 자동 배정되었습니다.");
  });

  btnApplyLastOne?.addEventListener("click", () => {
    const name = (lastOneNameInput?.value || "").trim();
    const desc = (lastOneDescInput?.value || "").trim() || "마지막 뽑기 오픈 시 보너스로 지급";
    const imgUrl = (lastOneImgUrlInput?.value || "").trim();

    if (!name) {
      alert("라스트원 상품 이름을 입력하세요.");
      return;
    }

    if (!imgUrl) {
      alert("라스트원 이미지 URL을 입력하세요.");
      return;
    }

    pushHistory();

    state.settings.lastOnePrize = {
      label: "LAST ONE",
      name,
      desc,
      img: imgUrl,
      claimed: false,
    };

    renderAll();
    saveStore();

    if (lastOneNameInput) lastOneNameInput.value = "";
    if (lastOneDescInput) lastOneDescInput.value = "";
    if (lastOneImgUrlInput) lastOneImgUrlInput.value = "";

    alert("라스트원 상품이 적용되었습니다.");
  });

  btnClearLastOne?.addEventListener("click", () => {
    if (!state.settings.lastOnePrize) {
      alert("등록된 라스트원 상품이 없습니다.");
      return;
    }
    if (!confirm("라스트원 상품을 삭제할까요?")) return;

    pushHistory();
    state.settings.lastOnePrize = null;
    if (lastOneNameInput) lastOneNameInput.value = "";
    if (lastOneDescInput) lastOneDescInput.value = "";
    if (lastOneImgUrlInput) lastOneImgUrlInput.value = "";
    renderAll();
    saveStore();
  });

  btnCreateBoard?.addEventListener("click", () => {
    const name = (newBoardNameInput?.value || "").trim();
    const bgUrl = (boardBgUrlInput?.value || "").trim();
    const paperUrl = (boardPaperUrlInput?.value || "").trim();

    if (!name) {
      alert("새 쿠지판 이름을 입력하세요.");
      return;
    }

    const newBoard = createDefaultBoard(name);

    if (bgUrl) newBoard.meta.bgImage = bgUrl;
    if (paperUrl) newBoard.meta.paperImage = paperUrl;

    store.boards[newBoard.meta.id] = newBoard;
    store.currentBoardId = newBoard.meta.id;

    importState(newBoard.state);
    rebuildAssignments();
    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStore();

    if (newBoardNameInput) newBoardNameInput.value = "";
    if (boardBgUrlInput) boardBgUrlInput.value = "";
    if (boardPaperUrlInput) boardPaperUrlInput.value = "";

    alert("새 쿠지판이 생성되었습니다.");
  });

  btnApplyBoard?.addEventListener("click", () => {
    const selectedId = boardSelect?.value;
    if (!selectedId || !store.boards[selectedId]) {
      alert("적용할 쿠지판을 선택하세요.");
      return;
    }

    const target = store.boards[selectedId];
    const bgUrl = (boardBgUrlInput?.value || "").trim();
    const paperUrl = (boardPaperUrlInput?.value || "").trim();

    if (bgUrl) target.meta.bgImage = bgUrl;
    if (paperUrl) target.meta.paperImage = paperUrl;

    store.currentBoardId = selectedId;
    importState(target.state);
    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStore();

    if (boardBgUrlInput) boardBgUrlInput.value = "";
    if (boardPaperUrlInput) boardPaperUrlInput.value = "";

    alert("쿠지판이 적용되었습니다.");
  });

  btnDeleteBoard?.addEventListener("click", () => {
    const selectedId = boardSelect?.value;
    if (!selectedId || !store.boards[selectedId]) {
      alert("삭제할 쿠지판을 선택하세요.");
      return;
    }

    if (Object.keys(store.boards).length <= 1) {
      alert("쿠지판은 최소 1개는 있어야 합니다.");
      return;
    }

    if (!confirm("선택한 쿠지판을 삭제할까요?")) return;

    delete store.boards[selectedId];

    if (store.currentBoardId === selectedId) {
      store.currentBoardId = Object.keys(store.boards)[0];
      importState(store.boards[store.currentBoardId].state);
    }

    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStore();
  });

  btnAddQueue?.addEventListener("click", addQueue);
  queueInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addQueue();
  });

  btnSavePrizeEdit?.addEventListener("click", savePrizeEdit);
  btnCancelPrizeEdit?.addEventListener("click", closePrizeEditSection);

  btnRandomPick?.addEventListener("click", randomSelectCards);
  btnResetSelection?.addEventListener("click", () => {
    state.selectedNumbers = [];
    if (drawNicknameInput) drawNicknameInput.value = "";
    if (randomCountInput) randomCountInput.value = "";
    renderBoardState();
    renderControlState();
    saveStore();
  });

  btnOpenSelected?.addEventListener("click", openSelectedCards);

  modalBackdrop?.addEventListener("click", closeModal);
  modalClose?.addEventListener("click", closeModal);

  previewClose?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    closePreviewModal();
  });

  previewBackdrop?.addEventListener("click", closePreviewModal);

  previewModal?.addEventListener("click", (e) => {
    if (e.target === previewModal) closePreviewModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "`" || e.key === "~") {
      e.preventDefault();
      setMode(state.mode === "broadcast" ? "admin" : "broadcast");
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (previewModal?.classList.contains("show")) {
        closePreviewModal();
        return;
      }
      if (drawModal?.classList.contains("show")) closeModal();
    }
  });

  btnToggleSound?.addEventListener("click", () => {
    state.settings.soundMuted = !state.settings.soundMuted;
    applySoundSettings();
    saveStore();
  });

  soundVolumeRange?.addEventListener("input", () => {
    const nextVolume = Number(soundVolumeRange.value) / 100;
    state.settings.soundVolume = Math.max(0, Math.min(1, nextVolume));

    if (state.settings.soundVolume > 0 && state.settings.soundMuted) {
      state.settings.soundMuted = false;
    }

    applySoundSettings();
    saveStore();
  });

  btnAutoPeel?.addEventListener("click", startAutoPeel);

  loadStore();
  rebuildAssignmentsIfNeeded();
  rebuildBoardSelect();
  applyBoardVisual();
  injectExtraUi();
  injectBoardResetButton();
  setMode(state.mode || "broadcast");
  buildBoard(state.settings.totalTickets);
  renderAll();
  bindPeelEvents();

  window.__KUJI__ = {
    state,
    store,
    rebuildAssignments,
    startDraw,
    manualAwardPrize,
  };
})();
(() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const CONFIG = {
    defaultTotalTickets: 30,
    flashyTierMax: 3,
    defaultPaperImage: "./assets/paper.png",
    defaultCoverPaperImage: "./assets/paper.png",
    defaultEmptyResultImage: "./assets/empty.png",
    defaultBgImage: "./assets/bg.png",
    defaultBoardLogo: "./assets/logo_board.png",
    defaultTopLogo: "./assets/logo_top.png",
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
      img: "./assets/oji_goods.png",
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
    lastSavedAt: null,
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

  // 기본 쿠지판
  base.meta.bgImage = "./assets/bg.png";
  base.meta.paperImage = "./assets/paper.png";

  // 나히아 쿠지판
  mha.meta.bgImage = "./assets/bg_mha.png";
  mha.meta.paperImage = "./assets/paper_mha.png";

  // 귀멸 쿠지판
  kimetsu.meta.bgImage = "./assets/bg_kimetsu.png";
  kimetsu.meta.paperImage = "./assets/paper_kimetsu.png";

  // 원피스 쿠지판
  onepiece.meta.bgImage = "./assets/bg_onepiece.png";
  onepiece.meta.paperImage = "./assets/paper_onepiece.png";

  // 진격 쿠지판
  aot.meta.bgImage = "./assets/bg_aot.png";
  aot.meta.paperImage = "./assets/paper_aot.png";

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
  };

  // =========================
  // Elements
  // =========================
  const appRoot = $("#appRoot");
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
  const btnApplyTickets = $("#btnApplyTickets");

  const kujiTitleText = $("#kujiTitleText");
  const kujiTitleInput = $("#kujiTitleInput");
  const btnApplyTitle = $("#btnApplyTitle");

  const queueInput = $("#queueInput");
  const btnAddQueue = $("#btnAddQueue");
  const queueList = $("#queueList");

  const fanfare = $("#fanfare");

  const prizeNameInput = $("#prizeNameInput");
  const prizeTierSelect = $("#prizeTierSelect");
  const prizeStockInput = $("#prizeStockInput");
  const prizeImgInput = $("#prizeImgInput");
  const btnAddPrize = $("#btnAddPrize");
  const adminPrizeList = $("#adminPrizeList");

  const lastOneNameInput = $("#lastOneNameInput");
  const lastOneDescInput = $("#lastOneDescInput");
  const lastOneImgInput = $("#lastOneImgInput");
  const btnApplyLastOne = $("#btnApplyLastOne");
  const btnClearLastOne = $("#btnClearLastOne");

  const boardSelect = $("#boardSelect");
  const newBoardNameInput = $("#newBoardNameInput");
  const boardBgInput = $("#boardBgInput");
  const boardPaperInput = $("#boardPaperInput");
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
  const boardLogo = $("#boardLogo");
  const topLogo = $("#topLogo");

  const drawModal = $("#drawModal");
  const modalBackdrop = $("#modalBackdrop");
  const modalClose = $("#modalClose");
  const modalOk = $("#modalOk");
  const modalTitle = $("#modalTitle");
  const modalSub = $("#modalSub");
  const modalResultNumber = $("#modalResultNumber");
  const modalResultImg = $("#modalResultImg");
  const modalPaper = $("#modalPaper");
  const modalPaperImg = $("#modalPaperImg");
  const modalReveal = $("#modalReveal");
  const modalRevealBig = $("#modalRevealBig");
  const modalRevealSmall = $("#modalRevealSmall");
  const modalLoading = $("#modalLoading");
  const modalConfetti = $("#modalConfetti");

  if (modalResultImg) {
    modalResultImg.onerror = () => {
      modalResultImg.src = CONFIG.defaultEmptyResultImage;
    };
  }

  // =========================
  // Utils
  // =========================
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

  function dataURLFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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
  if (current) {
    state.settings.lastSavedAt = new Date().toISOString();
    current.state = exportState();
  }

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

  function pushHistory() {
    try {
      state.history.push(JSON.stringify(exportState()));
      if (state.history.length > 50) state.history.shift();
    } catch {}
  }

  function applyBoardVisual() {
    const current = getCurrentBoard();
    if (!current) return;

    document.body.style.backgroundImage = `url("${current.meta.bgImage || CONFIG.defaultBgImage}")`;
    if (modalPaperImg) modalPaperImg.src = current.meta.paperImage || CONFIG.defaultCoverPaperImage;
    if (boardLogo) boardLogo.src = CONFIG.defaultBoardLogo;
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
    if (state.settings.lastOnePrize) {
      state.settings.lastOnePrize.claimed = false;
    }
  }

  function findPrizeByResultNumber(resultNumber) {
    for (const p of state.prizes) {
      if (p.id === "OJI") continue;
      if (Array.isArray(p.numbers) && p.numbers.includes(resultNumber)) {
        return p;
      }
    }
    return state.prizes.find((p) => p.id === "OJI") || createDefaultOjiPrize();
  }

  function pruneToTotal(total) {
    const nextUsed = {};
    for (const k of Object.keys(state.used)) {
      const num = Number(k);
      if (Number.isFinite(num) && num >= 1 && num <= total) {
        nextUsed[String(num)] = true;
      }
    }
    state.used = nextUsed;
    state.selectedNumbers = state.selectedNumbers.filter((n) => n >= 1 && n <= total && !state.used[String(n)]);
    state.logs = state.logs.filter((l) => l.ticketNumber >= 1 && l.ticketNumber <= total);
  }

  function setMode(mode) {
    state.mode = mode;
    document.body.setAttribute("data-mode", mode);

    if (btnToggleMode) {
      btnToggleMode.textContent = mode === "broadcast" ? "방송 모드" : "관리자 모드";
    }

    if (adminPanel) {
      adminPanel.classList.toggle("show", mode === "admin");
    }

    saveStore();
  }

  // =========================
  // Mode events
  // =========================
  btnToggleMode?.addEventListener("click", () => {
    setMode(state.mode === "broadcast" ? "admin" : "broadcast");
  });
  btnCloseAdmin?.addEventListener("click", () => setMode("broadcast"));

  window.addEventListener("keydown", (e) => {
    if (e.key === "`" || e.key === "~") {
      e.preventDefault();
      setMode(state.mode === "broadcast" ? "admin" : "broadcast");
    }
  });

  // =========================
  // Admin buttons
  // =========================
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
    rebuildAssignments();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStore();
  });

  btnApplyTitle?.addEventListener("click", () => {
    const t = (kujiTitleInput?.value || "").trim();
    if (!t) {
      alert("쿠지판 이름을 입력하세요.");
      return;
    }
    pushHistory();
    state.settings.kujiTitle = t;
    renderAll();
    saveStore();
  });

  btnApplyTickets?.addEventListener("click", () => {
    const n = Number(totalTicketsInput?.value);
    if (!Number.isFinite(n) || n < 1 || n > 500) {
      alert("전체 뽑기 수는 1~500 사이로 입력하세요.");
      return;
    }

    pushHistory();
    state.settings.totalTickets = Math.floor(n);
    rebuildAssignments();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStore();
    alert("전체 뽑기 수가 적용되었습니다. 숫자 배정이 새로 섞였습니다.");
  });

  btnAddPrize?.addEventListener("click", async () => {
    const name = (prizeNameInput?.value || "").trim();
    const label = prizeTierSelect?.value || "A상";
    const stock = Number(prizeStockInput?.value || 0);
    const file = prizeImgInput?.files?.[0];

    if (!name) {
      alert("상품 이름을 입력하세요.");
      return;
    }
    if (!Number.isFinite(stock) || stock < 1) {
      alert("수량은 1 이상이어야 합니다.");
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

    const imgSrc = (await dataURLFromFile(file)) || CONFIG.defaultEmptyResultImage;

    state.prizes.push({
      id: "P" + Date.now() + Math.random().toString(16).slice(2, 6),
      tier: tierLabelToTierValue(label),
      label,
      name,
      stock,
      total: stock,
      img: imgSrc,
      numbers: [],
    });

    state.prizes.sort((a, b) => a.tier - b.tier);
    rebuildAssignments();
    renderAll();
    saveStore();

    if (prizeNameInput) prizeNameInput.value = "";
    if (prizeStockInput) prizeStockInput.value = "1";
    if (prizeImgInput) prizeImgInput.value = "";

    alert("상품이 추가되었습니다. 숫자가 자동 배정되었습니다.");
  });

  btnApplyLastOne?.addEventListener("click", async () => {
    const name = (lastOneNameInput?.value || "").trim();
    const desc = (lastOneDescInput?.value || "").trim() || "마지막 뽑기 오픈 시 보너스로 지급";
    const file = lastOneImgInput?.files?.[0];

    if (!name) {
      alert("라스트원 상품 이름을 입력하세요.");
      return;
    }

    pushHistory();

    const imgSrc = (await dataURLFromFile(file)) || state.settings.lastOnePrize?.img || CONFIG.defaultEmptyResultImage;

    state.settings.lastOnePrize = {
      label: "LAST ONE",
      name,
      desc,
      img: imgSrc,
      claimed: false,
    };

    renderAll();
    saveStore();
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
    if (lastOneImgInput) lastOneImgInput.value = "";
    renderAll();
    saveStore();
  });

  // =========================
  // Board switching
  // =========================
  btnCreateBoard?.addEventListener("click", async () => {
    const name = (newBoardNameInput?.value || "").trim();
    if (!name) {
      alert("새 쿠지판 이름을 입력하세요.");
      return;
    }

    const newBoard = createDefaultBoard(name);
    const bgSrc = await dataURLFromFile(boardBgInput?.files?.[0]);
    const paperSrc = await dataURLFromFile(boardPaperInput?.files?.[0]);

    if (bgSrc) newBoard.meta.bgImage = bgSrc;
    if (paperSrc) newBoard.meta.paperImage = paperSrc;

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
    if (boardBgInput) boardBgInput.value = "";
    if (boardPaperInput) boardPaperInput.value = "";

    alert("새 쿠지판이 생성되었습니다.");
  });

  btnApplyBoard?.addEventListener("click", async () => {
    const selectedId = boardSelect?.value;
    if (!selectedId || !store.boards[selectedId]) {
      alert("적용할 쿠지판을 선택하세요.");
      return;
    }

    const target = store.boards[selectedId];
    const bgSrc = await dataURLFromFile(boardBgInput?.files?.[0]);
    const paperSrc = await dataURLFromFile(boardPaperInput?.files?.[0]);

    if (bgSrc) target.meta.bgImage = bgSrc;
    if (paperSrc) target.meta.paperImage = paperSrc;

    store.currentBoardId = selectedId;
    importState(target.state);
    rebuildBoardSelect();
    applyBoardVisual();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveStore();

    if (boardBgInput) boardBgInput.value = "";
    if (boardPaperInput) boardPaperInput.value = "";

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

  // =========================
  // Queue
  // =========================
  btnAddQueue?.addEventListener("click", addQueue);
  queueInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addQueue();
  });

  function addQueue() {
    const name = (queueInput?.value || "").trim();
    if (!name) return;

    state.queue.push({ id: uid(), name });
    if (queueInput) queueInput.value = "";
    renderQueue();
    saveStore();
  }

  function shiftQueue() {
    if (state.queue.length > 0) {
      state.queue.shift();
    }
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

  // =========================
  // Selection / control
  // =========================
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

  function renderControlState() {
    if (btnOpenSelected) {
      btnOpenSelected.textContent = `오픈 (${state.selectedNumbers.length})`;
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
      await startDraw(nums[i], { isBatch: nums.length > 1, index: i, total: nums.length });
      if (i < nums.length - 1) {
        await sleep(250);
      }
    }

    state.selectedNumbers = [];
    renderBoardState();
    renderControlState();
    saveStore();
  }

  // =========================
  // Board
  // =========================
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
        if (idx >= 0) {
          state.selectedNumbers.splice(idx, 1);
        } else {
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

  // =========================
  // Prize list / admin list
  // =========================
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
      card.className = "prizecard lastone-prize";
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

      prizeList.appendChild(card);
    }

    state.prizes
      .slice()
      .sort((a, b) => a.tier - b.tier)
      .forEach((p) => {
        const card = document.createElement("div");
        card.className = "prizecard";

        if (p.id !== "OJI") {
          if (p.tier === 1) card.classList.add("tier-a");
          if (p.tier === 2) card.classList.add("tier-b");
          if (p.tier === 3) card.classList.add("tier-c");
          if (p.tier === 4) card.classList.add("tier-d");
          if (p.tier === 5) card.classList.add("tier-e");
        }

        if (p.stock === 1 && p.id !== "OJI") {
          card.classList.add("lastone");
        }

        if (p.stock === 0 && p.id !== "OJI") {
          card.classList.add("soldout");
        }

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

        prizeList.appendChild(card);
      });
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
      if (p.id === "OJI") {
        sub.textContent = `기본 꽝 상품`;
      } else {
        sub.textContent = `남은 ${p.stock}/${p.total} · 번호 ${p.numbers.join(", ")}`;
      }

      meta.appendChild(title);
      meta.appendChild(sub);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "admin-prize-delete";

      if (p.id === "OJI") {
        del.textContent = "기본";
        del.disabled = true;
        del.style.opacity = ".5";
        del.style.cursor = "default";
      } else {
        del.textContent = "삭제";
        del.addEventListener("click", () => {
          if (!confirm(`${p.label} ${p.name} 상품을 삭제할까요?`)) return;
          pushHistory();
          state.prizes = state.prizes.filter((item) => item.id !== p.id);
          rebuildAssignments();
          renderAll();
          saveStore();
        });
      }

      item.appendChild(thumb);
      item.appendChild(meta);
      item.appendChild(del);
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
      meta.textContent = `종이 ${item.ticketNumber} · 닉네임: ${item.who}`;

      const time = document.createElement("div");
      time.className = "wintime";
      time.textContent = item.time;

      main.appendChild(name);
      main.appendChild(meta);

      row.appendChild(tier);
      row.appendChild(main);
      row.appendChild(time);

      winList.appendChild(row);
    });
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

    if (kujiTitleText) kujiTitleText.textContent = state.settings.kujiTitle;
    if (kujiTitleInput) kujiTitleInput.value = state.settings.kujiTitle;
    if (totalTicketsInput) totalTicketsInput.value = String(state.settings.totalTickets);

    if (priceText) priceText.textContent = state.settings.priceText;
    if (accountText) accountText.textContent = state.settings.accountText;

    if (lastOneNameInput) lastOneNameInput.value = state.settings.lastOnePrize?.name || "";
    if (lastOneDescInput) lastOneDescInput.value = state.settings.lastOnePrize?.desc || "";
  }

  // =========================
  // Modal
  // =========================
  function openModal() {
    if (!drawModal) return;
    drawModal.classList.add("show");
    drawModal.style.display = "block";
    drawModal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    if (!drawModal) return;

    drawModal.classList.remove("show");
    drawModal.style.display = "none";
    drawModal.setAttribute("aria-hidden", "true");

    const card = drawModal.querySelector(".modal-card");
    card?.classList.remove(
      "peel",
      "reveal-text-on",
      "fx-gold",
      "fx-purple",
      "fx-blue",
      "fx-green",
      "fx-flash",
      "fx-shake",
      "fx-ripple"
    );

    modalLoading?.classList.remove("active");
    modalReveal?.classList.remove("active");
    modalPaper?.classList.remove("active");
    if (modalConfetti) modalConfetti.innerHTML = "";
  }

  modalBackdrop?.addEventListener("click", closeModal);
  modalClose?.addEventListener("click", closeModal);
  modalOk?.addEventListener("click", closeModal);

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

  function runModalPeelReveal({ resultNumber, prizeName, ticketNumber, who, prizeImg }) {
    const card = drawModal?.querySelector(".modal-card");
    if (!card) return;

    modalPaper?.classList.remove("active");
    modalReveal?.classList.remove("active");
    card.classList.remove("peel", "reveal-text-on");

    if (modalResultNumber) modalResultNumber.textContent = `No. ${resultNumber}`;
    if (modalRevealBig) modalRevealBig.textContent = prizeName;
    if (modalRevealSmall) modalRevealSmall.textContent = `종이 ${ticketNumber} · 닉네임: ${who}`;

    if (modalResultImg) modalResultImg.src = prizeImg || CONFIG.defaultEmptyResultImage;
    if (modalPaperImg) modalPaperImg.src = getCurrentBoard()?.meta?.paperImage || CONFIG.defaultCoverPaperImage;

    void card.offsetWidth;

    modalPaper?.classList.add("active");
    modalReveal?.classList.add("active");
    card.classList.add("reveal-text-on");
    card.classList.add("peel");

    setTimeout(() => {
      modalPaper?.classList.remove("active");
      card.classList.remove("peel");
    }, 950);
  }

  function playFanfare() {
    if (!CONFIG.useFanfare || !fanfare) return;
    try {
      fanfare.currentTime = 0;
      fanfare.play().catch(() => {});
    } catch {}
  }

  function burstConfetti(count = 44) {
    if (!modalConfetti) return;
    modalConfetti.innerHTML = "";

    const colors = [
      "rgba(255,215,0,.95)",
      "rgba(177,76,255,.95)",
      "rgba(61,168,255,.95)",
      "rgba(255,255,255,.85)",
      "rgba(0,255,136,.90)",
    ];

    for (let i = 0; i < count; i++) {
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = `${Math.random() * 100}%`;
      c.style.background = colors[Math.floor(Math.random() * colors.length)];
      c.style.animationDuration = `${650 + Math.random() * 450}ms`;
      modalConfetti.appendChild(c);
    }

    setTimeout(() => {
      if (modalConfetti) modalConfetti.innerHTML = "";
    }, 1500);
  }

  function resolveDrawerName() {
    const manualName = (drawNicknameInput?.value || "").trim();
    if (manualName) return { who: manualName, fromQueue: false };

    const queueName = (state.queue?.[0]?.name || "").trim();
    if (queueName) return { who: queueName, fromQueue: true };

    return { who: "참여자", fromQueue: false };
  }

  async function startDraw(ticketNumber, options = {}) {
    try {
      const nKey = String(ticketNumber);
      if (state.used[nKey]) return;

      openModal();

      if (modalTitle) {
        modalTitle.textContent = options.isBatch
          ? `추첨 중 (${options.index + 1}/${options.total})`
          : "추첨 중";
      }
      if (modalSub) modalSub.textContent = "잠시만 기다려 주세요.";
      modalLoading?.classList.add("active");

      await sleep(CONFIG.drawDelayMs);

      const resultNumber = Number(state.ticketResults[nKey]);
      if (!Number.isFinite(resultNumber)) {
        modalLoading?.classList.remove("active");
        if (modalTitle) modalTitle.textContent = "오류";
        if (modalSub) modalSub.textContent = "결과 번호가 없습니다.";
        return;
      }

      const prize = findPrizeByResultNumber(resultNumber);
      pushHistory();

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

      if (lastOnePrize) {
        lastOnePrize.claimed = true;
      }

      state.used[nKey] = true;
      state.selectedNumbers = state.selectedNumbers.filter((x) => x !== ticketNumber);

      const drawerInfo = resolveDrawerName();
      const who = drawerInfo.who;

      const rewardText = lastOnePrize
        ? `${prize.name} + LAST ONE ${lastOnePrize.name}`
        : `${prize.name}`;

      const log = {
        ticketNumber,
        resultNumber,
        who,
        prizeId: lastOnePrize ? `${prize.label} + LAST ONE` : prize.label,
        prizeName: rewardText,
        tier: prize.tier,
        time: new Date().toLocaleTimeString("ko-KR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        ts: Date.now(),
      };

      state.logs.push(log);

      modalLoading?.classList.remove("active");
      if (modalTitle) modalTitle.textContent = lastOnePrize ? "라스트원 포함 결과 공개" : "결과 공개";
      if (modalSub) modalSub.textContent = `결과 번호 ${resultNumber}`;

      applyTierNeon(prize.tier);
      runModalPeelReveal({
        resultNumber,
        prizeName: rewardText,
        ticketNumber,
        who,
        prizeImg: prize.img || CONFIG.defaultEmptyResultImage,
      });

      const isFlashy = prize.id !== "OJI" && prize.tier <= CONFIG.flashyTierMax;
      if (isFlashy || lastOnePrize) {
        applyTierSpecialFx(prize.tier);
        burstConfetti(lastOnePrize ? 70 : 52);
        playFanfare();
      }

      if (drawerInfo.fromQueue) {
        shiftQueue();
      }

      renderAll();
      saveStore();
    } catch (e) {
      console.error("[KUJI] startDraw error:", e);
      alert("오류가 발생했습니다. 콘솔을 확인하세요.");
    }
  }

  const saveStatus = $("#saveStatus");

function updateSaveStatus() {
  if (!saveStatus) return;

  const savedAt = state.settings.lastSavedAt;
  if (!savedAt) {
    saveStatus.textContent = "저장 기록 없음";
    return;
  }

  const d = new Date(savedAt);
  saveStatus.textContent =
    `자동 저장됨 · ${d.toLocaleString("ko-KR")}`;
}

  // =========================
  // Init
  // =========================
  loadStore();
  rebuildAssignmentsIfNeeded();
  rebuildBoardSelect();
  applyBoardVisual();
  setMode(state.mode || "broadcast");
  buildBoard(state.settings.totalTickets);
  renderAll();
  updateSaveStatus();

  window.addEventListener("beforeunload", () => {
  saveStore();
});

  window.__KUJI__ = { state, store, rebuildAssignments, startDraw };

  function rebuildAssignmentsIfNeeded() {
  const total = state.settings.totalTickets;

  const hasTicketMap =
    state.ticketResults &&
    Object.keys(state.ticketResults).length === total;

  const prizeHasNumbers = state.prizes
    .filter((p) => p.id !== "OJI")
    .every((p) => Array.isArray(p.numbers) && p.numbers.length === p.total);

  if (!hasTicketMap || !prizeHasNumbers) {
    console.warn("[KUJI] 저장 데이터가 불완전해서 번호를 새로 배정합니다.");
    rebuildAssignments();
    saveStore();
  }
}
})();

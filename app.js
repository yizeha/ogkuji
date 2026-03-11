(() => {
  const $ = (sel, el = document) => el.querySelector(sel);

  // =========================
  // CONFIG
  // =========================
  const CONFIG = {
    defaultTotalTickets: 30,
    flashyTierMax: 3,
    paperImage: "./assets/paper.png",
    coverPaperImage: "./assets/paper.png",
    emptyResultImage: "./assets/empty.png",
    useFanfare: true,
    LS_KEY: "kuji_broadcast_modal_v2",
    drawDelayMs: 1100,
  };

  // =========================
  // DEFAULTS
  // =========================
  function createDefaultOjiPrize() {
    return {
      id: "OJI",
      tier: 99,
      label: "오지상",
      name: "(굿즈 or 마일리지)",
      stock: 99999,
      total: 99999,
      img: "./assets/oji_goods.png",
    };
  }

  function createDefaultSettings() {
    return {
      totalTickets: CONFIG.defaultTotalTickets,
      kujiTitle: "오지상 쿠지",
      lastOnePrize: null,
    };
  }

  // =========================
  // STATE
  // =========================
  const state = {
    mode: "broadcast",
    used: {},
    selected: null,
    logs: [],
    history: [],
    queue: [],
    drawDeck: [],
    settings: createDefaultSettings(),
    prizes: [createDefaultOjiPrize()],
  };

  // =========================
  // localStorage
  // =========================
  let saveTimer = null;

  function exportState() {
    return {
      mode: state.mode,
      used: state.used,
      selected: state.selected,
      logs: state.logs,
      queue: state.queue,
      settings: state.settings,
      prizes: state.prizes,
    };
  }

  function normalizePrize(p) {
    return {
      id: p.id,
      tier: Number.isFinite(Number(p.tier)) ? Number(p.tier) : 999,
      label: String(p.label || "").trim() || "기타",
      name: String(p.name || "").trim() || "상품",
      stock: Math.max(0, Number(p.stock) || 0),
      total: typeof p.total === "number" ? p.total : Math.max(0, Number(p.stock) || 0),
      img: p.img || CONFIG.emptyResultImage,
    };
  }

  function normalizeLastOnePrize(p) {
    if (!p) return null;

    return {
      label: String(p.label || "").trim() || "LAST ONE",
      name: String(p.name || "").trim() || "라스트원 상품",
      desc: String(p.desc || "").trim() || "마지막 타일 오픈 시 보너스로 지급",
      img: p.img || CONFIG.emptyResultImage,
      claimed: !!p.claimed,
    };
  }

  function importState(payload) {
    state.mode = payload?.mode || "broadcast";
    state.used = payload?.used || {};
    state.selected = payload?.selected ?? null;
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
  }

  function saveLocal() {
    try {
      localStorage.setItem(CONFIG.LS_KEY, JSON.stringify(exportState()));
    } catch {}
  }

  function saveLocalDebounced() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveLocal, 200);
  }

  function loadLocal() {
    const raw = localStorage.getItem(CONFIG.LS_KEY);
    if (!raw) return false;

    try {
      importState(JSON.parse(raw));
      return true;
    } catch {
      return false;
    }
  }

  // =========================
  // Elements
  // =========================
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
  const prizeLabelInput = $("#prizeLabelInput");
  const prizeStockInput = $("#prizeStockInput");
  const prizeImgInput = $("#prizeImgInput");
  const btnAddPrize = $("#btnAddPrize");
  const adminPrizeList = $("#adminPrizeList");

  const lastOneNameInput = $("#lastOneNameInput");
  const lastOneLabelInput = $("#lastOneLabelInput");
  const lastOneDescInput = $("#lastOneDescInput");
  const lastOneImgInput = $("#lastOneImgInput");
  const btnApplyLastOne = $("#btnApplyLastOne");
  const btnClearLastOne = $("#btnClearLastOne");

  const progressInner = $("#progressInner");
  const progressPercent = $("#progressPercent");
  const openedCount = $("#openedCount");
  const totalCount = $("#totalCount");

  const drawModal = $("#drawModal");
  const modalBackdrop = $("#modalBackdrop");
  const modalClose = $("#modalClose");
  const modalOk = $("#modalOk");
  const modalTitle = $("#modalTitle");
  const modalSub = $("#modalSub");
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
      modalResultImg.src = CONFIG.emptyResultImage;
    };
  }

  // =========================
  // FX CSS
  // =========================
  injectFxCss();

  function injectFxCss() {
    if (document.querySelector('style[data-kuji-fx="1"]')) return;

    const css = `
      .modal-card{ transition: box-shadow .35s ease, border-color .35s ease, background .35s ease; }
      .modal-card.fx-gold{
        border: 2px solid rgba(255,215,0,.95);
        background: radial-gradient(1200px 400px at 50% 0%, rgba(255,215,0,.10), rgba(10,12,18,.92));
        box-shadow: 0 0 10px rgba(255,215,0,.85), 0 0 28px rgba(255,235,59,.55), 0 0 60px rgba(255,215,0,.35);
      }
      .modal-card.fx-purple{
        border: 2px solid rgba(177,76,255,.95);
        background: radial-gradient(1200px 400px at 50% 0%, rgba(177,76,255,.12), rgba(10,12,18,.92));
        box-shadow: 0 0 10px rgba(177,76,255,.85), 0 0 28px rgba(142,43,255,.55), 0 0 60px rgba(177,76,255,.35);
      }
      .modal-card.fx-blue{
        border: 2px solid rgba(61,168,255,.95);
        background: radial-gradient(1200px 400px at 50% 0%, rgba(61,168,255,.12), rgba(10,12,18,.92));
        box-shadow: 0 0 10px rgba(61,168,255,.85), 0 0 28px rgba(0,123,255,.55), 0 0 60px rgba(61,168,255,.35);
      }
      .modal-card.fx-green{
        border: 2px solid rgba(0,255,136,.75);
        background: radial-gradient(1200px 400px at 50% 0%, rgba(0,255,136,.08), rgba(10,12,18,.92));
        box-shadow: 0 0 6px rgba(0,255,136,.45), 0 0 18px rgba(0,255,136,.25);
      }

      .modal-card.fx-flash::after{
        content:"";
        position:absolute; inset:-2px;
        background: radial-gradient(circle at 50% 40%, rgba(255,235,59,.65), rgba(255,235,59,0) 60%);
        opacity:0; pointer-events:none;
        animation: fxFlash 520ms ease-out 1;
      }
      @keyframes fxFlash{
        0%{opacity:0; transform:scale(.98);}
        25%{opacity:1; transform:scale(1.02);}
        100%{opacity:0; transform:scale(1.06);}
      }

      .modal-card.fx-shake{ animation: fxShake 520ms ease-in-out 1; }
      @keyframes fxShake{
        0%{transform: translate(-50%, -50%) rotate(0deg);}
        15%{transform: translate(calc(-50% + 6px), calc(-50% - 2px)) rotate(0.6deg);}
        30%{transform: translate(calc(-50% - 7px), calc(-50% + 3px)) rotate(-0.7deg);}
        45%{transform: translate(calc(-50% + 6px), calc(-50% + 2px)) rotate(0.6deg);}
        60%{transform: translate(calc(-50% - 5px), calc(-50% - 2px)) rotate(-0.5deg);}
        100%{transform: translate(-50%, -50%) rotate(0deg);}
      }

      .modal-card.fx-ripple::before{
        content:"";
        position:absolute; inset:0;
        pointer-events:none;
        background: radial-gradient(circle at 50% 55%, rgba(61,168,255,.40), rgba(61,168,255,0) 55%);
        opacity:0;
        animation: fxRipple 820ms ease-out 1;
      }
      @keyframes fxRipple{
        0%{opacity:0; transform:scale(.90);}
        25%{opacity:1;}
        100%{opacity:0; transform:scale(1.20);}
      }

      .confetti{
        position:absolute;
        top:-12px;
        width:8px;
        height:14px;
        border-radius:3px;
        animation: confFall 900ms ease-in forwards;
        opacity:.95;
      }
      @keyframes confFall{
        0%{transform: translateY(0) rotate(0deg); opacity:1;}
        100%{transform: translateY(260px) rotate(260deg); opacity:0;}
      }
    `;

    const style = document.createElement("style");
    style.setAttribute("data-kuji-fx", "1");
    style.textContent = css;
    document.head.appendChild(style);
  }

  // =========================
  // Mode
  // =========================
  btnToggleMode?.addEventListener("click", () => {
    setMode(state.mode === "broadcast" ? "admin" : "broadcast");
  });

  btnCloseAdmin?.addEventListener("click", () => {
    setMode("broadcast");
  });

  function setMode(mode) {
    state.mode = mode;
    document.body.setAttribute("data-mode", mode);

    if (btnToggleMode) {
      btnToggleMode.textContent = mode === "broadcast" ? "방송 모드" : "관리자 모드";
    }

    if (adminPanel) {
      adminPanel.classList.toggle("show", mode === "admin");
    }

    saveLocalDebounced();
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "`" || e.key === "~") {
      e.preventDefault();
      setMode(state.mode === "broadcast" ? "admin" : "broadcast");
    }

    if ((e.key === "r" || e.key === "R") && state.mode === "admin") {
      resetAll();
    }

    if ((e.key === "u" || e.key === "U") && state.mode === "admin") {
      undo();
    }
  });

  // =========================
  // Admin buttons
  // =========================
  btnReset?.addEventListener("click", resetAll);

  btnSave?.addEventListener("click", () => {
    saveLocal();
    alert("저장되었습니다.");
  });

  btnLoad?.addEventListener("click", () => {
    const ok = loadLocal();
    pruneToTotal(state.settings.totalTickets);
    rebuildDeck();
    buildBoard(state.settings.totalTickets);
    renderAll();
    alert(ok ? "불러오기 완료" : "저장된 데이터가 없습니다.");
  });

  btnUndo?.addEventListener("click", undo);

  btnApplyTitle?.addEventListener("click", () => {
    const t = (kujiTitleInput?.value || "").trim();
    if (!t) {
      alert("쿠지명을 입력하세요.");
      return;
    }

    pushHistory();
    state.settings.kujiTitle = t;
    if (kujiTitleText) kujiTitleText.textContent = t;

    saveLocalDebounced();
    alert("쿠지명이 적용되었습니다.");
  });

  btnApplyTickets?.addEventListener("click", () => {
    const n = Number(totalTicketsInput?.value);

    if (!Number.isFinite(n) || n < 1 || n > 500) {
      alert("전체 뽑기 수는 1~500 사이의 숫자로 입력하세요.");
      if (totalTicketsInput) totalTicketsInput.value = String(state.settings.totalTickets);
      return;
    }

    pushHistory();
    state.settings.totalTickets = Math.floor(n);

    pruneToTotal(state.settings.totalTickets);
    rebuildDeck();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveLocalDebounced();

    alert("전체 뽑기 수가 적용되었습니다.");
  });

  btnAddPrize?.addEventListener("click", addPrize);
  btnApplyLastOne?.addEventListener("click", applyLastOnePrize);
  btnClearLastOne?.addEventListener("click", clearLastOnePrize);

  function pushHistory() {
    try {
      state.history.push(JSON.stringify(exportState()));
      if (state.history.length > 50) {
        state.history.shift();
      }
    } catch {}
  }

  function resetAll() {
    if (!confirm("전체 초기화를 진행할까요? 상품 목록은 오지상만 남기고 초기화됩니다.")) {
      return;
    }

    state.used = {};
    state.selected = null;
    state.logs = [];
    state.queue = [];
    state.history = [];
    state.prizes = [createDefaultOjiPrize()];
    state.settings.lastOnePrize = null;

    rebuildDeck();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveLocal();
  }

  function undo() {
    const snap = state.history.pop();
    if (!snap) {
      alert("되돌릴 내용이 없습니다.");
      return;
    }

    importState(JSON.parse(snap));
    pruneToTotal(state.settings.totalTickets);
    rebuildDeck();
    buildBoard(state.settings.totalTickets);
    renderAll();
    saveLocalDebounced();
  }

  // =========================
  // Prize helpers
  // =========================
  function labelToTier(label) {
    const raw = String(label || "").trim().toUpperCase();
    const match = raw.match(/^([A-Z])/);
    if (!match) return 999;
    return match[1].charCodeAt(0) - 64;
  }

  function addPrize() {
    const name = (prizeNameInput?.value || "").trim();
    const label = (prizeLabelInput?.value || "").trim().toUpperCase();
    const stock = Number(prizeStockInput?.value || 0);
    const file = prizeImgInput?.files?.[0];

    if (!name) {
      alert("상품 이름을 입력하세요.");
      return;
    }

    if (!label) {
      alert("등급을 입력하세요. 예: A상");
      return;
    }

    if (!Number.isFinite(stock) || stock < 1) {
      alert("수량은 1 이상으로 입력하세요.");
      return;
    }

    const finalize = (imgSrc) => {
      pushHistory();

      const newPrize = {
        id: "P" + Date.now() + Math.random().toString(16).slice(2, 6),
        tier: labelToTier(label),
        label,
        name,
        stock,
        total: stock,
        img: imgSrc || CONFIG.emptyResultImage,
      };

      state.prizes.push(newPrize);
      state.prizes.sort((a, b) => a.tier - b.tier);

      rebuildDeck();
      renderAll();
      saveLocalDebounced();

      if (prizeNameInput) prizeNameInput.value = "";
      if (prizeLabelInput) prizeLabelInput.value = "";
      if (prizeStockInput) prizeStockInput.value = "1";
      if (prizeImgInput) prizeImgInput.value = "";

      alert("상품이 추가되었습니다.");
    };

    if (!file) {
      finalize(CONFIG.emptyResultImage);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => finalize(e.target.result);
    reader.readAsDataURL(file);
  }

  function applyLastOnePrize() {
    const name = (lastOneNameInput?.value || "").trim();
    const label = (lastOneLabelInput?.value || "").trim() || "LAST ONE";
    const desc = (lastOneDescInput?.value || "").trim() || "마지막 타일 오픈 시 보너스로 지급";
    const file = lastOneImgInput?.files?.[0];

    if (!name) {
      alert("라스트원 상품 이름을 입력하세요.");
      return;
    }

    const finalize = (imgSrc) => {
      pushHistory();

      state.settings.lastOnePrize = {
        label,
        name,
        desc,
        img: imgSrc || state.settings.lastOnePrize?.img || CONFIG.emptyResultImage,
        claimed: false,
      };

      renderAll();
      saveLocalDebounced();
      alert("라스트원 상품이 적용되었습니다.");
    };

    if (!file) {
      finalize(state.settings.lastOnePrize?.img || CONFIG.emptyResultImage);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => finalize(e.target.result);
    reader.readAsDataURL(file);
  }

  function clearLastOnePrize() {
    if (!state.settings.lastOnePrize) {
      alert("등록된 라스트원 상품이 없습니다.");
      return;
    }

    if (!confirm("라스트원 상품을 삭제할까요?")) return;

    pushHistory();
    state.settings.lastOnePrize = null;

    if (lastOneNameInput) lastOneNameInput.value = "";
    if (lastOneLabelInput) lastOneLabelInput.value = "";
    if (lastOneDescInput) lastOneDescInput.value = "";
    if (lastOneImgInput) lastOneImgInput.value = "";

    renderAll();
    saveLocalDebounced();
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
    state.logs = state.logs.filter((l) => l.number >= 1 && l.number <= total);

    if (state.selected && (state.selected < 1 || state.selected > total)) {
      state.selected = null;
    }
  }

  // =========================
  // Deck
  // =========================
  function rebuildDeck() {
    const total = state.settings.totalTickets;
    const deck = [];

    state.prizes.forEach((p) => {
      if (p.id === "OJI") return;
      const cnt = Math.max(0, Number(p.stock) || 0);
      for (let i = 0; i < cnt; i++) {
        deck.push(p.id);
      }
    });

    if (deck.length > total) {
      deck.length = total;
    }

    const remain = total - deck.length;
    for (let i = 0; i < remain; i++) {
      deck.push("OJI");
    }

    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    state.drawDeck = deck;
  }

  function pickPrizeFromDeck() {
    if (!Array.isArray(state.drawDeck) || state.drawDeck.length <= 0) {
      return null;
    }
    const id = state.drawDeck.pop();
    return state.prizes.find((p) => p.id === id) || null;
  }

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
    saveLocalDebounced();
  }

  function shiftQueue() {
    if (state.queue.length > 0) {
      state.queue.shift();
    }
    renderQueue();
    saveLocalDebounced();
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
        saveLocalDebounced();
      });

      wrap.appendChild(name);
      wrap.appendChild(rm);
      queueList.appendChild(wrap);
    });
  }

  // =========================
  // Board
  // =========================
  function buildBoard(total) {
    if (!board) return;
    board.innerHTML = "";

    for (let i = 1; i <= total; i++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "card-btn";
      btn.dataset.n = String(i);

      const img = document.createElement("img");
      img.src = CONFIG.paperImage;
      img.alt = "뽑기 카드";

      const label = document.createElement("div");
      label.className = "num-label";
      label.textContent = String(i);

      btn.appendChild(img);
      btn.appendChild(label);

      btn.addEventListener("click", () => {
        const n = String(i);
        if (state.used[n]) return;
        state.selected = i;
        renderBoardState();
        startDraw(i);
      });

      board.appendChild(btn);
    }

    renderBoardState();
  }

  function renderBoardState() {
    if (!board) return;

    [...board.children].forEach((btn) => {
      const n = btn.dataset.n;
      btn.classList.toggle("used", !!state.used[n]);
      btn.classList.toggle("selected", Number(n) === state.selected);
    });
  }

  // =========================
  // Lists
  // =========================
  function renderPrizes() {
  if (!prizeList || !prizeSummary) return;
  prizeList.innerHTML = "";

  const left = Array.isArray(state.drawDeck) ? state.drawDeck.length : 0;
  const total = state.settings.totalTickets;
  prizeSummary.textContent = `남은 수량 ${left} / 총 ${total}`;

  // 라스트원 상품 먼저 표시
  const lastOne = state.settings.lastOnePrize;
  if (lastOne) {
    const card = document.createElement("div");
    card.className = "prizecard lastone-prize";

    if (lastOne.claimed) {
      card.classList.add("claimed");
    }

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
    img.src = lastOne.img || CONFIG.emptyResultImage;
    img.alt = lastOne.name;
    img.onerror = () => {
      img.src = CONFIG.emptyResultImage;
    };

    const badge = document.createElement("div");
    badge.className = "lastone-badge bottom-center";
    badge.textContent = lastOne.label || "LAST ONE";

    mediaWrap.appendChild(img);
    mediaWrap.appendChild(badge);

    card.appendChild(head);
    card.appendChild(mediaWrap);

    prizeList.appendChild(card);
  }

  // 일반 상품들
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

      const totalCountNum = typeof p.total === "number" ? p.total : p.stock;

      if (p.id === "OJI") {
        count.textContent = "";
      } else {
        count.innerHTML = `<span class="remain">${p.stock}</span><span class="slash">/</span><span class="total">${totalCountNum}</span>`;
      }

      line1.appendChild(tierDot);
      line1.appendChild(tierText);
      line1.appendChild(count);

      const name = document.createElement("div");
      name.className = "prizename";
      name.textContent = p.name;

      title.appendChild(line1);
      title.appendChild(name);

      const img = document.createElement("img");
      img.className = "prizeimg";
      img.src = p.img || CONFIG.emptyResultImage;
      img.alt = p.name;
      img.onerror = () => {
        img.src = CONFIG.emptyResultImage;
      };

      head.appendChild(title);
      card.appendChild(head);
      card.appendChild(img);

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
      thumb.src = p.img || CONFIG.emptyResultImage;
      thumb.alt = p.name;
      thumb.onerror = () => {
        thumb.src = CONFIG.emptyResultImage;
      };

      const meta = document.createElement("div");
      meta.className = "admin-prize-meta";

      const title = document.createElement("div");
      title.className = "admin-prize-title";
      title.textContent = `${p.label} ${p.name}`;

      const sub = document.createElement("div");
      sub.className = "admin-prize-sub";
      const totalCountNum = typeof p.total === "number" ? p.total : p.stock;
      sub.textContent = `남은 수량 ${p.stock} / 총 ${totalCountNum}`;

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
          rebuildDeck();
          renderAll();
          saveLocalDebounced();
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

if (item.tier <= 3) {
  row.classList.add("tier-top");
}

      const tier = document.createElement("div");
      tier.className = "wintier";
      tier.textContent = item.prizeId;

      const main = document.createElement("div");
      main.className = "winmain";

      const name = document.createElement("div");
      name.className = "winname";
      name.textContent = item.prizeName;

      const meta = document.createElement("div");
      meta.className = "winmeta";
      meta.textContent = `번호 ${item.number} · 닉네임: ${item.who}`;

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
    const pct = total ? Math.round((opened / total) * 100) : 0;

    if (openedCount) openedCount.textContent = String(opened);
    if (totalCount) totalCount.textContent = String(total);
    if (progressInner) progressInner.style.width = `${pct}%`;
    if (progressPercent) progressPercent.textContent = `${pct}%`;
  }

  function renderAll() {
    renderBoardState();
    renderPrizes();
    renderAdminPrizeList();
    renderWinList();
    renderQueue();
    renderProgress();

    if (kujiTitleText) kujiTitleText.textContent = state.settings.kujiTitle;
    if (kujiTitleInput) kujiTitleInput.value = state.settings.kujiTitle;
    if (totalTicketsInput) totalTicketsInput.value = String(state.settings.totalTickets);

    if (lastOneNameInput) lastOneNameInput.value = state.settings.lastOnePrize?.name || "";
    if (lastOneLabelInput) lastOneLabelInput.value = state.settings.lastOnePrize?.label || "";
    if (lastOneDescInput) lastOneDescInput.value = state.settings.lastOnePrize?.desc || "";
  }

  // =========================
  // Modal
  // =========================
  function openModal() {
    if (!drawModal) return;
    drawModal.classList.add("show");
    drawModal.style.display = "block";
    drawModal.style.zIndex = "999999";
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

  function runModalPeelReveal({ prizeName, number, who, prizeImg }) {
    const card = drawModal?.querySelector(".modal-card");
    if (!card) return;

    modalPaper?.classList.remove("active");
    modalReveal?.classList.remove("active");
    card.classList.remove("peel", "reveal-text-on");

    if (modalRevealBig) modalRevealBig.textContent = prizeName;
    if (modalRevealSmall) modalRevealSmall.textContent = `번호 ${number} · 닉네임: ${who}`;

    if (modalResultImg) modalResultImg.src = prizeImg || CONFIG.emptyResultImage;
    if (modalPaperImg) modalPaperImg.src = CONFIG.coverPaperImage;

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

  // =========================
  // Draw flow
  // =========================
  async function startDraw(number) {
    try {
      const nKey = String(number);
      if (state.used[nKey]) return;

      if (!Array.isArray(state.drawDeck) || state.drawDeck.length <= 0) {
        rebuildDeck();
      }

      openModal();

      if (modalTitle) modalTitle.textContent = "추첨 중";
      if (modalSub) modalSub.textContent = "잠시만 기다려 주세요.";
      modalLoading?.classList.add("active");

      await sleep(CONFIG.drawDelayMs);

      const prize = pickPrizeFromDeck();

      if (!prize) {
        modalLoading?.classList.remove("active");
        if (modalTitle) modalTitle.textContent = "오류";
        if (modalSub) modalSub.textContent = "덱이 비어 있습니다.";
        return;
      }

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

      const who = (state.queue?.[0]?.name || "참여자").trim() || "참여자";

      const rewardText = lastOnePrize
        ? `${prize.label} ${prize.name} + ${lastOnePrize.label} ${lastOnePrize.name}`
        : `${prize.label} ${prize.name}`;

      const log = {
        number,
        who,
        prizeId: lastOnePrize ? `${prize.label} + ${lastOnePrize.label}` : prize.label,
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
      if (modalSub) modalSub.textContent = rewardText;

      applyTierNeon(prize.tier);

      runModalPeelReveal({
        prizeName: rewardText,
        number,
        who,
        prizeImg: prize.img || CONFIG.emptyResultImage,
      });

      const isFlashy = prize.id !== "OJI" && prize.tier <= CONFIG.flashyTierMax;
      if (isFlashy || lastOnePrize) {
        applyTierSpecialFx(prize.tier);
        burstConfetti(lastOnePrize ? 70 : 52);
        playFanfare();
      }

      shiftQueue();
      state.selected = null;

      renderAll();
      saveLocalDebounced();
    } catch (e) {
      console.error("[KUJI] startDraw error:", e);
      alert("오류가 발생했습니다. 콘솔을 확인하세요.");
    }
  }

  // =========================
  // Init
  // =========================
  loadLocal();

  if (kujiTitleText) kujiTitleText.textContent = state.settings.kujiTitle;
  if (kujiTitleInput) kujiTitleInput.value = state.settings.kujiTitle;
  if (totalTicketsInput) totalTicketsInput.value = String(state.settings.totalTickets);

  setMode(state.mode || "broadcast");

  rebuildDeck();
  buildBoard(state.settings.totalTickets);
  renderAll();

  window.__KUJI__ = { startDraw, rebuildDeck, state };

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
})();
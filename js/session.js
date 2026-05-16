// SCPSession — P2P-синхронизация сессии через PeerJS (бесплатный публичный брокер).
// Первый подключившийся к "комнате" становится ХОСТОМ (управляет терминалом),
// остальные — ЗРИТЕЛЯМИ (смотрят и показывают свои курсоры).
// Админ не использует session.js — у него отдельный маршрут ?admin=1.
(function () {
  // Room ID. По дефолту — нормализованный host+pathname (объединяет http/https,
  // /index.html, trailing slash, чтобы preview и production деплои на vercel
  // не оказывались в разных комнатах). Можно жёстко задать через ?room=foo —
  // тогда любые URL с одинаковым room-параметром попадут в одну комнату.
  function hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }
  function normalizePath(p) {
    let n = (p || '/').replace(/\/index\.html?$/i, '/').replace(/\/+/g, '/');
    if (n.length > 1 && n.endsWith('/')) n = n.slice(0, -1);
    return n || '/';
  }
  let _roomKey;
  try {
    const url = new URL(location.href);
    _roomKey = url.searchParams.get('room') || (location.host + normalizePath(location.pathname));
  } catch (e) {
    _roomKey = location.host + normalizePath(location.pathname || '/');
  }
  const ROOM = hashStr('scp-terminal-v1::' + _roomKey);
  const HOST_ID = 'scp-term-host-' + ROOM;

  const PALETTE = ['#ff66aa', '#ffcc33', '#66ccff', '#cc88ff', '#ff8844', '#88ffcc', '#ffaaee', '#aaff88'];
  const NAME_A = ['ALPHA','BRAVO','CHARLIE','DELTA','ECHO','FOXTROT','GOLF','HOTEL','INDIA','JULIET','KILO','LIMA','MIKE','NOVEMBER'];

  let state = {
    ready: false,
    isHost: false,
    selfId: null,
    selfName: null,
    selfColor: null,
    peer: null,             // PeerJS peer
    hostConn: null,         // DataConnection to host (viewer only)
    viewerConns: new Map(), // id -> DataConnection (host only)
    peers: new Map(),       // id -> {name, color}   (known peers incl. self)
    cursors: new Map(),     // id -> {x, y, t}
    lastSharedState: null,
    lastSharedTerminals: null,   // {terminals, masterPassword, virusDiskReady, hackTargetTerminalId, revealedHints}
    callbacks: { onState: null, onCursors: null, onRole: null, onPeers: null, onStatus: null, onPasswordAttempt: null, onPasswordResult: null, onTerminals: null, onInheritedTerminals: null },
    disabled: false,
    _ttlInterval: null,
    _promoteTimer: null,
  };

  function pickName() {
    const a = NAME_A[Math.floor(Math.random() * NAME_A.length)];
    const n = Math.floor(Math.random() * 90 + 10);
    return 'NODE-' + a + '-' + n;
  }
  function pickColor() { return PALETTE[Math.floor(Math.random() * PALETTE.length)]; }

  function emit(name, v) {
    const cb = state.callbacks[name];
    if (cb) try { cb(v); } catch (e) { console.warn('SCPSession cb error', e); }
  }
  function emitPeers() {
    emit('onPeers', Array.from(state.peers.entries()).map(([id, p]) => ({ id, ...p })));
  }
  function emitCursors() {
    const list = [];
    state.cursors.forEach((c, id) => {
      if (id === state.selfId) return; // свой курсор не показываем
      const p = state.peers.get(id);
      list.push({ id, x: c.x, y: c.y, name: p ? p.name : '?', color: p ? p.color : '#fff' });
    });
    emit('onCursors', list);
  }

  function broadcastFromHost(msg) {
    const data = JSON.stringify(msg);
    state.viewerConns.forEach(c => { try { c.send(data); } catch (e) {} });
  }

  function onHostData(conn, raw) {
    let msg;
    try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
    if (!msg || !msg.type) return;
    if (msg.type === 'hello') {
      // Зритель представился
      state.peers.set(conn.peer, { name: msg.name, color: msg.color });
      // Ответим полным стейтом + терминалами + списком пиров
      const payload = {
        type: 'welcome',
        peers: Array.from(state.peers.entries()).map(([id, p]) => ({ id, ...p })),
        state: state.lastSharedState,
        terminals: state.lastSharedTerminals,
      };
      try { conn.send(JSON.stringify(payload)); } catch (e) {}
      emitPeers();
      broadcastFromHost({ type: 'peers', peers: Array.from(state.peers.entries()).map(([id, p]) => ({ id, ...p })) });
    } else if (msg.type === 'cursor') {
      state.cursors.set(conn.peer, { x: msg.x, y: msg.y, t: Date.now() });
      // Ре-бродкаст всем (включая отправителя — он отфильтрует)
      broadcastFromHost({ type: 'cursors', cursors: Array.from(state.cursors.entries()).map(([id, c]) => ({ id, x: c.x, y: c.y })) });
      emitCursors();
    } else if (msg.type === 'password-attempt') {
      // Зритель попробовал ввести пароль — отдаём в приложение для валидации хостом
      emit('onPasswordAttempt', { senderId: conn.peer, value: msg.value });
    } else if (msg.type === 'promote-ack') {
      // Зритель подтвердил получение promote — теперь безопасно освобождаем HOST_ID.
      // Помечаем себя как viewer ДО retryInit, чтобы _connect не пытался снова взять HOST_ID
      // и не выиграл гонку у нового хоста (бывшего зрителя). Небольшая задержка даёт
      // зрителю время фактически захватить HOST_ID до того, как мы попытаемся подключиться.
      if (state._promoteTimer) { clearTimeout(state._promoteTimer); state._promoteTimer = null; }
      sessionStorage.setItem('scp_preferred_role', 'viewer');
      setTimeout(() => retryInit(), 300);
    } else if (msg.type === 'bye') {
      state.viewerConns.delete(conn.peer);
      state.peers.delete(conn.peer);
      state.cursors.delete(conn.peer);
      emitPeers();
      emitCursors();
      broadcastFromHost({
        type: 'peers',
        peers: Array.from(state.peers.entries()).map(([id, p]) => ({ id, ...p })),
      });
      try { conn.close(); } catch (e) {}
    }
  }

  function onViewerData(raw) {
    let msg;
    try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
    if (!msg || !msg.type) return;
    if (msg.type === 'welcome') {
      state.peers = new Map((msg.peers || []).map(p => [p.id, { name: p.name, color: p.color }]));
      if (!state.peers.has(state.selfId)) {
        state.peers.set(state.selfId, { name: state.selfName, color: state.selfColor });
      }
      emitPeers();
      if (msg.state) { state.lastSharedState = msg.state; emit('onState', msg.state); }
      if (msg.terminals) { state.lastSharedTerminals = msg.terminals; emit('onTerminals', msg.terminals); }
    } else if (msg.type === 'terminals') {
      state.lastSharedTerminals = msg.payload;
      emit('onTerminals', msg.payload);
    } else if (msg.type === 'peers') {
      state.peers = new Map((msg.peers || []).map(p => [p.id, { name: p.name, color: p.color }]));
      emitPeers();
    } else if (msg.type === 'state') {
      state.lastSharedState = msg.state;
      emit('onState', msg.state);
    } else if (msg.type === 'cursors') {
      state.cursors = new Map((msg.cursors || []).map(c => [c.id, { x: c.x, y: c.y, t: Date.now() }]));
      emitCursors();
    } else if (msg.type === 'password-result') {
      // Ответ хоста на нашу попытку ввести пароль
      emit('onPasswordResult', msg);
    } else if (msg.type === 'reload') {
      // Хост попросил всех зрителей перезагрузиться (после Sync в админке).
      setTimeout(() => { try { window.location.reload(); } catch (e) {} }, 200);
    } else if (msg.type === 'promote') {
      // Хост передаёт нам управление — подтверждаем, затем захватываем HOST_ID
      const inheritedState = msg.state || null;
      const inheritedTerminals = msg.terminals || null;
      const conn = state.hostConn;
      // Отправляем подтверждение хосту, пока соединение ещё открыто
      try { if (conn && conn.open) conn.send(JSON.stringify({ type: 'promote-ack' })); } catch (e) {}
      if (conn && conn._bye) { window.removeEventListener('beforeunload', conn._bye); conn._bye = null; }
      setTimeout(() => {
        if (state._ttlInterval) { clearInterval(state._ttlInterval); state._ttlInterval = null; }
        try { if (state.peer) state.peer.destroy(); } catch (e) {}
        state.peer = null;
        state.viewerConns.clear();
        state.peers.clear();
        state.cursors.clear();
        state.hostConn = null;
        const newPeer = new Peer(HOST_ID, { debug: 0 });
        state.peer = newPeer;
        let resolved = false;
        newPeer.on('open', (id) => {
          if (resolved) return; resolved = true;
          if (id === HOST_ID) {
            becomeHost();
            if (inheritedState) { state.lastSharedState = inheritedState; emit('onState', inheritedState); }
            // Применяем terminals от старого хоста ДО того, как наш broadcastTerminals
            // успеет рассосаться — иначе мы перетрём всем подсказки/флаги пустыми
            if (inheritedTerminals) {
              state.lastSharedTerminals = inheritedTerminals;
              emit('onInheritedTerminals', inheritedTerminals);
            }
          } else {
            retryInit(); // не удалось получить HOST_ID — обычный реконнект
          }
        });
        newPeer.on('error', () => {
          if (resolved) return; resolved = true;
          retryInit();
        });
      }, 100);
    }
  }

  function becomeHost() {
    sessionStorage.setItem('scp_preferred_role', 'host');
    state.isHost = true;
    state.ready = true;
    state.selfId = HOST_ID;
    state.peers.set(state.selfId, { name: state.selfName, color: state.selfColor });
    emit('onRole', 'host');
    emit('onStatus', 'host');
    emitPeers();

    state.peer.on('connection', (conn) => {
      conn.on('open', () => {
        state.viewerConns.set(conn.peer, conn);
      });
      conn.on('data', (data) => onHostData(conn, data));
      conn.on('close', () => {
        state.viewerConns.delete(conn.peer);
        state.peers.delete(conn.peer);
        state.cursors.delete(conn.peer);
        emitPeers();
        emitCursors();
        broadcastFromHost({ type: 'peers', peers: Array.from(state.peers.entries()).map(([id, p]) => ({ id, ...p })) });
      });
      conn.on('error', () => {});
    });

    // Purge cursors that haven't moved in 5 s — handles tabs closed without a clean goodbye
    state._ttlInterval = setInterval(() => {
      const STALE_MS = 5000;
      const now = Date.now();
      let changed = false;
      state.cursors.forEach((c, id) => {
        if (now - c.t > STALE_MS) { state.cursors.delete(id); changed = true; }
      });
      if (changed) {
        broadcastFromHost({
          type: 'cursors',
          cursors: Array.from(state.cursors.entries()).map(([id, c]) => ({ id, x: c.x, y: c.y })),
        });
        emitCursors();
      }
    }, 3000);
  }

  function becomeViewer() {
    sessionStorage.setItem('scp_preferred_role', 'viewer');
    state.isHost = false;
    state.selfId = state.peer.id;
    state.peers.set(state.selfId, { name: state.selfName, color: state.selfColor });
    emit('onRole', 'viewer');
    emit('onStatus', 'connecting');

    const conn = state.peer.connect(HOST_ID, { reliable: true });
    state.hostConn = conn;

    // Safety net: если хост по факту не существует (HOST_ID никто не занял)
    // или не отвечает welcome — за 4.5с сбрасываем preferred_role и пробуем стать хостом сами.
    let welcomeOk = false;
    const welcomeTimer = setTimeout(() => {
      if (welcomeOk) return;
      try { conn.close(); } catch (e) {}
      sessionStorage.removeItem('scp_preferred_role');
      retryInit();
    }, 4500);

    conn.on('open', () => {
      state.ready = true;
      emit('onStatus', 'viewer');
      try { conn.send(JSON.stringify({ type: 'hello', name: state.selfName, color: state.selfColor })); } catch (e) {}
      const _bye = () => { try { conn.send(JSON.stringify({ type: 'bye' })); } catch (e) {} };
      window.addEventListener('beforeunload', _bye);
      conn._bye = _bye;
    });
    conn.on('data', (raw) => {
      if (!welcomeOk) {
        try {
          const m = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (m && m.type === 'welcome') { welcomeOk = true; clearTimeout(welcomeTimer); }
        } catch (e) {}
      }
      onViewerData(raw);
    });
    conn.on('close', () => {
      clearTimeout(welcomeTimer);
      if (conn._bye) { window.removeEventListener('beforeunload', conn._bye); conn._bye = null; }
      state.ready = false;
      emit('onStatus', 'disconnected');
      // Хост отвалился — попытаемся стать хостом через retryInit
      setTimeout(() => retryInit(), 1200);
    });
    conn.on('error', () => {
      // peer-unavailable и подобные — досрочный fail, не ждём весь таймаут
      if (welcomeOk) return;
      clearTimeout(welcomeTimer);
      try { conn.close(); } catch (e) {}
      sessionStorage.removeItem('scp_preferred_role');
      setTimeout(() => retryInit(), 800);
    });
  }

  function retryInit() {
    if (state.disabled) return;
    if (state._ttlInterval) { clearInterval(state._ttlInterval); state._ttlInterval = null; }
    if (state._promoteTimer) { clearTimeout(state._promoteTimer); state._promoteTimer = null; }
    try { if (state.peer) state.peer.destroy(); } catch (e) {}
    state.peer = null;
    state.viewerConns.clear();
    state.peers.clear();
    state.cursors.clear();
    state.hostConn = null;
    _connect();
  }

  function _connect() {
    if (!window.Peer) {
      console.warn('SCPSession: PeerJS не загружен — session отключена.');
      emit('onStatus', 'offline');
      return;
    }
    // Если вкладка была зрителем — не конкурируем за HOST_ID, сразу идём как зритель
    if (sessionStorage.getItem('scp_preferred_role') === 'viewer') {
      emit('onStatus', 'connecting');
      const viewer = new Peer({ debug: 0 });
      state.peer = viewer;
      viewer.on('open', () => becomeViewer());
      viewer.on('error', (e2) => {
        // peer-unavailable приходит на peer-level, а не на conn — сюда. Хост
        // на самом деле не существует → сбросить sticky-роль и попробовать стать хостом.
        if (e2 && (e2.type === 'peer-unavailable' || /Could not connect to peer/i.test(String(e2.message || '')))) {
          sessionStorage.removeItem('scp_preferred_role');
          setTimeout(() => retryInit(), 400);
          return;
        }
        console.warn('SCPSession viewer error', e2);
        emit('onStatus', 'offline');
      });
      return;
    }
    // Пытаемся взять host-id
    const attemptHost = new Peer(HOST_ID, { debug: 0 });
    state.peer = attemptHost;
    let resolved = false;

    attemptHost.on('open', (id) => {
      if (resolved) return;
      resolved = true;
      if (id === HOST_ID) becomeHost();
    });
    attemptHost.on('error', (err) => {
      if (resolved) return;
      resolved = true;
      try { attemptHost.destroy(); } catch (e) {}
      if (err && err.type === 'unavailable-id') {
        // Кто-то уже держит HOST_ID — становимся зрителем
        const viewer = new Peer({ debug: 0 });
        state.peer = viewer;
        viewer.on('open', () => becomeViewer());
        viewer.on('error', (e2) => {
          if (e2 && (e2.type === 'peer-unavailable' || /Could not connect to peer/i.test(String(e2.message || '')))) {
            sessionStorage.removeItem('scp_preferred_role');
            setTimeout(() => retryInit(), 400);
            return;
          }
          console.warn('SCPSession viewer error', e2);
          emit('onStatus', 'offline');
        });
      } else {
        console.warn('SCPSession host error', err);
        emit('onStatus', 'offline');
      }
    });
  }

  function init(opts) {
    if (state.peer) return; // уже инициализирован
    state.callbacks = Object.assign({}, state.callbacks, opts || {});
    state.selfName = pickName();
    state.selfColor = pickColor();
    _connect();
  }

  function disable() {
    state.disabled = true;
    try { if (state.peer) state.peer.destroy(); } catch (e) {}
  }

  // Хост: транслирует общий стейт всем зрителям.
  // Если ещё не стали хостом — кладём пейлоад в lastSharedState,
  // чтобы welcome для подключающегося зрителя содержал актуальные поля,
  // а follow-up бродкасты после becomeHost уже разойдутся по DataChannel.
  function broadcastState(s) {
    state.lastSharedState = s;
    if (!state.isHost) return;
    broadcastFromHost({ type: 'state', state: s });
  }

  // Хост: транслирует терминалы и админ-конфиг (источник истины для зрителей).
  // Шлётся реже broadcastState — только при изменении state.terminals/masterPassword
  // и админских флагов. Зритель использует это вместо своего локального localStorage.
  function broadcastTerminals(payload) {
    state.lastSharedTerminals = payload;
    if (!state.isHost) return;
    broadcastFromHost({ type: 'terminals', payload });
  }

  let lastCursorSend = 0;
  function sendCursor(x, y) {
    if (!state.ready) return;
    const now = Date.now();
    if (now - lastCursorSend < 60) return; // ~16 Hz
    lastCursorSend = now;
    if (state.isHost) {
      state.cursors.set(state.selfId, { x, y, t: now });
      broadcastFromHost({ type: 'cursors', cursors: Array.from(state.cursors.entries()).map(([id, c]) => ({ id, x: c.x, y: c.y })) });
      emitCursors();
    } else if (state.hostConn && state.hostConn.open) {
      try { state.hostConn.send(JSON.stringify({ type: 'cursor', x, y })); } catch (e) {}
    }
  }

  // Хост: разослать всем зрителям команду reload (после Sync в админке).
  function broadcastReload() {
    if (!state.isHost) return;
    broadcastFromHost({ type: 'reload' });
  }

  // Зритель → хост: отправить попытку пароля на серверную валидацию.
  function sendPasswordAttempt(value) {
    if (state.isHost) return;
    if (!state.hostConn || !state.hostConn.open) return;
    try { state.hostConn.send(JSON.stringify({ type: 'password-attempt', value })); } catch (e) {}
  }

  // Хост → конкретный зритель: послать ответ/результат.
  function sendToPeer(targetId, msg) {
    if (!state.isHost) return;
    const conn = state.viewerConns.get(targetId);
    if (!conn || !conn.open) return;
    try { conn.send(JSON.stringify(msg)); } catch (e) {}
  }

  window.SCPSession = {
    init, disable, broadcastState, broadcastTerminals, broadcastReload, sendCursor,
    sendPasswordAttempt, sendToPeer,
    roomId: ROOM,
    transferControl: (targetId) => {
      if (!state.isHost) return;
      const conn = state.viewerConns.get(targetId);
      if (!conn || !conn.open) return;
      try {
        conn.send(JSON.stringify({
          type: 'promote',
          state: state.lastSharedState,
          terminals: state.lastSharedTerminals,
        }));
      } catch (e) {}
      // Ждём ack от зрителя; если не пришёл за 2 с — освобождаем сами
      state._promoteTimer = setTimeout(() => { state._promoteTimer = null; retryInit(); }, 2000);
    },
    get isHost() { return state.isHost; },
    get isReady() { return state.ready; },
    get selfId() { return state.selfId; },
    get selfName() { return state.selfName; },
    get selfColor() { return state.selfColor; },
  };
})();

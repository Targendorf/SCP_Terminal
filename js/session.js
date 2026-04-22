// SCPSession — P2P-синхронизация сессии через PeerJS (бесплатный публичный брокер).
// Первый подключившийся к "комнате" становится ХОСТОМ (управляет терминалом),
// остальные — ЗРИТЕЛЯМИ (смотрят и показывают свои курсоры).
// Админ не использует session.js — у него отдельный маршрут ?admin=1.
(function () {
  // Room ID: хэш от origin+pathname, чтобы одинаковый URL = одна комната.
  function hashStr(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }
  const ROOM = hashStr(location.origin + location.pathname);
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
    callbacks: { onState: null, onCursors: null, onRole: null, onPeers: null, onStatus: null },
    disabled: false,
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
      // Ответим полным стейтом + списком пиров
      const payload = {
        type: 'welcome',
        peers: Array.from(state.peers.entries()).map(([id, p]) => ({ id, ...p })),
        state: state.lastSharedState,
      };
      try { conn.send(JSON.stringify(payload)); } catch (e) {}
      emitPeers();
      broadcastFromHost({ type: 'peers', peers: Array.from(state.peers.entries()).map(([id, p]) => ({ id, ...p })) });
    } else if (msg.type === 'cursor') {
      state.cursors.set(conn.peer, { x: msg.x, y: msg.y, t: Date.now() });
      // Ре-бродкаст всем (включая отправителя — он отфильтрует)
      broadcastFromHost({ type: 'cursors', cursors: Array.from(state.cursors.entries()).map(([id, c]) => ({ id, x: c.x, y: c.y })) });
      emitCursors();
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
    } else if (msg.type === 'peers') {
      state.peers = new Map((msg.peers || []).map(p => [p.id, { name: p.name, color: p.color }]));
      emitPeers();
    } else if (msg.type === 'state') {
      state.lastSharedState = msg.state;
      emit('onState', msg.state);
    } else if (msg.type === 'cursors') {
      state.cursors = new Map((msg.cursors || []).map(c => [c.id, { x: c.x, y: c.y, t: Date.now() }]));
      emitCursors();
    }
  }

  function becomeHost() {
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
  }

  function becomeViewer() {
    state.isHost = false;
    state.selfId = state.peer.id;
    state.peers.set(state.selfId, { name: state.selfName, color: state.selfColor });
    emit('onRole', 'viewer');
    emit('onStatus', 'connecting');

    const conn = state.peer.connect(HOST_ID, { reliable: true });
    state.hostConn = conn;
    conn.on('open', () => {
      state.ready = true;
      emit('onStatus', 'viewer');
      try { conn.send(JSON.stringify({ type: 'hello', name: state.selfName, color: state.selfColor })); } catch (e) {}
    });
    conn.on('data', onViewerData);
    conn.on('close', () => {
      state.ready = false;
      emit('onStatus', 'disconnected');
      // Хост отвалился — попытаемся стать хостом через retryInit
      setTimeout(() => retryInit(), 1200);
    });
    conn.on('error', () => {});
  }

  function retryInit() {
    if (state.disabled) return;
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
  function broadcastState(s) {
    if (!state.isHost) return;
    state.lastSharedState = s;
    broadcastFromHost({ type: 'state', state: s });
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

  window.SCPSession = {
    init, disable, broadcastState, sendCursor,
    get isHost() { return state.isHost; },
    get isReady() { return state.ready; },
    get selfId() { return state.selfId; },
    get selfName() { return state.selfName; },
    get selfColor() { return state.selfColor; },
  };
})();

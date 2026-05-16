// SCPSession — P2P presence (cursors only) через PeerJS.
// Game state синхронизируется через Firestore (см. js/firebase.js).
// PeerJS используется только для high-frequency cursor broadcast — write quota
// Firestore туда тратить не хочется.
(function () {
  function hashStr(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }
  function normalizePath(p) {
    var n = (p || '/').replace(/\/index\.html?$/i, '/').replace(/\/+/g, '/');
    if (n.length > 1 && n.endsWith('/')) n = n.slice(0, -1);
    return n || '/';
  }
  var _roomKey;
  try {
    var url = new URL(location.href);
    _roomKey = url.searchParams.get('room') || (location.host + normalizePath(location.pathname));
  } catch (e) {
    _roomKey = location.host + normalizePath(location.pathname || '/');
  }
  var ROOM = hashStr('scp-terminal-v1::' + _roomKey);
  // Cursor-room хост-id: первый кто подключается, держит cursor-hub.
  var HUB_ID = 'scp-term-cursors-' + ROOM;

  var PALETTE = ['#ff66aa', '#ffcc33', '#66ccff', '#cc88ff', '#ff8844', '#88ffcc', '#ffaaee', '#aaff88'];
  var NAME_A = ['ALPHA','BRAVO','CHARLIE','DELTA','ECHO','FOXTROT','GOLF','HOTEL','INDIA','JULIET','KILO','LIMA','MIKE','NOVEMBER'];

  var state = {
    ready: false,
    isHub: false,
    selfId: null,
    selfName: null,
    selfColor: null,
    peer: null,
    hubConn: null,
    viewerConns: new Map(),
    peers: new Map(),       // id -> {name, color}
    cursors: new Map(),     // id -> {x, y, t}
    callbacks: { onCursors: null, onPeers: null, onSelf: null },
    disabled: false,
    _ttlInterval: null,
  };

  function pickName() {
    var a = NAME_A[Math.floor(Math.random() * NAME_A.length)];
    var n = Math.floor(Math.random() * 90 + 10);
    return 'NODE-' + a + '-' + n;
  }
  function pickColor() { return PALETTE[Math.floor(Math.random() * PALETTE.length)]; }

  function emit(name, v) {
    var cb = state.callbacks[name];
    if (cb) try { cb(v); } catch (e) { console.warn('SCPSession cb error', e); }
  }
  function emitPeers() {
    var arr = [];
    state.peers.forEach(function (p, id) { arr.push({ id: id, name: p.name, color: p.color }); });
    emit('onPeers', arr);
  }
  function emitCursors() {
    var list = [];
    state.cursors.forEach(function (c, id) {
      if (id === state.selfId) return;
      var p = state.peers.get(id);
      list.push({ id: id, x: c.x, y: c.y, name: p ? p.name : '?', color: p ? p.color : '#fff' });
    });
    emit('onCursors', list);
  }

  function broadcastFromHub(msg) {
    var data = JSON.stringify(msg);
    state.viewerConns.forEach(function (c) { try { c.send(data); } catch (e) {} });
  }

  function onHubData(conn, raw) {
    var msg;
    try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
    if (!msg || !msg.type) return;
    if (msg.type === 'hello') {
      state.peers.set(conn.peer, { name: msg.name, color: msg.color });
      var peersList = [];
      state.peers.forEach(function (p, id) { peersList.push({ id: id, name: p.name, color: p.color }); });
      try { conn.send(JSON.stringify({ type: 'welcome', peers: peersList })); } catch (e) {}
      emitPeers();
      broadcastFromHub({ type: 'peers', peers: peersList });
    } else if (msg.type === 'cursor') {
      state.cursors.set(conn.peer, { x: msg.x, y: msg.y, t: Date.now() });
      var cursorsList = [];
      state.cursors.forEach(function (c, id) { cursorsList.push({ id: id, x: c.x, y: c.y }); });
      broadcastFromHub({ type: 'cursors', cursors: cursorsList });
      emitCursors();
    } else if (msg.type === 'bye') {
      state.viewerConns.delete(conn.peer);
      state.peers.delete(conn.peer);
      state.cursors.delete(conn.peer);
      emitPeers();
      emitCursors();
      var peersList2 = [];
      state.peers.forEach(function (p, id) { peersList2.push({ id: id, name: p.name, color: p.color }); });
      broadcastFromHub({ type: 'peers', peers: peersList2 });
      try { conn.close(); } catch (e) {}
    }
  }

  function onViewerData(raw) {
    var msg;
    try { msg = typeof raw === 'string' ? JSON.parse(raw) : raw; } catch (e) { return; }
    if (!msg || !msg.type) return;
    if (msg.type === 'welcome') {
      state.peers = new Map();
      (msg.peers || []).forEach(function (p) { state.peers.set(p.id, { name: p.name, color: p.color }); });
      if (!state.peers.has(state.selfId)) {
        state.peers.set(state.selfId, { name: state.selfName, color: state.selfColor });
      }
      emitPeers();
    } else if (msg.type === 'peers') {
      state.peers = new Map();
      (msg.peers || []).forEach(function (p) { state.peers.set(p.id, { name: p.name, color: p.color }); });
      emitPeers();
    } else if (msg.type === 'cursors') {
      state.cursors = new Map();
      (msg.cursors || []).forEach(function (c) { state.cursors.set(c.id, { x: c.x, y: c.y, t: Date.now() }); });
      emitCursors();
    }
  }

  function becomeHub() {
    state.isHub = true;
    state.ready = true;
    state.selfId = HUB_ID;
    state.peers.set(state.selfId, { name: state.selfName, color: state.selfColor });
    emit('onSelf', { id: state.selfId, name: state.selfName, color: state.selfColor });
    emitPeers();

    state.peer.on('connection', function (conn) {
      conn.on('open', function () { state.viewerConns.set(conn.peer, conn); });
      conn.on('data', function (data) { onHubData(conn, data); });
      conn.on('close', function () {
        state.viewerConns.delete(conn.peer);
        state.peers.delete(conn.peer);
        state.cursors.delete(conn.peer);
        emitPeers();
        emitCursors();
        var peersList = [];
        state.peers.forEach(function (p, id) { peersList.push({ id: id, name: p.name, color: p.color }); });
        broadcastFromHub({ type: 'peers', peers: peersList });
      });
      conn.on('error', function () {});
    });

    state._ttlInterval = setInterval(function () {
      var STALE_MS = 5000;
      var now = Date.now();
      var changed = false;
      state.cursors.forEach(function (c, id) {
        if (now - c.t > STALE_MS) { state.cursors.delete(id); changed = true; }
      });
      if (changed) {
        var cursorsList = [];
        state.cursors.forEach(function (c, id) { cursorsList.push({ id: id, x: c.x, y: c.y }); });
        broadcastFromHub({ type: 'cursors', cursors: cursorsList });
        emitCursors();
      }
    }, 3000);
  }

  function becomeViewer() {
    state.isHub = false;
    state.selfId = state.peer.id;
    state.peers.set(state.selfId, { name: state.selfName, color: state.selfColor });
    emit('onSelf', { id: state.selfId, name: state.selfName, color: state.selfColor });

    var conn = state.peer.connect(HUB_ID, { reliable: true });
    state.hubConn = conn;

    var welcomeOk = false;
    var welcomeTimer = setTimeout(function () {
      if (welcomeOk) return;
      try { conn.close(); } catch (e) {}
      retryInit();
    }, 4500);

    conn.on('open', function () {
      state.ready = true;
      try { conn.send(JSON.stringify({ type: 'hello', name: state.selfName, color: state.selfColor })); } catch (e) {}
      var _bye = function () { try { conn.send(JSON.stringify({ type: 'bye' })); } catch (e) {} };
      window.addEventListener('beforeunload', _bye);
      conn._bye = _bye;
    });
    conn.on('data', function (raw) {
      if (!welcomeOk) {
        try {
          var m = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (m && m.type === 'welcome') { welcomeOk = true; clearTimeout(welcomeTimer); }
        } catch (e) {}
      }
      onViewerData(raw);
    });
    conn.on('close', function () {
      clearTimeout(welcomeTimer);
      if (conn._bye) { window.removeEventListener('beforeunload', conn._bye); conn._bye = null; }
      state.ready = false;
      setTimeout(function () { retryInit(); }, 1200);
    });
    conn.on('error', function () {
      if (welcomeOk) return;
      clearTimeout(welcomeTimer);
      try { conn.close(); } catch (e) {}
      setTimeout(function () { retryInit(); }, 800);
    });
  }

  function retryInit() {
    if (state.disabled) return;
    if (state._ttlInterval) { clearInterval(state._ttlInterval); state._ttlInterval = null; }
    try { if (state.peer) state.peer.destroy(); } catch (e) {}
    state.peer = null;
    state.viewerConns.clear();
    state.peers.clear();
    state.cursors.clear();
    state.hubConn = null;
    _connect();
  }

  function _connect() {
    if (!window.Peer) {
      console.warn('SCPSession: PeerJS не загружен — cursors отключены.');
      return;
    }
    var attemptHub = new Peer(HUB_ID, { debug: 0 });
    state.peer = attemptHub;
    var resolved = false;
    attemptHub.on('open', function (id) {
      if (resolved) return;
      resolved = true;
      if (id === HUB_ID) becomeHub();
    });
    attemptHub.on('error', function (err) {
      if (resolved) return;
      resolved = true;
      try { attemptHub.destroy(); } catch (e) {}
      if (err && err.type === 'unavailable-id') {
        var viewer = new Peer({ debug: 0 });
        state.peer = viewer;
        viewer.on('open', function () { becomeViewer(); });
        viewer.on('error', function (e2) {
          if (e2 && (e2.type === 'peer-unavailable' || /Could not connect to peer/i.test(String(e2.message || '')))) {
            setTimeout(function () { retryInit(); }, 400);
            return;
          }
          console.warn('SCPSession viewer error', e2);
        });
      } else {
        console.warn('SCPSession hub error', err);
      }
    });
  }

  function init(opts) {
    if (state.peer) return;
    state.callbacks = Object.assign({}, state.callbacks, opts || {});
    state.selfName = pickName();
    state.selfColor = pickColor();
    _connect();
  }

  function disable() {
    state.disabled = true;
    try { if (state.peer) state.peer.destroy(); } catch (e) {}
  }

  var lastCursorSend = 0;
  function sendCursor(x, y) {
    if (!state.ready) return;
    var now = Date.now();
    if (now - lastCursorSend < 60) return; // ~16 Hz
    lastCursorSend = now;
    if (state.isHub) {
      state.cursors.set(state.selfId, { x: x, y: y, t: now });
      var cursorsList = [];
      state.cursors.forEach(function (c, id) { cursorsList.push({ id: id, x: c.x, y: c.y }); });
      broadcastFromHub({ type: 'cursors', cursors: cursorsList });
      emitCursors();
    } else if (state.hubConn && state.hubConn.open) {
      try { state.hubConn.send(JSON.stringify({ type: 'cursor', x: x, y: y })); } catch (e) {}
    }
  }

  window.SCPSession = {
    init: init,
    disable: disable,
    sendCursor: sendCursor,
    roomId: ROOM,
    get isReady() { return state.ready; },
    get selfId() { return state.selfId; },
    get selfName() { return state.selfName; },
    get selfColor() { return state.selfColor; },
  };
})();

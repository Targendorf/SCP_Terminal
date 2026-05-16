// SCPFirestore — единый источник истины для сессии. Документ /sessions/{sessionId}
// синхронизируется между всеми клиентами через onSnapshot. PeerJS остаётся
// только для cursors (high-frequency presence) — sync game-state идёт сюда.
(function () {
  var firebaseConfig = {
    apiKey: "AIzaSyDdFANMk-LzhnQDjy-ovsYG0mi3fHYQJu0",
    authDomain: "scp-terminal-5eab5.firebaseapp.com",
    projectId: "scp-terminal-5eab5",
    storageBucket: "scp-terminal-5eab5.firebasestorage.app",
    messagingSenderId: "477535203677",
    appId: "1:477535203677:web:4160086a19e5a93f0c78b4"
  };

  // Init
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  } catch (e) {
    console.error('Firebase init failed', e);
  }
  var db = firebase.firestore();

  // === sessionId — та же логика, что раньше использовалась для HOST_ID ===
  function hashStr(s) {
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }
  function normalizePath(p) {
    var n = (p || '/').replace(/\/index\.html?$/i, '/').replace(/\/+/g, '/');
    if (n.length > 1 && n.charAt(n.length - 1) === '/') n = n.slice(0, -1);
    return n || '/';
  }
  var _sessionId = null;
  function getSessionId() {
    if (_sessionId) return _sessionId;
    var key;
    try {
      var url = new URL(location.href);
      key = url.searchParams.get('room') || (location.host + normalizePath(location.pathname));
    } catch (e) {
      key = (location.host || '') + normalizePath(location.pathname || '/');
    }
    _sessionId = hashStr('scp-terminal-v1::' + key);
    return _sessionId;
  }

  // === peer-id — стабильный id клиента в localStorage ===
  var LS_PEER = 'scp_peer_id';
  var _peerId = null;
  function getMyPeerId() {
    if (_peerId) return _peerId;
    try {
      _peerId = localStorage.getItem(LS_PEER);
      if (!_peerId) {
        _peerId = 'p-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
        localStorage.setItem(LS_PEER, _peerId);
      }
    } catch (e) {
      _peerId = 'p-' + Math.random().toString(36).slice(2, 10);
    }
    return _peerId;
  }

  // === API ===
  function docRef(sessionId) {
    return db.collection('sessions').doc(sessionId);
  }

  function subscribeSession(sessionId, cb) {
    return docRef(sessionId).onSnapshot(function (snap) {
      try { cb(snap.exists ? snap.data() : null); } catch (e) { console.warn('subscribeSession cb error', e); }
    }, function (err) {
      console.warn('subscribeSession error', err);
    });
  }

  function serverTs() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  function updateSession(sessionId, patch) {
    var p = Object.assign({}, patch || {}, { updatedAt: serverTs() });
    // update поддерживает dot-notation (participants.<peerId>), но падает
    // если документа ещё нет. Fallback на set(merge:true) с конвертацией
    // dot-keys в nested object — переживает race с bootstrap.
    return docRef(sessionId).update(p).catch(function (err) {
      if (err && (err.code === 'not-found' || err.code === 5)) {
        var nested = {};
        Object.keys(p).forEach(function (key) {
          if (key.indexOf('.') > 0) {
            var parts = key.split('.');
            var cur = nested;
            for (var i = 0; i < parts.length - 1; i++) {
              if (!cur[parts[i]]) cur[parts[i]] = {};
              cur = cur[parts[i]];
            }
            cur[parts[parts.length - 1]] = p[key];
          } else {
            nested[key] = p[key];
          }
        });
        return docRef(sessionId).set(nested, { merge: true }).catch(function (err2) {
          console.warn('updateSession fallback set failed', err2);
        });
      }
      console.warn('updateSession failed', err);
    });
  }

  function setSession(sessionId, fullData) {
    var p = Object.assign({}, fullData || {}, { updatedAt: serverTs() });
    return docRef(sessionId).set(p);
  }

  function bootstrapIfMissing(sessionId, seedFn) {
    var ref = docRef(sessionId);
    return db.runTransaction(function (tx) {
      return tx.get(ref).then(function (doc) {
        if (doc.exists) return false;
        var seed = seedFn();
        seed.updatedAt = serverTs();
        tx.set(ref, seed);
        return true;
      });
    }).catch(function (err) {
      console.warn('bootstrapIfMissing failed', err);
      return false;
    });
  }

  function claimControl(sessionId, peerId) {
    return updateSession(sessionId, { controlOwner: peerId });
  }

  // Heartbeat: каждый клиент держит свою запись в participants
  function upsertParticipant(sessionId, peerId, info) {
    var patch = {};
    patch['participants.' + peerId] = {
      name: info.name || '',
      color: info.color || '#fff',
      lastSeen: Date.now(),
    };
    return updateSession(sessionId, patch);
  }

  function deleteField() {
    return firebase.firestore.FieldValue.delete();
  }

  window.SCPFirestore = {
    getSessionId: getSessionId,
    getMyPeerId: getMyPeerId,
    subscribeSession: subscribeSession,
    updateSession: updateSession,
    setSession: setSession,
    bootstrapIfMissing: bootstrapIfMissing,
    claimControl: claimControl,
    upsertParticipant: upsertParticipant,
    deleteField: deleteField,
    serverTs: serverTs,
  };
})();

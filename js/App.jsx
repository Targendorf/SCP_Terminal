// Корневое приложение. Game state — Firestore (через SCPFirestore).
// PeerJS остаётся только для cursors (см. session.js).
const { useState: _useState, useEffect: _useEffect, useCallback: _useCallback, useRef: _useRef, useMemo: _useMemo } = React;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "scanlines": 0.35,
  "glow": 1,
  "noise": 0.08,
  "vibration": 1,
  "sound": true,
  "color": "green"
}/*EDITMODE-END*/;

const LS_TWEAKS = 'scp_terminal_tweaks_v1';

function loadTweaks() {
  try {
    const raw = localStorage.getItem(LS_TWEAKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      delete parsed.hum;
      return { ...DEFAULT_TWEAKS, ...parsed };
    }
  } catch (e) {}
  return { ...DEFAULT_TWEAKS };
}

// Админ-маршрут: ?admin=1 — открывает AdminPanel напрямую.
// В новой архитектуре админ ТАКЖЕ подключён к Firestore (правки идут туда же,
// что и у хоста); просто UI у него другой и поверх — без боевого терминала.
const IS_ADMIN_ROUTE = new URLSearchParams(location.search).get('admin') === '1';
const IS_ADMIN_OPEN  = IS_ADMIN_ROUTE;

// === Firestore-хук: подписка на /sessions/{sessionId} + optimistic overlay ===
// Optimistic: top-level patch'и применяются локально мгновенно (без ожидания
// Firestore round-trip ~500мс-2с). Очищается на каждый новый snapshot — мы
// предполагаем, что снапшот уже содержит наш patch. Dot-notation поля
// (например 'hackGame.open') в optimistic не входят — они для редких операций
// типа запуска хака, где задержка норм.
function useFirestoreSession() {
  const sessionId = _useMemo(() => SCPFirestore.getSessionId(), []);
  const myPeerId  = _useMemo(() => SCPFirestore.getMyPeerId(), []);
  const [rawData, setRawData] = _useState(null);
  const [loading, setLoading] = _useState(true);
  const [optimistic, setOptimistic] = _useState({});

  _useEffect(() => {
    let active = true;
    let unsub = null;
    (async () => {
      try {
        await SCPFirestore.bootstrapIfMissing(sessionId, () => {
          const seed = JSON.parse(JSON.stringify(window.SCP_SEED || {}));
          return {
            ...seed,
            controlOwner: myPeerId,
            stage: 'boot',
            currentTermId: null,
            nav: null,
            hackGame: null,
            participants: {},
            lastForceReload: 0,
          };
        });
      } catch (e) { console.warn('bootstrap error', e); }
      if (!active) return;
      unsub = SCPFirestore.subscribeSession(sessionId, (d) => {
        setRawData(d);
        setLoading(false);
        // Свежий snapshot пришёл — очищаем optimistic overlay.
        setOptimistic({});
      });
    })();
    return () => { active = false; if (unsub) unsub(); };
  }, [sessionId, myPeerId]);

  const data = _useMemo(() => {
    if (!rawData) return null;
    if (Object.keys(optimistic).length === 0) return rawData;
    return Object.assign({}, rawData, optimistic);
  }, [rawData, optimistic]);

  const update = _useCallback((patch) => {
    // Optimistic: top-level поля сразу применяем в локальный overlay.
    const flat = {};
    Object.keys(patch || {}).forEach(k => {
      if (k.indexOf('.') < 0) flat[k] = patch[k];
    });
    if (Object.keys(flat).length) {
      setOptimistic(prev => Object.assign({}, prev, flat));
    }
    return SCPFirestore.updateSession(sessionId, patch);
  }, [sessionId]);

  const claim = _useCallback(() => {
    return SCPFirestore.claimControl(sessionId, myPeerId);
  }, [sessionId, myPeerId]);

  const isHost = !!(data && data.controlOwner === myPeerId);

  return { data, loading, update, claim, isHost, myPeerId, sessionId };
}

function App() {
  // Firestore session
  const { data, loading, update, claim, isHost, myPeerId, sessionId } = useFirestoreSession();

  // Локальный UI (твики, edit mode, lock-counter, preview из админки)
  const [tweaks, setTweaksRaw] = _useState(loadTweaks);
  const [editMode, setEditMode] = _useState(false);
  const [lockInfo, setLockInfo] = _useState({ fails: 0, until: 0 });
  const [previewFromAdmin, setPreviewFromAdmin] = _useState(null);
  const [previewTermObj, setPreviewTermObj] = _useState(null);

  // Локальное состояние админ-входа (?admin=1 route)
  const [adminStage, setAdminStage] = _useState(IS_ADMIN_OPEN ? 'admin' : (IS_ADMIN_ROUTE ? 'adminLogin' : null));

  // PeerJS-состояние (cursors only)
  const [cursors, setCursors] = _useState([]);
  const [peers, setPeers] = _useState([]);
  const [peerSelf, setPeerSelf] = _useState(null);

  const setTweaks = (patch) => {
    setTweaksRaw(t => {
      const next = { ...t, ...patch };
      try { localStorage.setItem(LS_TWEAKS, JSON.stringify(next)); } catch (e) {}
      try { window.parent.postMessage({type: '__edit_mode_set_keys', edits: patch}, '*'); } catch (e) {}
      return next;
    });
  };

  // CSS-переменные + звук
  _useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--scanline-intensity', String(tweaks.scanlines));
    r.setProperty('--glow-intensity', String(tweaks.glow));
    r.setProperty('--noise-intensity', String(tweaks.noise));
    r.setProperty('--vibration-intensity', String(Math.max(0.01, tweaks.vibration)));

    const palettes = {
      green: { phosphor: '#33ff66', dim: '#1fa040', bright: '#b5ffcb' },
      amber: { phosphor: '#ffb000', dim: '#aa7500', bright: '#ffd880' },
      white: { phosphor: '#dfe6e0', dim: '#8a968c', bright: '#ffffff' },
    };
    const p = palettes[tweaks.color] || palettes.green;
    r.setProperty('--phosphor', p.phosphor);
    r.setProperty('--phosphor-dim', p.dim);
    r.setProperty('--phosphor-bright', p.bright);

    SCPAudio.setEnabled(tweaks.sound);
  }, [tweaks]);

  // Edit mode handshake
  _useEffect(() => {
    const handler = (e) => {
      if (!e.data || typeof e.data !== 'object') return;
      if (e.data.type === '__activate_edit_mode') setEditMode(true);
      else if (e.data.type === '__deactivate_edit_mode') setEditMode(false);
    };
    window.addEventListener('message', handler);
    try { window.parent.postMessage({type: '__edit_mode_available'}, '*'); } catch (e) {}
    return () => window.removeEventListener('message', handler);
  }, []);

  // === SESSION INIT (PeerJS только для cursors) ===
  _useEffect(() => {
    if (IS_ADMIN_ROUTE) { SCPSession.disable(); return; }
    SCPSession.init({
      onCursors: (list) => setCursors(list),
      onPeers:   (list) => setPeers(list),
      onSelf:    (s)    => setPeerSelf(s),
    });
  }, []);

  // === Регистрация себя в participants + heartbeat + cleanup при закрытии ===
  _useEffect(() => {
    if (IS_ADMIN_ROUTE) return;
    if (!data) return; // ждём первый snapshot
    const name = peerSelf && peerSelf.name ? peerSelf.name : 'NODE-???';
    const color = peerSelf && peerSelf.color ? peerSelf.color : '#88ffcc';
    SCPFirestore.upsertParticipant(sessionId, myPeerId, { name, color });
    const id = setInterval(() => {
      SCPFirestore.upsertParticipant(sessionId, myPeerId, { name, color });
    }, 30000);
    // При закрытии вкладки удаляем себя из participants — иначе доку обрастает мусором
    const onBeforeUnload = () => {
      try {
        const patch = {};
        patch['participants.' + myPeerId] = SCPFirestore.deleteField();
        SCPFirestore.updateSession(sessionId, patch);
      } catch (e) {}
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      clearInterval(id);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [data && !!data.controlOwner, sessionId, myPeerId, peerSelf && peerSelf.name, peerSelf && peerSelf.color]);

  // === Трекинг курсора (PeerJS) ===
  _useEffect(() => {
    if (IS_ADMIN_ROUTE) return;
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      SCPSession.sendCursor(x, y);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // === Force-reload watcher: админ может запросить общий reload через Firestore ===
  const lastForceReloadRef = _useRef(null);
  _useEffect(() => {
    if (!data) return;
    if (lastForceReloadRef.current === null) {
      lastForceReloadRef.current = data.lastForceReload || 0;
      return;
    }
    const cur = data.lastForceReload || 0;
    if (cur && cur !== lastForceReloadRef.current) {
      lastForceReloadRef.current = cur;
      if (!IS_ADMIN_ROUTE) {
        setTimeout(() => { try { window.location.reload(); } catch (e) {} }, 200);
      }
    }
  }, [data && data.lastForceReload]);

  // === Управление stage / nav / hackGame для хоста — обёртки над update() ===
  // Зритель, присоединившийся пока хост ещё в boot, не должен застревать на BootScreen
  // (его onDone ничего не сделает у не-хоста). Сразу показываем 'login' как ожидание.
  const _stageRaw = (IS_ADMIN_ROUTE && adminStage) ? adminStage : (data ? (data.stage || 'boot') : 'boot');
  const isHostFlag = !!(data && data.controlOwner && data.controlOwner === SCPFirestore.getMyPeerId());
  const stage = (_stageRaw === 'boot' && !isHostFlag && !IS_ADMIN_ROUTE) ? 'login' : _stageRaw;
  const currentTermId = data ? (data.currentTermId || null) : null;
  const nav = data ? (data.nav || null) : null;
  const hackGame = data ? (data.hackGame || null) : null;
  const isViewer = !!(data && !isHost && !IS_ADMIN_ROUTE);

  const setStage = (s) => {
    if (IS_ADMIN_ROUTE) { setAdminStage(s); return; }
    if (!isHost) return;
    update({ stage: s });
  };
  const setCurrentTermId = (id) => { if (isHost) update({ currentTermId: id }); };
  const setNav = (n) => { if (isHost) update({ nav: n }); };

  // currentTerm с учётом preview из админки
  const currentTerm = _useMemo(() => {
    if (previewTermObj) return previewTermObj;
    if (!currentTermId) return null;
    const list = (data && data.terminals) || [];
    return list.find(x => x.id === currentTermId) || null;
  }, [previewTermObj, currentTermId, data && data.terminals]);

  // === Обработчики UI ===
  const handleLogin = (term) => {
    if (!isHost) return;
    update({
      stage: 'terminal',
      currentTermId: term.id,
      nav: { view: 'folders', folderIdx: 0, fileIdx: 0 },
    });
    setLockInfo({ fails: 0, until: 0 });
  };
  const handleMasterUnlock = () => {
    if (IS_ADMIN_ROUTE) { setAdminStage('admin'); }
    else if (isHost) { update({ stage: 'admin' }); }
    setLockInfo({ fails: 0, until: 0 });
  };
  const exitTerminal = () => {
    if (!isHost) return;
    update({ stage: 'login', currentTermId: null });
  };
  const exitAdmin = () => {
    if (previewFromAdmin) {
      setPreviewFromAdmin(null);
      setPreviewTermObj(null);
      if (IS_ADMIN_ROUTE) setAdminStage('admin');
      else if (isHost) update({ stage: 'admin' });
      return;
    }
    if (IS_ADMIN_ROUTE) { setAdminStage('adminLogin'); return; }
    if (isHost) update({ stage: 'login' });
  };
  const previewTerm = (t) => {
    setPreviewTermObj(t); setPreviewFromAdmin(t);
    if (IS_ADMIN_ROUTE) setAdminStage('terminal');
    else if (isHost) update({ stage: 'terminal' });
  };

  // === Hack callbacks (только хост, пишут в Firestore) ===
  // Все апдейты через dot-notation — иначе spread из stale-closure `hackGame`
  // перетрёт другие поля (например, open:true пропадал у зрителя через 100мс
  // после старта из-за onSnapshot debounce → у зрителя модалка моргала и закрывалась).
  // puzzleType генерим заранее в onOpen и кладём в Firestore — и хост, и зритель
  // используют один и тот же тип паззла (раньше каждый выбирал random независимо).
  const HACK_PUZZLE_TYPES = ['wordsearch', 'sequence', 'cipher', 'memory', 'pipe', 'typer'];
  const hackHostCallbacks = isHost ? {
    onOpen: () => {
      const admin = data && data.hackPuzzleType;
      const pt = (admin && admin !== 'random' && HACK_PUZZLE_TYPES.indexOf(admin) >= 0)
        ? admin
        : HACK_PUZZLE_TYPES[Math.floor(Math.random() * HACK_PUZZLE_TYPES.length)];
      update({
        'hackGame.open': true,
        'hackGame.done': false,
        'hackGame.reward': null,
        'hackGame.puzzleType': pt,
      });
    },
    onClose: () => update({
      'hackGame.open': false,
      'hackGame.done': false,
      'hackGame.reward': null,
      'hackGame.puzzleType': null,
    }),
    onDone: (reward) => update({
      'hackGame.done': true,
      'hackGame.reward': reward || null,
    }),
    // puzzleType уже set заранее, прогресс паззла не синкаем — Firestore writes были бы дороги.
    onSnapshot: () => {},
  } : null;

  const hackViewState = (!isHost && hackGame) ? {
    open: !!hackGame.open,
    done: !!hackGame.done,
    reward: hackGame.reward || null,
    puzzleType: hackGame.puzzleType || null,
    snapshot: null, // высокочастотный snapshot не синкаем — pragmatic compromise
  } : null;

  // === Render ===
  // Загрузочный экран пока ждём первый snapshot Firestore
  if (!data && !IS_ADMIN_ROUTE) {
    return (
      <div className="crt-screen">
        <div className="crt-bloom"></div>
        <div className="crt-roll"></div>
        <div className="crt-noise"></div>
        <div className="crt-scanlines"></div>
        <div className="crt-content">
          <div className="col" style={{height: '100%', justifyContent: 'center', alignItems: 'center'}}>
            <div className="mono t-dim">СОЕДИНЕНИЕ С СЕРВЕРОМ...</div>
          </div>
        </div>
      </div>
    );
  }

  // Для AdminPanel и PasswordScreen state-форма должна быть совместима со старым кодом
  const stateView = data || (window.SCP_SEED || {});
  // Для HackGame (внутри PasswordScreen) нужно, чтобы хост использовал ТОТ ЖЕ puzzleType,
  // что и зритель. HackGame.jsx читает state.hackPuzzleType через pickHackPuzzle. Подменяем
  // его на hackGame.puzzleType (он был выставлен в Firestore в hackHostCallbacks.onOpen
  // ровно один раз). Иначе хост и зритель выбирают random независимо.
  const stateForPwScreen = _useMemo(() => {
    if (!data) return stateView;
    const pt = (data.hackGame && data.hackGame.puzzleType) || data.hackPuzzleType;
    if (pt === data.hackPuzzleType) return data;
    return Object.assign({}, data, { hackPuzzleType: pt });
  }, [data, data && data.hackGame && data.hackGame.puzzleType]);
  // setState-совместимая обёртка для AdminPanel: принимает либо patch-объект,
  // либо updater(prev). Чтобы не затирать participants/controlOwner/updatedAt,
  // которые могли быть обновлены другими клиентами с момента последнего snapshot,
  // отправляем в Firestore только те top-level поля, чьи ссылки реально изменились.
  const SAFE_FIELDS = ['terminals', 'masterPassword', 'virusDiskReady', 'hackTargetTerminalId', 'hackPuzzleType', 'meta', 'staff', 'stage', 'currentTermId', 'nav', 'hackGame', 'lastForceReload', 'version'];
  const setStateForAdmin = (next) => {
    let result;
    if (typeof next === 'function') {
      result = next(stateView);
    } else {
      result = next;
    }
    if (!result) return;
    const patch = {};
    if (typeof next === 'function') {
      // Updater вернул "следующий полный state" — сравниваем по ссылкам.
      SAFE_FIELDS.forEach(k => {
        if (k in result && result[k] !== stateView[k]) patch[k] = result[k];
      });
    } else {
      // Это уже частичный patch.
      Object.keys(result).forEach(k => {
        if (k === 'updatedAt' || k === 'controlOwner' || k === 'participants') return;
        patch[k] = result[k];
      });
    }
    if (Object.keys(patch).length === 0) return;
    update(patch);
  };

  return (
    <>
      <div className="crt-screen">
        <div className="crt-bloom"></div>
        <div className="crt-roll"></div>
        <div className="crt-noise"></div>
        <div className="crt-rgb-split"></div>
        <div className="crt-scanlines"></div>

        <div className="crt-content">
          {stage === 'boot' && <BootScreen onDone={() => { if (isHost) update({ stage: 'login' }); }} />}

          {stage === 'adminLogin' && (
            <AdminLoginScreen
              state={stateView}
              onMasterUnlock={handleMasterUnlock}
            />
          )}

          {stage === 'login' && (
            <PasswordScreen
              state={stateForPwScreen}
              onLogin={handleLogin}
              onMasterUnlock={handleMasterUnlock}
              lockInfo={lockInfo}
              setLockInfo={setLockInfo}
              canInput={isHost}
              hackHostCallbacks={hackHostCallbacks}
              hackViewState={hackViewState}
            />
          )}

          {stage === 'terminal' && currentTerm && (
            <TerminalBrowser
              terminal={currentTerm}
              state={stateView}
              onExit={previewFromAdmin ? () => { setPreviewTermObj(null); setPreviewFromAdmin(null); if (IS_ADMIN_ROUTE) setAdminStage('admin'); else if (isHost) update({ stage: 'admin' }); } : exitTerminal}
              readOnly={!isHost}
              syncNav={!isHost ? nav : null}
              onNav={isHost ? ((n) => update({ nav: n })) : null}
            />
          )}
        </div>

        {!IS_ADMIN_ROUTE && <CursorOverlay cursors={cursors} />}
      </div>

      {stage === 'admin' && (
        <AdminPanel
          state={stateView}
          setState={setStateForAdmin}
          onExit={exitAdmin}
          onPreview={previewTerm}
        />
      )}

      {!IS_ADMIN_ROUTE && isHost && (
        <ControlTransferBtn
          participants={(data && data.participants) || {}}
          myPeerId={myPeerId}
          onTransfer={(targetId) => update({ controlOwner: targetId })}
        />
      )}

      {!IS_ADMIN_ROUTE && (
        <SessionBadge
          isHost={isHost}
          isViewer={isViewer}
          participants={(data && data.participants) || {}}
          peerSelf={peerSelf}
        />
      )}

      {!IS_ADMIN_ROUTE && !isHost && data && (
        <ClaimControlBtn onClaim={claim} />
      )}

      {<TweaksPanel tweaks={tweaks} setTweaks={setTweaks} />}
    </>
  );
}

// === Оверлей курсоров других пиров ===
function CursorOverlay({ cursors }) {
  if (!cursors || !cursors.length) return null;
  return (
    <div className="cursor-overlay">
      {cursors.map(c => (
        <div
          key={c.id}
          className="peer-cursor"
          style={{ left: (c.x * 100) + '%', top: (c.y * 100) + '%', color: c.color }}
        >
          <svg width="18" height="22" viewBox="0 0 18 22" style={{filter: 'drop-shadow(0 0 3px ' + c.color + ')'}}>
            <path d="M1 1 L1 17 L6 12 L9 20 L12 19 L9 11 L16 11 Z" fill={c.color} stroke="#000" strokeWidth="1" />
          </svg>
          <span className="peer-label" style={{background: c.color, color: '#000'}}>{c.name}</span>
        </div>
      ))}
    </div>
  );
}

// === Кнопка передачи контроля — список из participants Firestore ===
function ControlTransferBtn({ participants, myPeerId, onTransfer }) {
  const [open, setOpen] = _useState(false);
  const wrapRef = _useRef(null);

  _useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Активные participants — lastSeen свежее 60с, кроме нас самих
  const now = Date.now();
  const others = Object.keys(participants || {})
    .filter(id => id !== myPeerId)
    .map(id => ({ id, ...(participants[id] || {}) }))
    .filter(p => (now - (p.lastSeen || 0)) < 60000);

  if (others.length === 0) return null;

  const transfer = (id) => {
    setOpen(false);
    onTransfer(id);
  };

  return (
    <div className="control-transfer-wrap" ref={wrapRef}>
      <button className="control-transfer-btn" onClick={() => setOpen(o => !o)}>
        { '⇄ ПЕРЕДАТЬ КОНТРОЛЬ' }
      </button>
      {open && (
        <div className="control-transfer-dropdown">
          <div className="mono t-dim" style={{fontSize: 11, padding: '4px 8px', borderBottom: '1px solid var(--phosphor-dim)'}}>
            { 'Выберите нового хоста:' }
          </div>
          {others.map(v => (
            <button key={v.id} className="control-transfer-item" onClick={() => transfer(v.id)}
              style={{color: v.color || '#fff'}}>
              {v.name || v.id.slice(0, 10)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// === Кнопка для зрителей: "забрать контроль" (на случай если хост ушёл/завис) ===
function ClaimControlBtn({ onClaim }) {
  return (
    <button className="control-transfer-btn"
      style={{position: 'fixed', bottom: 12, left: 12, zIndex: 10000, opacity: 0.7}}
      onClick={onClaim}
      title="Стать ведущим сессии">
      {'⇪ ВЗЯТЬ КОНТРОЛЬ'}
    </button>
  );
}

// === Индикатор роли в сессии ===
function SessionBadge({ isHost, isViewer, participants, peerSelf }) {
  const now = Date.now();
  const activeCount = Object.keys(participants || {})
    .filter(id => (now - ((participants[id] || {}).lastSeen || 0)) < 60000).length;

  let text = '';
  let cls = '';
  if (isHost) { text = 'КОНТРОЛЬ · ' + activeCount + ' уз'; cls = 'session-host'; }
  else if (isViewer) { text = 'ЗРИТЕЛЬ · ' + activeCount + ' уз'; cls = 'session-viewer'; }
  else { text = 'ПОДКЛЮЧЕНИЕ...'; cls = 'session-init'; }

  const self = peerSelf && peerSelf.name ? (' [' + peerSelf.name + ']') : '';
  const room = SCPSession.roomId ? (' · room ' + String(SCPSession.roomId).slice(-5)) : '';
  return <div className={'session-badge ' + cls}>{text}{self}{room}</div>;
}

// === Экран входа админа (отдельный маршрут ?admin=1) ===
function AdminLoginScreen({ state, onMasterUnlock }) {
  const [pw, setPw] = React.useState('');
  const [err, setErr] = React.useState(null);
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.focus(); }, []);

  const submit = (e) => {
    e.preventDefault();
    if ((pw || '').toLowerCase() === (state.masterPassword || '').toLowerCase() && pw) {
      SCPAudio.granted();
      SCPStorage.appendLog({ type: 'admin-bypass', password: '[MASTER]', ok: true });
      setTimeout(() => onMasterUnlock(), 300);
    } else {
      SCPAudio.denied();
      SCPStorage.appendLog({ type: 'admin-bypass', password: pw, ok: false });
      setErr('ОТКАЗАНО');
      setPw('');
    }
  };

  return (
    <div className="col" style={{height: '100%', justifyContent: 'center', alignItems: 'center', gap: '1.2em'}}>
      <pre className="ascii-title t-amber" style={{textAlign: 'center'}}>{`
 ╔════════════════════════════════════════╗
 ║    ADMINISTRATOR · СЛУЖЕБНЫЙ ВХОД     ║
 ╚════════════════════════════════════════╝
`}</pre>
      <div className="mono t-dim" style={{textAlign: 'center'}}>
        { '> Служебный вход. Изменения админа уходят в общую сессию.\n> Введите мастер-пароль.' }
      </div>
      <form onSubmit={submit} className="input-line" style={{width: 'min(420px, 90vw)'}}>
        <span className="t-amber">MASTER:</span>
        <input
          ref={ref}
          type="password"
          autoComplete="off"
          spellCheck="false"
          value={pw}
          onChange={e => { setPw(e.target.value); if (e.target.value) SCPAudio.key(); }}
          placeholder="мастер-пароль"
        />
        <span className="caret"></span>
      </form>
      {err && <div className="mono t-red">{'>> ' + err + ' <<'}</div>}
      <div className="mono t-dim" style={{fontSize: 12, textAlign: 'center'}}>
        { 'Чтобы вернуться к общему терминалу — уберите ?admin=1 из адреса.' }
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

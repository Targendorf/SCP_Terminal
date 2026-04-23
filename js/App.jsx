// Корневое приложение
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
      delete parsed.hum; // устарелое поле
      return { ...DEFAULT_TWEAKS, ...parsed };
    }
  } catch (e) {}
  return { ...DEFAULT_TWEAKS };
}

// Админ-маршрут: ?admin=1 — минует мультиплеер и открывает AdminPanel напрямую.
const IS_ADMIN_ROUTE = new URLSearchParams(location.search).get('admin') === '1';
const IS_ADMIN_OPEN  = IS_ADMIN_ROUTE; // всегда открываем без пароля

function App() {
  // stage: boot | login | terminal | admin | adminLogin
  const [stage, setStage] = _useState(IS_ADMIN_OPEN ? 'admin' : IS_ADMIN_ROUTE ? 'adminLogin' : 'boot');
  const [state, setState] = useStore();
  const [currentTerm, setCurrentTerm] = _useState(null);
  const [tweaks, setTweaksRaw] = _useState(loadTweaks);
  const [editMode, setEditMode] = _useState(false);
  const [lockInfo, setLockInfo] = _useState({ fails: 0, until: 0 });
  const [previewFromAdmin, setPreviewFromAdmin] = _useState(null);

  // Session (мультиплеер) — не инициализируется в админ-режиме
  const [sessionRole, setSessionRole] = _useState('init'); // 'init' | 'host' | 'viewer' | 'offline'
  const [sessionStatus, setSessionStatus] = _useState('init');
  const [peers, setPeers] = _useState([]);
  const [cursors, setCursors] = _useState([]);
  const [remoteNav, setRemoteNav] = _useState(null); // зритель: nav от хоста

  // Hack game state — synced between host and viewers
  const [hackOpen, setHackOpen] = _useState(false);
  const [hackDone, setHackDone] = _useState(false);
  const [hackReward, setHackReward] = _useState(null);
  const [hackPuzzleType, setHackPuzzleType] = _useState(null);
  const [hackSnapshot, setHackSnapshot] = _useState(null);
  const [pwInput, setPwInput] = _useState('');

  // Поля из game-state, которые нужны зрителям (транслируются отдельно от localStorage)
  const [sharedVirusDisk, setSharedVirusDisk] = _useState(false);
  const [sharedHackTargetId, setSharedHackTargetId] = _useState(null);

  const setTweaks = (patch) => {
    setTweaksRaw(t => {
      const next = { ...t, ...patch };
      try { localStorage.setItem(LS_TWEAKS, JSON.stringify(next)); } catch (e) {}
      try { window.parent.postMessage({type: '__edit_mode_set_keys', edits: patch}, '*'); } catch (e) {}
      return next;
    });
  };

  // Применение CSS-переменных + звук
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

  const stateRef = _useRef(state);
  _useEffect(() => { stateRef.current = state; }, [state]);

  // === BROADCAST CHANNEL — принудительная перезагрузка от админки ===
  _useEffect(() => {
    if (IS_ADMIN_ROUTE) return;
    let bc;
    try {
      bc = new BroadcastChannel('scp_admin');
      bc.onmessage = (e) => {
        if (e.data && e.data.type === 'force_reload') {
          // sessionStorage уже хранит роль (host/viewer) — при перезагрузке восстановится
          window.location.reload();
        }
      };
    } catch (e) {}
    return () => { try { if (bc) bc.close(); } catch (e) {} };
  }, []);

  // === SESSION INIT ===
  _useEffect(() => {
    if (IS_ADMIN_ROUTE) { SCPSession.disable(); setSessionRole('offline'); setSessionStatus('admin'); return; }
    SCPSession.init({
      onRole: (role) => setSessionRole(role),
      onStatus: (s) => setSessionStatus(s),
      onPeers: (list) => setPeers(list),
      onCursors: (list) => setCursors(list),
      onState: (shared) => {
        if (!shared) return;
        if (shared.stage) setStage(shared.stage);
        if (shared.currentTermId) {
          const t = (stateRef.current.terminals || []).find(x => x.id === shared.currentTermId);
          if (t) setCurrentTerm(t);
        } else if (shared.currentTermId === null) {
          setCurrentTerm(null);
        }
        if (shared.nav) setRemoteNav(shared.nav);
        if (shared.pwInput          !== undefined) setPwInput(shared.pwInput);
        if (shared.hackOpen         !== undefined) setHackOpen(shared.hackOpen);
        if (shared.hackDone         !== undefined) setHackDone(shared.hackDone);
        if (shared.hackReward       !== undefined) setHackReward(shared.hackReward);
        if (shared.hackPuzzleType   !== undefined) setHackPuzzleType(shared.hackPuzzleType);
        if (shared.hackSnapshot     !== undefined) setHackSnapshot(shared.hackSnapshot);
        if (shared.virusDiskReady   !== undefined) setSharedVirusDisk(shared.virusDiskReady);
        if (shared.hackTargetTermId !== undefined) setSharedHackTargetId(shared.hackTargetTermId);
      },
    });
  }, []);

  const isHost = sessionRole === 'host' || sessionRole === 'offline';
  const isViewer = sessionRole === 'viewer';

  // Зрители получают virusDiskReady/hackTargetTerminalId через broadcast, а не из localStorage
  const effectiveState = _useMemo(() => {
    if (!isViewer) return state;
    return {
      ...state,
      virusDiskReady: sharedVirusDisk,
      hackTargetTerminalId: sharedHackTargetId,
    };
  }, [state, isViewer, sharedVirusDisk, sharedHackTargetId]);

  // Хост бродкастит стейт
  _useEffect(() => {
    if (IS_ADMIN_ROUTE) return;
    if (sessionRole !== 'host') return;
    SCPSession.broadcastState({
      stage,
      currentTermId: currentTerm ? currentTerm.id : null,
      nav: remoteNav, // хост сам обновит nav через onNav
      hackOpen,
      hackDone,
      hackReward,
      hackPuzzleType,
      hackSnapshot,
      pwInput,
      virusDiskReady: state.virusDiskReady || false,
      hackTargetTermId: state.hackTargetTerminalId || null,
    });
  }, [sessionRole, stage, currentTerm && currentTerm.id, remoteNav && remoteNav.view, remoteNav && remoteNav.folderIdx, remoteNav && remoteNav.fileIdx, hackOpen, hackDone, hackReward, hackPuzzleType, hackSnapshot, pwInput, state.virusDiskReady, state.hackTargetTerminalId]);

  // Трекинг курсора
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

  const handleLogin = (term) => {
    setCurrentTerm(term);
    setStage('terminal');
    setRemoteNav({ view: 'folders', folderIdx: 0, fileIdx: 0 });
    setLockInfo({ fails: 0, until: 0 });
  };
  const handleMasterUnlock = () => {
    setStage('admin');
    setLockInfo({ fails: 0, until: 0 });
  };
  const exitTerminal = () => {
    setCurrentTerm(null);
    setStage('login');
  };
  const exitAdmin = () => {
    if (previewFromAdmin) { setPreviewFromAdmin(null); setStage('admin'); return; }
    if (IS_ADMIN_ROUTE) { setStage('adminLogin'); return; }
    setStage('login');
  };
  const previewTerm = (t) => { setCurrentTerm(t); setPreviewFromAdmin(t); setStage('terminal'); };
  const exitPreview = () => { setCurrentTerm(null); setPreviewFromAdmin(null); setStage('admin'); };

  const onHostNav = _useCallback((nav) => {
    setRemoteNav(nav);
  }, []);

  // Hack game callbacks — only called by host, update state to broadcast to viewers
  const hackHostCallbacks = (isHost && !isViewer) ? {
    onOpen: () => {
      setHackOpen(true);
      setHackDone(false);
      setHackReward(null);
      setHackSnapshot(null);
      setHackPuzzleType(null);
    },
    onClose: () => {
      setHackOpen(false);
    },
    onDone: (reward) => {
      setHackDone(true);
      setHackReward(reward);
    },
    onSnapshot: (snap) => {
      if (snap && snap.puzzleType) setHackPuzzleType(snap.puzzleType);
      setHackSnapshot(snap ? snap.puzzleState : null);
    },
  } : null;

  // Hack view state — passed to viewers to display host's hack game
  const hackViewState = isViewer ? {
    open: hackOpen,
    done: hackDone,
    reward: hackReward,
    puzzleType: hackPuzzleType,
    snapshot: hackSnapshot,
  } : null;

  return (
    <>
      <div className="crt-screen">
        <div className="crt-bloom"></div>
        <div className="crt-roll"></div>
        <div className="crt-noise"></div>
        <div className="crt-rgb-split"></div>
        <div className="crt-scanlines"></div>

        <div className="crt-content">
          {stage === 'boot' && <BootScreen onDone={() => setStage('login')} />}

          {stage === 'adminLogin' && (
            <AdminLoginScreen
              state={state}
              onMasterUnlock={handleMasterUnlock}
            />
          )}

          {stage === 'login' && (
            <PasswordScreen
              state={effectiveState}
              onLogin={handleLogin}
              onMasterUnlock={handleMasterUnlock}
              lockInfo={lockInfo}
              setLockInfo={setLockInfo}
              canInput={isHost && !isViewer}
              onPwChange={isHost && !isViewer ? setPwInput : null}
              syncPwInput={isViewer ? pwInput : null}
              hackHostCallbacks={hackHostCallbacks}
              hackViewState={hackViewState}
            />
          )}

          {stage === 'terminal' && currentTerm && (
            <TerminalBrowser
              terminal={currentTerm}
              state={state}
              onExit={previewFromAdmin ? exitPreview : exitTerminal}
              readOnly={isViewer}
              syncNav={isViewer ? remoteNav : null}
              onNav={!isViewer ? onHostNav : null}
            />
          )}
        </div>

        {/* Курсоры других пиров */}
        {!IS_ADMIN_ROUTE && <CursorOverlay cursors={cursors} />}
      </div>

      {stage === 'admin' && (
        <AdminPanel
          state={state}
          setState={setState}
          onExit={exitAdmin}
          onPreview={previewTerm}
        />
      )}

      {!IS_ADMIN_ROUTE && isHost && !isViewer && (
        <ControlTransferBtn peers={peers} selfId={SCPSession.selfId} />
      )}

      {!IS_ADMIN_ROUTE && <SessionBadge role={sessionRole} status={sessionStatus} peers={peers} />}

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

// === Кнопка передачи контроля ===
function ControlTransferBtn({ peers, selfId }) {
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

  // Only show viewers (exclude self)
  const viewers = (selfId ? peers.filter(p => p.id !== selfId) : []);
  if (viewers.length === 0) return null;

  const transfer = (id) => {
    setOpen(false);
    SCPSession.transferControl(id);
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
          {viewers.map(v => (
            <button key={v.id} className="control-transfer-item" onClick={() => transfer(v.id)}
              style={{color: v.color}}>
              {v.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// === Индикатор роли в сессии ===
function SessionBadge({ role, status, peers }) {
  let text = '';
  let cls = '';
  if (status === 'init' || status === 'connecting') { text = 'ПОДКЛЮЧЕНИЕ...'; cls = 'session-init'; }
  else if (role === 'host') { text = 'КОНТРОЛЬ · ' + (peers.length) + ' уз'; cls = 'session-host'; }
  else if (role === 'viewer') { text = 'ЗРИТЕЛЬ · ' + (peers.length) + ' уз'; cls = 'session-viewer'; }
  else if (status === 'offline') { text = 'OFFLINE'; cls = 'session-offline'; }
  else if (status === 'disconnected') { text = 'РАЗРЫВ'; cls = 'session-offline'; }
  else return null;

  const self = SCPSession.selfName ? (' [' + SCPSession.selfName + ']') : '';
  return <div className={'session-badge ' + cls}>{text}{self}</div>;
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
        { '> Служебный вход. Мультиплеер-сессия не активна.\n> Введите мастер-пароль.' }
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

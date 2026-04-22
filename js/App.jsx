// Корневое приложение
const { useState: _useState, useEffect: _useEffect, useCallback: _useCallback } = React;

const DEFAULT_TWEAKS = /*EDITMODE-BEGIN*/{
  "lang": "ru",
  "scanlines": 0.35,
  "glow": 1,
  "noise": 0.08,
  "vibration": 1,
  "sound": true,
  "hum": true,
  "color": "green"
}/*EDITMODE-END*/;

const LS_TWEAKS = 'scp_terminal_tweaks_v1';

function loadTweaks() {
  try {
    const raw = localStorage.getItem(LS_TWEAKS);
    if (raw) return { ...DEFAULT_TWEAKS, ...JSON.parse(raw) };
  } catch (e) {}
  return { ...DEFAULT_TWEAKS };
}

function App() {
  const [stage, setStage] = _useState('boot'); // boot | login | terminal | admin
  const [state, setState] = useStore();
  const [currentTerm, setCurrentTerm] = _useState(null);
  const [tweaks, setTweaksRaw] = _useState(loadTweaks);
  const [editMode, setEditMode] = _useState(false);
  const [lockInfo, setLockInfo] = _useState({ fails: 0, until: 0 });
  const [previewFromAdmin, setPreviewFromAdmin] = _useState(null);

  const setTweaks = (patch) => {
    setTweaksRaw(t => {
      const next = { ...t, ...patch };
      try { localStorage.setItem(LS_TWEAKS, JSON.stringify(next)); } catch (e) {}
      try { window.parent.postMessage({type: '__edit_mode_set_keys', edits: patch}, '*'); } catch (e) {}
      return next;
    });
  };

  // Применение CSS-переменных
  _useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--scanline-intensity', String(tweaks.scanlines));
    r.setProperty('--glow-intensity', String(tweaks.glow));
    r.setProperty('--noise-intensity', String(tweaks.noise));
    r.setProperty('--vibration-intensity', String(Math.max(0.01, tweaks.vibration)));

    // Смена цвета фосфора
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
    if (tweaks.sound && tweaks.hum) { SCPAudio.startHum(); } else { SCPAudio.stopHum(); }
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

  // Запуск аудио-контекста на первый клик
  _useEffect(() => {
    const unlock = () => {
      if (tweaks.sound && tweaks.hum) SCPAudio.startHum();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const handleLogin = (term) => {
    setCurrentTerm(term);
    setStage('terminal');
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
    if (previewFromAdmin) {
      setPreviewFromAdmin(null);
      setStage('admin');
      return;
    }
    setStage('login');
  };
  const previewTerm = (t) => {
    setCurrentTerm(t);
    setPreviewFromAdmin(t);
    setStage('terminal');
  };
  const exitPreview = () => {
    setCurrentTerm(null);
    setPreviewFromAdmin(null);
    setStage('admin');
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
          {stage === 'boot' && <BootScreen lang={tweaks.lang} onDone={() => setStage('login')} />}
          {stage === 'login' && (
            <PasswordScreen
              lang={tweaks.lang}
              state={state}
              onLogin={handleLogin}
              onMasterUnlock={handleMasterUnlock}
              lockInfo={lockInfo}
              setLockInfo={setLockInfo}
            />
          )}
          {stage === 'terminal' && currentTerm && (
            <TerminalBrowser
              lang={tweaks.lang}
              terminal={currentTerm}
              state={state}
              onExit={previewFromAdmin ? exitPreview : exitTerminal}
            />
          )}
        </div>
      </div>

      {stage === 'admin' && (
        <AdminPanel
          lang={tweaks.lang}
          state={state}
          setState={setState}
          onExit={exitAdmin}
          onPreview={previewTerm}
        />
      )}

      {<TweaksPanel tweaks={tweaks} setTweaks={setTweaks} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

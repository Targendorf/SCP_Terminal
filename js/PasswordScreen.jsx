// Экран ввода пароля
function PasswordScreen({
  state, onLogin, onMasterUnlock, lockInfo, setLockInfo, canInput = true,
  onPwChange, syncPwInput,
  hackHostCallbacks, hackViewState,
}) {
  const [pw, setPw] = useState('');
  const [checking, setChecking] = useState(false);
  const [msg, setMsg] = useState(null);
  const [hackOpen, setHackOpen] = useState(false);
  const [foundOpen, setFoundOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // блокировка после неудачных попыток
  const isLocked = lockInfo && lockInfo.until > Date.now();
  const [lockTick, setLockTick] = useState(0);
  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setLockTick(t => t + 1), 500);
    return () => clearInterval(id);
  }, [isLocked]);

  const submit = async (e) => {
    if (e) e.preventDefault();
    if (!canInput) return;
    if (checking || isLocked) return;
    if (!pw.trim()) return;
    setChecking(true);
    SCPAudio.beep(440, 0.05);

    // Симуляция медленной проверки
    const delay = 900 + Math.random() * 800;
    await new Promise(r => setTimeout(r, delay));

    const entered = pw.trim().toLowerCase();

    // Команда /hack [имя] — взлом конкретного терминала
    const hackRx = /^(?:\/hack|\/взлом)\s+(.+)$/i;
    const hackBare = /^(?:\/hack|\/взлом)$/i;
    if (hackBare.test(entered)) {
      setChecking(false);
      setPw('');
      if (onPwChange) onPwChange('');
      SCPAudio.denied();
      setMsg({ kind: 'err', text: 'УКАЖИТЕ ИМЯ ЦЕЛИ: ВИРУС-ДИСКЕТА [имя]' });
      return;
    }
    const hackMatch = hackRx.exec(entered);
    if (hackMatch) {
      setChecking(false);
      setPw('');
      if (onPwChange) onPwChange('');
      if (!state.virusDiskReady) {
        SCPAudio.denied();
        setMsg({ kind: 'err', text: 'ВИРУС-ДИСКЕТА НЕ ОБНАРУЖЕНА' });
        return;
      }
      const typedName = hackMatch[1].trim().toLowerCase();
      const hackTarget = state.hackTargetTerminalId
        ? (state.terminals || []).find(t => t.id === state.hackTargetTerminalId)
        : null;
      if (!hackTarget) {
        SCPAudio.denied();
        setMsg({ kind: 'err', text: 'ЦЕЛЬ ДЛЯ ВЗЛОМА НЕ НАСТРОЕНА' });
        return;
      }
      const targetName = (hackTarget.name || '').toLowerCase();
      if (typedName !== targetName) {
        SCPAudio.denied();
        setMsg({ kind: 'err', text: 'ЦЕЛЬ НЕ НАЙДЕНА' });
        return;
      }
      SCPAudio.granted();
      setMsg({ kind: 'master', text: 'ЗАПУСК ВИРУС-ДИСКЕТЫ...' });
      setTimeout(() => {
        setMsg(null);
        setHackOpen(true);
        if (hackHostCallbacks && hackHostCallbacks.onOpen) hackHostCallbacks.onOpen();
      }, 500);
      return;
    }

    const terminal = state.terminals.find(t => t.password.toLowerCase() === entered);
    const isMaster = entered === (state.masterPassword || '').toLowerCase();

    if (isMaster) {
      SCPStorage.appendLog({ type: 'master-unlock', password: '[MASTER]', ok: true });
      SCPAudio.granted();
      setMsg({ kind: 'master', text: 'АДМИНИСТРАТИВНЫЙ ДОСТУП' });
      setTimeout(() => onMasterUnlock(), 900);
      return;
    }

    if (terminal) {
      SCPStorage.appendLog({ type: 'login', terminal: terminal.id, password: entered, ok: true });
      SCPAudio.granted();
      setMsg({ kind: 'ok', text: 'ДОСТУП РАЗРЕШЁН // ' + terminal.name });
      setTimeout(() => onLogin(terminal), 900);
      return;
    }

    SCPStorage.appendLog({ type: 'login', password: entered, ok: false });
    SCPAudio.denied();
    const newFails = (lockInfo?.fails || 0) + 1;
    if (newFails >= 3) {
      setLockInfo({ fails: newFails, until: Date.now() + 30000 });
      setMsg({ kind: 'err', text: 'ТЕРМИНАЛ ЗАБЛОКИРОВАН НА 30 СЕК' });
    } else {
      setLockInfo({ fails: newFails, until: 0 });
      setMsg({ kind: 'err', text: 'НЕВЕРНЫЙ ПАРОЛЬ. ПОПЫТКА ' + newFails + '/3' });
    }
    setPw('');
    if (onPwChange) onPwChange('');
    setChecking(false);
  };

  const lockSecLeft = isLocked ? Math.ceil((lockInfo.until - Date.now()) / 1000) : 0;

  const revealedTerms = (state.terminals || []).filter(x => x.hintRevealed);

  return (
    <>
    {foundOpen && (
      <FoundPasswordsModal
        terms={revealedTerms}
        onClose={() => setFoundOpen(false)}
        onPick={(pw) => { setFoundOpen(false); setPw(pw); setTimeout(() => inputRef.current && inputRef.current.focus(), 50); }}
      />
    )}
    {hackOpen && (
      <HackGame
        state={state}
        onCancel={() => {
          setHackOpen(false);
          if (hackHostCallbacks && hackHostCallbacks.onClose) hackHostCallbacks.onClose();
        }}
        onSuccess={(r) => {
          setHackOpen(false);
          if (hackHostCallbacks && hackHostCallbacks.onClose) hackHostCallbacks.onClose();
          if (r && r.pw) {
            setPw(r.pw);
            if (onPwChange) onPwChange(r.pw);
            setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
          }
        }}
        onSnapshot={hackHostCallbacks ? hackHostCallbacks.onSnapshot : null}
        onDone={hackHostCallbacks ? hackHostCallbacks.onDone : null}
      />
    )}
    {hackViewState && hackViewState.open && (
      <HackGame
        state={state}
        readOnly={true}
        viewState={hackViewState}
        onCancel={() => {}}
        onSuccess={() => {}}
      />
    )}
    <div className="col" style={{height: '100%', justifyContent: 'flex-start', gap: '1.2em'}}>
      <div className="screen-header">
        <div>
          <pre className="ascii-title ascii-title-full t-bright">{BRAND_ASCII}</pre>
          <pre className="ascii-title ascii-title-small t-bright">{BRAND_ASCII_SMALL}</pre>
          <div className="mono t-dim" style={{marginTop: 6}}>
            {state.meta.subsystem} &nbsp;·&nbsp; {state.meta.build}
          </div>
        </div>
        <div className="mono t-dim" style={{textAlign: 'right'}}>
          <div>NODE: UNK</div>
          <div>{formatRetroDate(new Date())}</div>
        </div>
      </div>

      <pre className="hr-ascii">{'='.repeat(120).slice(0, 200)}</pre>

      <div className="mono">
        <pre>{asciiFrame('  ТРЕБУЕТСЯ АУТЕНТИФИКАЦИЯ  ', 46)}</pre>
      </div>

      <div className="mono" style={{marginTop: '0.5em'}}>
        <div>
          {'> Введите пароль доступа для подключения к терминалу.'}
        </div>
        <div className="t-dim">
          {'> Для административного режима используйте мастер-пароль.'}
        </div>
      </div>

      <form onSubmit={submit} className="input-line" style={{marginTop: '1em'}}>
        <span className="t-bright">ПАРОЛЬ:</span>
        <input
          ref={inputRef}
          type="password"
          autoComplete="off"
          spellCheck="false"
          value={pw}
          disabled={checking || isLocked || !canInput}
          onChange={e => {
            setPw(e.target.value);
            if (e.target.value) SCPAudio.key();
            if (onPwChange) onPwChange(e.target.value);
          }}
          placeholder={!canInput ? 'РЕЖИМ ЗРИТЕЛЯ' : (isLocked ? 'ЗАБЛОКИРОВАНО' : 'введите пароль')}
        />
        {!checking && canInput && <span className="caret"></span>}
      </form>

      {syncPwInput != null && (
        <div className="mono" style={{marginTop: '0.4em', letterSpacing: '0.22em', fontSize: 20}}>
          <span className="t-dim">{'RMT: '}</span>
          {syncPwInput.length > 0
            ? <span className="t-amber">{'●'.repeat(syncPwInput.length)}</span>
            : <span className="t-dim" style={{opacity: 0.45}}>
                {'[ожидание ввода]'}
              </span>
          }
        </div>
      )}

      {revealedTerms.length > 0 && (
        <button className="found-pw-btn" onClick={() => setFoundOpen(true)}>
          {'[' + revealedTerms.length + ']  '}
          {'НАЙДЕННЫЕ ПАРОЛИ'}
        </button>
      )}

      {checking && (
        <div className="mono t-dim" style={{marginTop: '0.8em'}}>
          <LoadingDots label={'ПРОВЕРКА УЧЁТНЫХ ДАННЫХ'} />
        </div>
      )}

      {msg && (
        <div className={'mono ' + (msg.kind === 'err' ? 't-red' : msg.kind === 'master' ? 't-amber' : 't-bright')} style={{marginTop: '0.5em'}}>
          {'>> ' + msg.text + ' <<'}
        </div>
      )}

      {isLocked && (
        <div className="mono t-red">
          {'Разблокировка через '}
          {lockSecLeft}{' сек'}
        </div>
      )}

      <div style={{flex: 1}}></div>

      <div className="status-bar t-dim">
        <span>{'SECURE · CONTAIN · PROTECT'}</span>
        {state.virusDiskReady && state.hackTargetTerminalId && (() => {
          const tgt = (state.terminals || []).find(t => t.id === state.hackTargetTerminalId);
          const tname = tgt ? tgt.name : '?';
          return (
            <span className="t-amber">
              {'[' + tname + ' — ВИРУС-ДИСКЕТА АКТИВНА]'}
            </span>
          );
        })()}
        <span>{'НЕСАНКЦИОНИРОВАННЫЙ ДОСТУП ПРЕСЛЕДУЕТСЯ'}</span>
      </div>
    </div>
    </>
  );
}

function FoundPasswordsModal({ terms, onClose, onPick }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal found-pw-modal" onClick={e => e.stopPropagation()}>
        <h3 className="t-bright" style={{margin: 0}}>
          {'// НАЙДЕННЫЕ ПАРОЛИ //'}
        </h3>
        {terms.length === 0 && (
          <div className="mono t-dim">{'[ПУСТО]'}</div>
        )}
        <div className="found-pw-list">
          {terms.map(term => (
            <div key={term.id} className="found-pw-item">
              <div className="found-pw-head">
                <span className="t-bright">{term.name}</span>
                <span className="t-dim"> · {term.hostname}</span>
                <span className={'pill lvl-' + (term.level || 1)} style={{marginLeft: 8}}>L{term.level || 1}</span>
              </div>
              <button
                className="found-pw-code"
                onClick={() => onPick(term.password)}
                title={'Подставить в поле ввода'}
              >
                {term.password}
              </button>
              {term.hintNotes && (
                <div className="mono t-dim found-pw-note">{term.hintNotes}</div>
              )}
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>{'ЗАКРЫТЬ'}</button>
        </div>
      </div>
    </div>
  );
}

function LoadingDots({ label }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN(x => (x + 1) % 4), 220);
    return () => clearInterval(id);
  }, []);
  return <span>{label}{'.'.repeat(n)}<span className="caret" style={{marginLeft: 6}}></span></span>;
}

window.PasswordScreen = PasswordScreen;
window.LoadingDots = LoadingDots;

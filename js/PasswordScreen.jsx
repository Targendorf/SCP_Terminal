// Экран ввода пароля
function PasswordScreen({ lang, state, onLogin, onMasterUnlock, lockInfo, setLockInfo, canInput = true }) {
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

    // Команда /hack — запускает мини-игру если вирус-дискета собрана
    if (entered === '/hack' || entered === 'hack' || entered === '/взлом' || entered === 'взлом') {
      setChecking(false);
      setPw('');
      if (state.virusDiskReady) {
        SCPAudio.granted();
        setMsg({ kind: 'master', text: lang === 'ru' ? 'ЗАПУСК ВИРУС-ДИСКЕТЫ...' : 'LAUNCHING VIRUS DISK...' });
        setTimeout(() => { setMsg(null); setHackOpen(true); }, 500);
      } else {
        SCPAudio.denied();
        setMsg({ kind: 'err', text: lang === 'ru' ? 'ВИРУС-ДИСКЕТА НЕ ОБНАРУЖЕНА' : 'VIRUS DISK NOT FOUND' });
      }
      return;
    }

    const terminal = state.terminals.find(t => t.password.toLowerCase() === entered);
    const isMaster = entered === (state.masterPassword || '').toLowerCase();

    if (isMaster) {
      SCPStorage.appendLog({ type: 'master-unlock', password: '[MASTER]', ok: true });
      SCPAudio.granted();
      setMsg({ kind: 'master', text: lang === 'ru' ? 'АДМИНИСТРАТИВНЫЙ ДОСТУП' : 'ADMINISTRATOR ACCESS' });
      setTimeout(() => onMasterUnlock(), 900);
      return;
    }

    if (terminal) {
      SCPStorage.appendLog({ type: 'login', terminal: terminal.id, password: entered, ok: true });
      SCPAudio.granted();
      setMsg({ kind: 'ok', text: (lang === 'ru' ? 'ДОСТУП РАЗРЕШЁН // ' : 'ACCESS GRANTED // ') + (lang === 'ru' ? terminal.nameRu || terminal.name : terminal.name) });
      setTimeout(() => onLogin(terminal), 900);
      return;
    }

    SCPStorage.appendLog({ type: 'login', password: entered, ok: false });
    SCPAudio.denied();
    const newFails = (lockInfo?.fails || 0) + 1;
    if (newFails >= 3) {
      setLockInfo({ fails: newFails, until: Date.now() + 30000 });
      setMsg({ kind: 'err', text: lang === 'ru' ? 'ТЕРМИНАЛ ЗАБЛОКИРОВАН НА 30 СЕК' : 'TERMINAL LOCKED FOR 30 SEC' });
    } else {
      setLockInfo({ fails: newFails, until: 0 });
      setMsg({ kind: 'err', text: lang === 'ru' ? 'НЕВЕРНЫЙ ПАРОЛЬ. ПОПЫТКА ' + newFails + '/3' : 'INVALID PASSWORD. ATTEMPT ' + newFails + '/3' });
    }
    setPw('');
    setChecking(false);
  };

  const lockSecLeft = isLocked ? Math.ceil((lockInfo.until - Date.now()) / 1000) : 0;

  const revealedTerms = (state.terminals || []).filter(x => x.hintRevealed);

  return (
    <>
    {foundOpen && (
      <FoundPasswordsModal
        lang={lang}
        terms={revealedTerms}
        onClose={() => setFoundOpen(false)}
        onPick={(pw) => { setFoundOpen(false); setPw(pw); setTimeout(() => inputRef.current && inputRef.current.focus(), 50); }}
      />
    )}
    {hackOpen && (
      <HackGame
        lang={lang}
        state={state}
        onCancel={() => setHackOpen(false)}
        onSuccess={(r) => {
          setHackOpen(false);
          if (r && r.pw) {
            setPw(r.pw);
            setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
          }
        }}
      />
    )}
    <div className="col" style={{height: '100%', justifyContent: 'flex-start', gap: '1.2em'}}>
      <div className="screen-header">
        <div>
          <pre className="ascii-title t-bright">{BRAND_ASCII}</pre>
          <div className="mono t-dim" style={{marginTop: 6}}>
            {state.meta.subsystem} &nbsp;·&nbsp; {state.meta.build}
          </div>
        </div>
        <div className="mono t-dim" style={{textAlign: 'right'}}>
          <div>NODE: UNK</div>
          <div>{formatRetroDate(new Date(), lang)}</div>
        </div>
      </div>

      <pre className="hr-ascii">{'='.repeat(120).slice(0, 200)}</pre>

      <div className="mono">
        <pre>{asciiFrame(lang === 'ru' ? '  ТРЕБУЕТСЯ АУТЕНТИФИКАЦИЯ  ' : '  AUTHENTICATION REQUIRED  ', 46)}</pre>
      </div>

      <div className="mono" style={{marginTop: '0.5em'}}>
        <div>
          {lang === 'ru'
            ? '> Введите пароль доступа для подключения к терминалу.'
            : '> Enter access password to connect to terminal.'}
        </div>
        <div className="t-dim">
          {lang === 'ru'
            ? '> Для административного режима используйте мастер-пароль.'
            : '> For administrative mode, use master password.'}
        </div>
      </div>

      <form onSubmit={submit} className="input-line" style={{marginTop: '1em'}}>
        <span className="t-bright">{lang === 'ru' ? 'ПАРОЛЬ:' : 'PASSWORD:'}</span>
        <input
          ref={inputRef}
          type="password"
          autoComplete="off"
          spellCheck="false"
          value={pw}
          disabled={checking || isLocked || !canInput}
          onChange={e => { setPw(e.target.value); if (e.target.value) SCPAudio.key(); }}
          placeholder={!canInput ? (lang === 'ru' ? 'РЕЖИМ ЗРИТЕЛЯ' : 'VIEWER MODE') : (isLocked ? (lang === 'ru' ? 'ЗАБЛОКИРОВАНО' : 'LOCKED') : (lang === 'ru' ? 'введите пароль' : 'enter password'))}
        />
        {!checking && canInput && <span className="caret"></span>}
      </form>

      {revealedTerms.length > 0 && (
        <button className="found-pw-btn" onClick={() => setFoundOpen(true)}>
          {'[' + revealedTerms.length + ']  '}
          {lang === 'ru' ? 'НАЙДЕННЫЕ ПАРОЛИ' : 'FOUND PASSWORDS'}
        </button>
      )}

      {checking && (
        <div className="mono t-dim" style={{marginTop: '0.8em'}}>
          <LoadingDots label={lang === 'ru' ? 'ПРОВЕРКА УЧЁТНЫХ ДАННЫХ' : 'VERIFYING CREDENTIALS'} />
        </div>
      )}

      {msg && (
        <div className={'mono ' + (msg.kind === 'err' ? 't-red' : msg.kind === 'master' ? 't-amber' : 't-bright')} style={{marginTop: '0.5em'}}>
          {'>> ' + msg.text + ' <<'}
        </div>
      )}

      {isLocked && (
        <div className="mono t-red">
          {lang === 'ru' ? 'Разблокировка через ' : 'Unlock in '}
          {lockSecLeft}{lang === 'ru' ? ' сек' : ' sec'}
        </div>
      )}

      <div style={{flex: 1}}></div>

      <div className="status-bar t-dim">
        <span>{lang === 'ru' ? 'SECURE · CONTAIN · PROTECT' : 'SECURE · CONTAIN · PROTECT'}</span>
        {state.virusDiskReady && (
          <span className="t-amber">{lang === 'ru' ? '[/hack — ВИРУС-ДИСКЕТА ДОСТУПНА]' : '[/hack — VIRUS DISK READY]'}</span>
        )}
        <span>{lang === 'ru' ? 'НЕСАНКЦИОНИРОВАННЫЙ ДОСТУП ПРЕСЛЕДУЕТСЯ' : 'UNAUTHORIZED ACCESS IS A FEDERAL OFFENSE'}</span>
      </div>
    </div>
    </>
  );
}

function FoundPasswordsModal({ lang, terms, onClose, onPick }) {
  const t = lang === 'ru';
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal found-pw-modal" onClick={e => e.stopPropagation()}>
        <h3 className="t-bright" style={{margin: 0}}>
          {t ? '// НАЙДЕННЫЕ ПАРОЛИ //' : '// FOUND PASSWORDS //'}
        </h3>
        <div className="mono t-dim" style={{fontSize: 13, marginBottom: 6}}>
          {t
            ? '> Пароли, собранные в ходе настольной игры. Кликните по паролю — он подставится в поле ввода.'
            : '> Passwords collected during the tabletop game. Click a password to fill the input.'}
        </div>
        {terms.length === 0 && (
          <div className="mono t-dim">{t ? '[ПУСТО]' : '[EMPTY]'}</div>
        )}
        <div className="found-pw-list">
          {terms.map(term => (
            <div key={term.id} className="found-pw-item">
              <div className="found-pw-head">
                <span className="t-bright">{lang === 'ru' ? (term.nameRu || term.name) : term.name}</span>
                <span className="t-dim"> · {term.hostname}</span>
                <span className={'pill lvl-' + (term.level || 1)} style={{marginLeft: 8}}>L{term.level || 1}</span>
              </div>
              <button
                className="found-pw-code"
                onClick={() => onPick(term.password)}
                title={t ? 'Подставить в поле ввода' : 'Use this password'}
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
          <button className="btn" onClick={onClose}>{t ? 'ЗАКРЫТЬ' : 'CLOSE'}</button>
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

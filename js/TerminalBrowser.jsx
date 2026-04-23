// Браузер файлов: навигация по папкам и чтение файлов
function TerminalBrowser({ terminal, state, onExit, readOnly = false, syncNav = null, onNav = null }) {
  // view: 'folders' | 'files' | 'file' | 'cmd'
  const [view, setView] = useState(syncNav?.view || 'folders');
  const [folderIdx, setFolderIdx] = useState(syncNav?.folderIdx || 0);
  const [fileIdx, setFileIdx] = useState(syncNav?.fileIdx || 0);
  const [cmdMode, setCmdMode] = useState(false);
  const [cmd, setCmd] = useState('');
  const [cmdLog, setCmdLog] = useState([]);
  const cmdInputRef = useRef(null);
  const fileViewRef = useRef(null);

  // Зритель получает обновления навигации от хоста
  useEffect(() => {
    if (!readOnly || !syncNav) return;
    if (syncNav.view !== view) setView(syncNav.view);
    if (syncNav.folderIdx !== folderIdx) setFolderIdx(syncNav.folderIdx);
    if (syncNav.fileIdx !== fileIdx) setFileIdx(syncNav.fileIdx);
  }, [syncNav && syncNav.view, syncNav && syncNav.folderIdx, syncNav && syncNav.fileIdx, readOnly]);

  // Хост шлёт навигацию
  useEffect(() => {
    if (readOnly || !onNav) return;
    onNav({ view, folderIdx, fileIdx });
  }, [view, folderIdx, fileIdx, readOnly]);

  const folders = terminal.folders || [];
  const curFolder = folders[folderIdx];
  const files = curFolder ? curFolder.files || [] : [];
  const curFile = files[fileIdx];

  const tName = terminal.name;
  const motd = terminal.motd;
  const operator = terminal.operator;

  // Клавиатурная навигация
  useEffect(() => {
    if (readOnly) return;
    const h = (e) => {
      if (cmdMode) return;
      if (e.key === 'Escape') {
        SCPAudio.key();
        if (view === 'file') { setView('files'); return; }
        if (view === 'files') { setView('folders'); return; }
        if (view === 'folders') { onExit(); return; }
      }
      if (e.key === '\\' || e.key === '`') {
        e.preventDefault();
        setCmdMode(true);
        setTimeout(() => cmdInputRef.current && cmdInputRef.current.focus(), 10);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        SCPAudio.key();
        if (view === 'folders') setFolderIdx(i => (i - 1 + folders.length) % Math.max(1, folders.length));
        else if (view === 'files') setFileIdx(i => (i - 1 + files.length) % Math.max(1, files.length));
        else if (view === 'file' && fileViewRef.current) fileViewRef.current.scrollBy(0, -40);
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        SCPAudio.key();
        if (view === 'folders') setFolderIdx(i => (i + 1) % Math.max(1, folders.length));
        else if (view === 'files') setFileIdx(i => (i + 1) % Math.max(1, files.length));
        else if (view === 'file' && fileViewRef.current) fileViewRef.current.scrollBy(0, 40);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        SCPAudio.beep(620, 0.05);
        if (view === 'folders' && folders.length) { setView('files'); setFileIdx(0); }
        else if (view === 'files' && files.length) setView('file');
      }
      if (e.key === 'ArrowLeft') {
        if (view === 'file') { setView('files'); SCPAudio.key(); }
        else if (view === 'files') { setView('folders'); SCPAudio.key(); }
      }
      if (e.key === 'ArrowRight') {
        if (view === 'folders' && folders.length) { setView('files'); setFileIdx(0); SCPAudio.key(); }
        else if (view === 'files' && files.length) { setView('file'); SCPAudio.key(); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [view, folderIdx, fileIdx, folders, files, cmdMode, onExit, readOnly]);

  // Выполнение команды
  const runCmd = (raw) => {
    const input = raw.trim();
    if (!input) return;
    const parts = input.split(/\s+/);
    const c = parts[0].toLowerCase();
    const arg = parts.slice(1).join(' ');
    const out = (text, cls) => ({ text, cls });
    const append = (entries) => setCmdLog(log => [...log, { cmd: input }, ...entries]);

    if (c === 'help' || c === '?' || c === 'помощь') {
      append([
        out('Доступные команды:', 't-bright'),
        out('  ls, dir           — список'),
        out('  cd <folder>       — войти в папку'),
        out('  cd ..             — наверх'),
        out('  cat <file>        — открыть файл'),
        out('  open <file>       — то же, что cat'),
        out('  clear, cls        — очистить экран'),
        out('  whoami            — текущий оператор'),
        out('  logout, exit      — выйти из терминала'),
        out('  date              — текущая дата'),
      ]);
    } else if (c === 'ls' || c === 'dir') {
      if (view === 'folders' || view === 'cmd') {
        append([
          out('[ПАПКИ]', 't-bright'),
          ...folders.map(f => out('  <DIR>  ' + f.name)),
        ]);
      } else if (view === 'files') {
        append([
          out('[ФАЙЛЫ В ' + curFolder.name + ']', 't-bright'),
          ...files.map(f => out('  ' + f.name)),
        ]);
      }
    } else if (c === 'cd') {
      if (arg === '..') { setView('folders'); append([out('> ..')]); }
      else {
        const i = folders.findIndex(f => f.name.toLowerCase() === arg.toLowerCase());
        if (i >= 0) { setFolderIdx(i); setView('files'); setFileIdx(0); append([out('> cd ' + arg, 't-bright')]); }
        else append([out('Папка не найдена: ' + arg, 't-red')]);
      }
    } else if (c === 'cat' || c === 'open' || c === 'type') {
      // найдём файл в текущей папке или во всех
      const curFiles = curFolder ? curFolder.files || [] : [];
      let i = curFiles.findIndex(f => f.name.toLowerCase() === arg.toLowerCase());
      if (i >= 0) { setFileIdx(i); setView('file'); append([out('> open ' + arg, 't-bright')]); }
      else append([out('Файл не найден: ' + arg, 't-red')]);
    } else if (c === 'clear' || c === 'cls') {
      setCmdLog([]);
    } else if (c === 'whoami') {
      append([out('> ' + operator + ' @ ' + terminal.hostname, 't-bright')]);
    } else if (c === 'date') {
      append([out('> ' + formatRetroDate(new Date()), 't-bright')]);
    } else {
      append([out('Неизвестная команда: ' + c + '. help — справка.', 't-red')]);
      SCPAudio.error();
    }
  };

  const exitCmd = () => {
    setCmdMode(false);
    setCmd('');
  };

  // Typewriter для файла
  const fileText = useMemo(() => {
    if (!curFile) return '';
    return (curFile.content || '');
  }, [curFile]);
  const [typedText, typedDone] = useTypewriter(view === 'file' ? fileText : '', 4);

  const pickFolder = (i) => { if (readOnly) return; setFolderIdx(i); setView('files'); setFileIdx(0); SCPAudio.beep(620, 0.04); };
  const pickFile = (i) => { if (readOnly) return; setFileIdx(i); setView('file'); SCPAudio.beep(620, 0.04); };
  const backFolders = () => { if (readOnly) return; setView('folders'); };

  return (
    <div className="col" style={{height: '100%', gap: '0.6em', pointerEvents: readOnly ? 'none' : 'auto'}}>
      {/* HEADER */}
      <div className="screen-header mono">
        <div>
          <div className="t-bright" style={{fontSize: 'clamp(18px, 1.8vw, 26px)'}}>{'[' + terminal.hostname + ']'} {tName}</div>
          <div className="t-dim">
            {'ОПЕРАТОР: '}{operator}
            {' · '}
            <span className={'pill lvl-' + (terminal.level || 1)}>{levelLabel(terminal.level || 1)}</span>
          </div>
        </div>
        <div className="t-dim" style={{textAlign: 'right'}}>
          <div>{state.meta.build}</div>
          <ClockLine />
        </div>
      </div>

      <pre className="hr-ascii">{'='.repeat(200)}</pre>

      {/* MOTD */}
      <div className="mono t-dim" style={{display: view === 'folders' ? 'block' : 'none'}}>
        {motd && motd.map((m, i) => <div key={i} className={i === 0 ? 't-bright' : ''}>{m}</div>)}
      </div>

      {/* CONTENT */}
      <div className="grow" style={{display: 'flex', flexDirection: 'column', minHeight: 0}}>
        {view === 'folders' && (
          <FolderList folders={folders} activeIdx={folderIdx} onPick={pickFolder} />
        )}
        {view === 'files' && curFolder && (
          <FileList folder={curFolder} activeIdx={fileIdx} onPick={pickFile} onBack={backFolders} />
        )}
        {view === 'file' && curFile && (
          <FileViewer file={curFile} text={typedText} done={typedDone} viewRef={fileViewRef} />
        )}
      </div>

      {/* CMD LOG */}
      {cmdLog.length > 0 && (
        <div className="mono" style={{maxHeight: '25vh', overflowY: 'auto', borderTop: '1px dashed var(--phosphor-dim)', paddingTop: 6}}>
          {cmdLog.map((e, i) => e.cmd
            ? <div key={i} className="t-bright">{'> ' + e.cmd}</div>
            : <div key={i} className={e.cls || ''}>{e.text}</div>)}
        </div>
      )}

      {/* CMD INPUT */}
      {cmdMode && (
        <form onSubmit={(e) => { e.preventDefault(); runCmd(cmd); setCmd(''); }} className="input-line">
          <span className="t-bright">{terminal.hostname}:\&gt;</span>
          <input
            ref={cmdInputRef}
            type="text"
            autoComplete="off"
            spellCheck="false"
            value={cmd}
            onChange={e => { setCmd(e.target.value); SCPAudio.key(); }}
            onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); exitCmd(); } }}
          />
          <span className="caret"></span>
        </form>
      )}

      {/* STATUS BAR */}
      <div className="status-bar t-dim">
        <span>{statusBarText()}</span>
        <span>{terminal.hostname} · {operator}</span>
      </div>
    </div>
  );
}

function ClockLine() {
  const [n, setN] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setN(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <div>{formatRetroDate(n)}</div>;
}

function FolderList({ folders, activeIdx, onPick }) {
  if (!folders.length) return <div className="mono t-dim">{'[ПАПОК НЕТ]'}</div>;
  return (
    <div className="mono">
      <div className="t-bright" style={{marginBottom: 6}}>{'ПАПКИ //'}</div>
      {folders.map((f, i) => (
        <div key={f.id || i} className={'menu-row' + (i === activeIdx ? ' active' : '')} onClick={() => onPick(i)}>
          <span className="caret-prefix">{i === activeIdx ? '▶' : ' '}</span>
          <span>[{String(i + 1).padStart(2, '0')}]</span>
          <span>&lt;DIR&gt;</span>
          <span>{f.name}</span>
          <span style={{marginLeft: 'auto', opacity: 0.65}}>{(f.files || []).length} {'файл(ов)'}</span>
        </div>
      ))}
    </div>
  );
}

function FileList({ folder, activeIdx, onPick, onBack }) {
  const files = folder.files || [];
  return (
    <div className="mono">
      <div style={{marginBottom: 6}}>
        <span className="t-dim">&lt; </span>
        <span className="t-bright">{folder.name}</span>
        <span className="t-dim">  //  {files.length} {'файл(ов)'}</span>
      </div>
      <div className="menu-row" onClick={onBack} style={{opacity: 0.7}}>
        <span>  </span><span>..</span><span>&lt;{'НАЗАД'}&gt;</span>
      </div>
      {!files.length && <div className="t-dim">{'[ПАПКА ПУСТА]'}</div>}
      {files.map((f, i) => (
        <div key={f.id || i} className={'menu-row' + (i === activeIdx ? ' active' : '')} onClick={() => onPick(i)}>
          <span className="caret-prefix">{i === activeIdx ? '▶' : ' '}</span>
          <span>[{String(i + 1).padStart(2, '0')}]</span>
          <span className={f.corrupted ? 't-red' : ''}>
            {f.corrupted ? '[!]' : '   '}
          </span>
          <span>{f.name}</span>
        </div>
      ))}
    </div>
  );
}

function FileViewer({ file, text, done, viewRef }) {
  const name = file.name;
  return (
    <div className="col grow" style={{minHeight: 0}}>
      <div className="mono" style={{marginBottom: 6}}>
        <span className="t-dim">&lt; </span>
        <span className={file.corrupted ? 't-red' : 't-bright'}>
          {file.corrupted ? '[ПОВРЕЖДЁН] ' : ''}
          {name}
        </span>
      </div>
      <div ref={viewRef} className="file-viewer mono">
        <pre className={file.corrupted ? 't-amber' : ''} style={{whiteSpace: 'pre-wrap'}}>{text}{!done && <span className="caret" style={{marginLeft: 2}}></span>}</pre>
      </div>
    </div>
  );
}

window.TerminalBrowser = TerminalBrowser;

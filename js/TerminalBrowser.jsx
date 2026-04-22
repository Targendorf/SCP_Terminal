// Браузер файлов: навигация по папкам и чтение файлов
function TerminalBrowser({ lang, terminal, state, onExit, readOnly = false, syncNav = null, onNav = null }) {
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

  const tName = lang === 'ru' ? (terminal.nameRu || terminal.name) : terminal.name;
  const motd = lang === 'ru' ? (terminal.motdRu || terminal.motd) : terminal.motd;
  const operator = lang === 'ru' ? (terminal.operator || terminal.operatorEn) : (terminal.operatorEn || terminal.operator);

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
        out(lang === 'ru' ? 'Доступные команды:' : 'Available commands:', 't-bright'),
        out('  ls, dir           — ' + (lang === 'ru' ? 'список' : 'list')),
        out('  cd <folder>       — ' + (lang === 'ru' ? 'войти в папку' : 'enter folder')),
        out('  cd ..             — ' + (lang === 'ru' ? 'наверх' : 'go up')),
        out('  cat <file>        — ' + (lang === 'ru' ? 'открыть файл' : 'open file')),
        out('  open <file>       — ' + (lang === 'ru' ? 'то же, что cat' : 'same as cat')),
        out('  clear, cls        — ' + (lang === 'ru' ? 'очистить экран' : 'clear screen')),
        out('  whoami            — ' + (lang === 'ru' ? 'текущий оператор' : 'current operator')),
        out('  logout, exit      — ' + (lang === 'ru' ? 'выйти из терминала' : 'log out')),
        out('  date              — ' + (lang === 'ru' ? 'текущая дата' : 'current date')),
      ]);
    } else if (c === 'ls' || c === 'dir') {
      if (view === 'folders' || view === 'cmd') {
        append([
          out(lang === 'ru' ? '[ПАПКИ]' : '[FOLDERS]', 't-bright'),
          ...folders.map(f => out('  <DIR>  ' + (lang === 'ru' ? (f.nameRu || f.name) : f.name))),
        ]);
      } else if (view === 'files') {
        append([
          out(lang === 'ru' ? '[ФАЙЛЫ В ' + (curFolder.nameRu || curFolder.name) + ']' : '[FILES IN ' + curFolder.name + ']', 't-bright'),
          ...files.map(f => out('  ' + (lang === 'ru' ? (f.nameRu || f.name) : f.name))),
        ]);
      }
    } else if (c === 'cd') {
      if (arg === '..') { setView('folders'); append([out('> ..')]); }
      else {
        const i = folders.findIndex(f => (f.name.toLowerCase() === arg.toLowerCase()) || ((f.nameRu || '').toLowerCase() === arg.toLowerCase()));
        if (i >= 0) { setFolderIdx(i); setView('files'); setFileIdx(0); append([out('> cd ' + arg, 't-bright')]); }
        else append([out(lang === 'ru' ? 'Папка не найдена: ' + arg : 'Folder not found: ' + arg, 't-red')]);
      }
    } else if (c === 'cat' || c === 'open' || c === 'type') {
      // найдём файл в текущей папке или во всех
      const curFiles = curFolder ? curFolder.files || [] : [];
      let i = curFiles.findIndex(f => (f.name.toLowerCase() === arg.toLowerCase()) || ((f.nameRu || '').toLowerCase() === arg.toLowerCase()));
      if (i >= 0) { setFileIdx(i); setView('file'); append([out('> open ' + arg, 't-bright')]); }
      else append([out(lang === 'ru' ? 'Файл не найден: ' + arg : 'File not found: ' + arg, 't-red')]);
    } else if (c === 'clear' || c === 'cls') {
      setCmdLog([]);
    } else if (c === 'whoami') {
      append([out('> ' + operator + ' @ ' + terminal.hostname, 't-bright')]);
    } else if (c === 'date') {
      append([out('> ' + formatRetroDate(new Date(), lang), 't-bright')]);
    } else if (c === 'logout' || c === 'exit' || c === 'quit') {
      SCPAudio.beep(300, 0.1);
      onExit();
    } else {
      append([out(lang === 'ru' ? 'Неизвестная команда: ' + c + '. help — справка.' : 'Unknown command: ' + c + '. Try: help.', 't-red')]);
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
    return lang === 'ru' ? (curFile.contentRu || curFile.contentEn || '') : (curFile.contentEn || curFile.contentRu || '');
  }, [curFile, lang]);
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
            {lang === 'ru' ? 'ОПЕРАТОР: ' : 'OPERATOR: '}{operator}
            {' · '}
            <span className={'pill lvl-' + (terminal.level || 1)}>{levelLabel(terminal.level || 1, lang)}</span>
          </div>
        </div>
        <div className="t-dim" style={{textAlign: 'right'}}>
          <div>{state.meta.build}</div>
          <ClockLine lang={lang} />
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
          <FolderList lang={lang} folders={folders} activeIdx={folderIdx} onPick={pickFolder} />
        )}
        {view === 'files' && curFolder && (
          <FileList lang={lang} folder={curFolder} activeIdx={fileIdx} onPick={pickFile} onBack={backFolders} />
        )}
        {view === 'file' && curFile && (
          <FileViewer lang={lang} file={curFile} text={typedText} done={typedDone} viewRef={fileViewRef} />
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
        <span>{statusBarText(lang)}</span>
        <span>{terminal.hostname} · {operator}</span>
      </div>
    </div>
  );
}

function ClockLine({ lang }) {
  const [n, setN] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setN(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <div>{formatRetroDate(n, lang)}</div>;
}

function FolderList({ lang, folders, activeIdx, onPick }) {
  if (!folders.length) return <div className="mono t-dim">{lang === 'ru' ? '[ПАПОК НЕТ]' : '[NO FOLDERS]'}</div>;
  return (
    <div className="mono">
      <div className="t-bright" style={{marginBottom: 6}}>{lang === 'ru' ? 'ПАПКИ //' : 'FOLDERS //'}</div>
      {folders.map((f, i) => (
        <div key={f.id || i} className={'menu-row' + (i === activeIdx ? ' active' : '')} onClick={() => onPick(i)}>
          <span className="caret-prefix">{i === activeIdx ? '▶' : ' '}</span>
          <span>[{String(i + 1).padStart(2, '0')}]</span>
          <span>&lt;DIR&gt;</span>
          <span>{lang === 'ru' ? (f.nameRu || f.name) : f.name}</span>
          <span style={{marginLeft: 'auto', opacity: 0.65}}>{(f.files || []).length} {lang === 'ru' ? 'файл(ов)' : 'files'}</span>
        </div>
      ))}
    </div>
  );
}

function FileList({ lang, folder, activeIdx, onPick, onBack }) {
  const files = folder.files || [];
  return (
    <div className="mono">
      <div style={{marginBottom: 6}}>
        <span className="t-dim">&lt; </span>
        <span className="t-bright">{lang === 'ru' ? (folder.nameRu || folder.name) : folder.name}</span>
        <span className="t-dim">  //  {files.length} {lang === 'ru' ? 'файл(ов)' : 'files'}</span>
      </div>
      <div className="menu-row" onClick={onBack} style={{opacity: 0.7}}>
        <span>  </span><span>..</span><span>&lt;{lang === 'ru' ? 'НАЗАД' : 'BACK'}&gt;</span>
      </div>
      {!files.length && <div className="t-dim">{lang === 'ru' ? '[ПАПКА ПУСТА]' : '[EMPTY]'}</div>}
      {files.map((f, i) => (
        <div key={f.id || i} className={'menu-row' + (i === activeIdx ? ' active' : '')} onClick={() => onPick(i)}>
          <span className="caret-prefix">{i === activeIdx ? '▶' : ' '}</span>
          <span>[{String(i + 1).padStart(2, '0')}]</span>
          <span className={f.corrupted ? 't-red' : ''}>
            {f.corrupted ? (lang === 'ru' ? '[!]' : '[!]') : '   '}
          </span>
          <span>{lang === 'ru' ? (f.nameRu || f.name) : f.name}</span>
        </div>
      ))}
    </div>
  );
}

function FileViewer({ lang, file, text, done, viewRef }) {
  const name = lang === 'ru' ? (file.nameRu || file.name) : file.name;
  return (
    <div className="col grow" style={{minHeight: 0}}>
      <div className="mono" style={{marginBottom: 6}}>
        <span className="t-dim">&lt; </span>
        <span className={file.corrupted ? 't-red' : 't-bright'}>
          {file.corrupted ? (lang === 'ru' ? '[ПОВРЕЖДЁН] ' : '[CORRUPTED] ') : ''}
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

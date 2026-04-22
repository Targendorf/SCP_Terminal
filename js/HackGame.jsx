// HackGame — диспетчер головоломок. Каждая мини-игра работает внутри общей обёртки.
// На старте выбирается тип (по настройке админа) и цель (конкретный или случайный терминал).

const HACK_PUZZLE_TYPES = ['wordsearch', 'sequence', 'wire', 'cipher', 'memory', 'pipe', 'freq', 'typer'];

function getHackReward(state, lang) {
  const list = state.terminals || [];
  if (!list.length) return null;
  let term = null;
  if (state.hackTargetTerminalId) term = list.find(x => x.id === state.hackTargetTerminalId);
  if (!term) term = list[Math.floor(Math.random() * list.length)];
  return {
    pw: term.password,
    name: lang === 'ru' ? (term.nameRu || term.name) : term.name,
    host: term.hostname || '',
  };
}

function pickHackPuzzle(adminChoice) {
  if (adminChoice && adminChoice !== 'random' && HACK_PUZZLE_TYPES.includes(adminChoice)) return adminChoice;
  return HACK_PUZZLE_TYPES[Math.floor(Math.random() * HACK_PUZZLE_TYPES.length)];
}

const PUZZLE_TITLES = {
  wordsearch: { ru: 'ПОИСК СЛОВ', en: 'WORD SEARCH' },
  sequence:   { ru: 'ЗАМОК ПОСЛЕДОВАТЕЛЬНОСТИ', en: 'SEQUENCE LOCK' },
  wire:       { ru: 'ТРАССИРОВКА СИГНАЛА', en: 'WIRE TRACE' },
  cipher:     { ru: 'ДЕШИФРАТОР ЦЕЗАРЯ', en: 'CAESAR DECODE' },
  memory:     { ru: 'ПАМЯТЬ СЕТКИ', en: 'MEMORY GRID' },
  pipe:       { ru: 'СХЕМА ПИТАНИЯ', en: 'PIPE CIRCUIT' },
  freq:       { ru: 'НАСТРОЙКА ЧАСТОТЫ', en: 'FREQUENCY LOCK' },
  typer:      { ru: 'ВВОД КОДА', en: 'SPEED TYPER' },
};

function HackGame({ lang, state, onSuccess, onCancel, onSnapshot, onDone, readOnly, viewState }) {
  const t = lang === 'ru';
  const [done, setDone] = React.useState(false);
  const reward = React.useMemo(() => getHackReward(state, lang), []);
  const puzzleType = React.useMemo(() => pickHackPuzzle(state.hackPuzzleType), []);

  // When viewer, use the puzzle type from host's broadcast; otherwise use locally picked type.
  const activePuzzleType = (readOnly && viewState) ? (viewState.puzzleType || 'wordsearch') : puzzleType;
  const activeTitle = PUZZLE_TITLES[activePuzzleType]?.[t ? 'ru' : 'en'] || activePuzzleType;
  const effectiveDone   = (readOnly && viewState) ? (viewState.done   || false) : done;
  const effectiveReward = (readOnly && viewState) ? (viewState.reward || null)  : reward;
  const effectiveSnap   = (readOnly && viewState) ? (viewState.snapshot || null) : null;

  const PUZZLES = {
    wordsearch: WordSearchPuzzle,
    sequence:   SequencePuzzle,
    wire:       WirePuzzle,
    cipher:     CipherPuzzle,
    memory:     MemoryPuzzle,
    pipe:       PipePuzzle,
    freq:       FrequencyPuzzle,
    typer:      TyperPuzzle,
  };
  const Puzzle = PUZZLES[activePuzzleType] || WordSearchPuzzle;

  const _snapTimer = React.useRef(null);
  const handleSnapshot = React.useCallback((puzzleState) => {
    if (!onSnapshot) return;
    if (_snapTimer.current) clearTimeout(_snapTimer.current);
    _snapTimer.current = setTimeout(() => {
      onSnapshot({ puzzleType: activePuzzleType, puzzleState });
    }, 100);
  }, [onSnapshot, activePuzzleType]);

  React.useEffect(() => {
    return () => { if (_snapTimer.current) clearTimeout(_snapTimer.current); };
  }, []);

  return (
    <div className="modal-overlay hack-overlay" style={{overflowY: 'auto', padding: '10px', alignItems: 'flex-start'}}>
      <div className="modal hack-modal">
        {readOnly && (
          <div className="mono t-amber" style={{textAlign: 'center', fontSize: 13, padding: '2px 0', borderBottom: '1px solid var(--amber)', marginBottom: 4}}>
            {'>> '}{t ? 'ЗРИТЕЛЬСКИЙ РЕЖИМ — ТОЛЬКО ПРОСМОТР' : 'VIEWER MODE — READ ONLY'}{' <<'}
          </div>
        )}
        <div className="hack-head">
          <h3 className="t-amber" style={{margin: 0}}>
            {'[' + (t ? 'ВИРУС-ДИСКЕТА' : 'VIRUS DISK') + ' // ' + activeTitle + ']'}
          </h3>
        </div>

        {!effectiveDone && (
          <Puzzle
            lang={lang}
            onWin={() => {
              if (!readOnly) {
                setDone(true);
                SCPAudio.granted();
                // reward is host-local (useMemo). App.hackHostCallbacks.onDone broadcasts it as hackReward,
                // which viewers receive as viewState.reward → effectiveReward. Keep in sync with App.jsx Task 5.
                if (onDone) onDone(reward);
              }
            }}
            onStateChange={!readOnly ? handleSnapshot : null}
            readOnlySnapshot={readOnly ? effectiveSnap : null}
          />
        )}

        {effectiveDone && effectiveReward && (
          <div className="mono hack-reward">
            <div className="t-bright">{t ? '>> ДОСТУП РАЗРЕШЁН <<' : '>> ACCESS GRANTED <<'}</div>
            <div className="t-dim">{t ? 'Пароль от ' : 'Password for '}{effectiveReward.name}:</div>
            <div className="t-amber" style={{fontSize: 22, letterSpacing: '0.1em', marginTop: 4}}>{effectiveReward.pw}</div>
          </div>
        )}
        {effectiveDone && !effectiveReward && (
          <div className="mono t-red">{t ? 'ЦЕЛЬ НЕ НАСТРОЕНА' : 'NO TARGET CONFIGURED'}</div>
        )}

        <div className="modal-actions" style={{marginTop: 4}}>
          <button className="btn" onClick={onCancel}>{t ? 'ОТМЕНА' : 'CANCEL'}</button>
          {effectiveDone && effectiveReward && !readOnly && (
            <button className="btn" onClick={() => onSuccess(effectiveReward)}>{t ? 'ИСПОЛЬЗОВАТЬ' : 'USE'}</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// 1. WORD SEARCH — поиск слов 15×15. Только → и ↓. Слова ≥ 4 букв.
// ======================================================================
function WordSearchPuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
  const SIZE = 15;
  const t = lang === 'ru';
  const WORDS_RU = ['КЕТЕР','ЕВКЛИД','АНОМАЛ','СЕКТОР','ФОНД','ОБЪЕКТ','ПРОТОКОЛ','АРХИВ','ЗОНА','СЕКРЕТ','ДОСТУП','ПРОРЫВ','ПРИЗРАК','ВАКЦИНА','БАРЬЕР','СИГНАЛ','РАЗЛОМ','ЦИФРА','МОЛНИЯ','АГЕНТ','ГРУППА','ОХРАНА','МАРКЕР','ДОКЛАД','СКАНЕР','КОДОН','ГАММА','ОМЕГА','РЕАКТОР','МУТАНТ','ВИРУС','МАЯК','ПЕЩЕРА','СИЯНИЕ','ПОРТАЛ'];
  const WORDS_EN = ['KETER','EUCLID','ANOMALY','SECTOR','FOUND','OBJECT','PROTOCOL','ARCHIVE','SITE','CONTAIN','SECRET','ACCESS','BREACH','GHOST','VACCINE','BARRIER','SIGNAL','RIFT','CIPHER','OMEGA','AGENT','SQUAD','GUARD','MARKER','REPORT','SCANNER','CODON','GAMMA','DELTA','REACTOR','MUTANT','VIRUS','BEACON','CAVERN','PORTAL'];

  const game = React.useMemo(() => makeGrid(SIZE, t ? WORDS_RU : WORDS_EN), []);
  const [found, setFound] = React.useState([]);
  const [dragging, setDragging] = React.useState(null);
  const [current, setCurrent] = React.useState(null);
  const [shake, setShake] = React.useState(false);
  const [foundCellsMap, setFoundCellsMap] = React.useState(new Set());
  const boardRef = React.useRef(null);
  const winRef = React.useRef(false);

  React.useEffect(() => {
    if (found.length === game.words.length && !winRef.current) {
      winRef.current = true;
      onWin();
    }
  }, [found]);

  React.useEffect(() => {
    if (!onStateChange) return;
    onStateChange({
      found,
      foundCells: Array.from(foundCellsMap),
      currentCells: current ? current.cells : [],
    });
  }, [found, current, foundCellsMap, onStateChange]);

  const cellAt = (e) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    const cw = rect.width / SIZE, ch = rect.height / SIZE;
    const c = Math.floor((clientX - rect.left) / cw);
    const r = Math.floor((clientY - rect.top) / ch);
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return null;
    return [r, c];
  };
  const onStart = (e) => { e.preventDefault(); const c = cellAt(e); if (!c) return; setDragging({start: c}); setCurrent({cells: [c]}); SCPAudio.key(); };
  const onMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const c = cellAt(e); if (!c) return;
    const [r1, c1] = dragging.start, [r2, c2] = c;
    const dr = r2 - r1, dc = c2 - c1;
    let sr = 0, sc = 0, len = 1;
    if (dr === 0 && dc >= 0) { sc = 1; len = dc + 1; }
    else if (dc === 0 && dr >= 0) { sr = 1; len = dr + 1; }
    else return;
    const cells = [];
    for (let i = 0; i < len; i++) cells.push([r1 + sr * i, c1 + sc * i]);
    setCurrent({cells});
  };
  const onEnd = () => {
    if (!dragging || !current) { setDragging(null); setCurrent(null); return; }
    const word = current.cells.map(([r, c]) => game.grid[r][c]).join('');
    const idx = game.words.findIndex((w, i) => !found.includes(i) && w === word);
    if (idx >= 0) {
      const cells = current.cells.slice();
      setFound(f => [...f, idx]);
      setFoundCellsMap(m => { const copy = new Set(m); cells.forEach(([r, c]) => copy.add(r + ',' + c)); return copy; });
      SCPAudio.beep(720, 0.1); setTimeout(() => SCPAudio.beep(1040, 0.14), 90);
    } else { SCPAudio.error(); setShake(true); setTimeout(() => setShake(false), 300); }
    setDragging(null); setCurrent(null);
  };

  const roFound      = readOnlySnapshot ? (readOnlySnapshot.found || []) : found;
  const roFoundCells = readOnlySnapshot ? new Set(readOnlySnapshot.foundCells || []) : foundCellsMap;
  const roCurrent    = readOnlySnapshot ? (readOnlySnapshot.currentCells || []) : (current ? current.cells : []);
  const isInCurrent  = (r, c) => roCurrent.some(([rr, cc]) => rr === r && cc === c);
  const isFoundCell  = (r, c) => roFoundCells.has(r + ',' + c);

  return (
    <>
      <div className="mono t-dim" style={{fontSize: 13, lineHeight: 1.3}}>
        {t ? '> Найдите 3 слова. Только СЛЕВА→НАПРАВО или СВЕРХУ↓ВНИЗ.' : '> Find 3 words. Only LEFT→RIGHT or TOP↓BOTTOM.'}
      </div>
      <div className="hack-words mono" style={{fontSize: 14}}>
        {game.words.map((w, i) => (
          <span key={i} className={roFound.includes(i) ? 't-bright hack-word-found' : 't-dim'}>
            {roFound.includes(i) ? '✓ ' + w : '• ' + w.replace(/./g, '_')}
            {i < game.words.length - 1 ? '   ' : ''}
          </span>
        ))}
      </div>
      <div className="hack-grid-wrap">
        <div
          ref={boardRef}
          className={'hack-grid hack-grid-15' + (shake ? ' hack-shake' : '')}
          onMouseDown={readOnlySnapshot ? undefined : onStart}
          onMouseMove={readOnlySnapshot ? undefined : onMove}
          onMouseUp={readOnlySnapshot ? undefined : onEnd}
          onMouseLeave={readOnlySnapshot ? undefined : onEnd}
          onTouchStart={readOnlySnapshot ? undefined : onStart}
          onTouchMove={readOnlySnapshot ? undefined : onMove}
          onTouchEnd={readOnlySnapshot ? undefined : onEnd}
        >
          {game.grid.map((row, r) => row.map((ch, c) => (
            <div key={r + '-' + c}
              className={'hack-cell' + (isFoundCell(r, c) ? ' found' : '') + (isInCurrent(r, c) ? ' selecting' : '')}>
              {ch}
            </div>
          )))}
        </div>
      </div>
    </>
  );
}

function makeGrid(size, pool) {
  const grid = Array.from({length: size}, () => Array.from({length: size}, () => null));
  const picks = [];
  const shuffled = [...pool].filter(w => w.length >= 4 && w.length <= size).sort(() => Math.random() - 0.5);
  const dirs = [[0, 1], [1, 0]];
  for (const word of shuffled) {
    if (picks.length >= 3) break;
    let placed = false;
    for (let tries = 0; tries < 120 && !placed; tries++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r0 = Math.floor(Math.random() * size), c0 = Math.floor(Math.random() * size);
      const r1 = r0 + dr * (word.length - 1), c1 = c0 + dc * (word.length - 1);
      if (r1 < 0 || r1 >= size || c1 < 0 || c1 >= size) continue;
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i, c = c0 + dc * i;
        if (grid[r][c] !== null && grid[r][c] !== word[i]) { ok = false; break; }
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) { const r = r0 + dr * i, c = c0 + dc * i; grid[r][c] = word[i]; }
      picks.push(word); placed = true;
    }
  }
  const alpha = /[А-ЯЁ]/.test(picks[0] || '') ? 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) {
    if (grid[r][c] === null) grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
  }
  return { grid, words: picks };
}

window.HackGame = HackGame;
window.WordSearchPuzzle = WordSearchPuzzle;

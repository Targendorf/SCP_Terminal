// Мини-игра: поиск слов в сетке 10×10.
// Игрок должен найти 3 случайных слова выделением мышью/тачем по прямой.
// После нахождения всех — выдаёт пароль от случайного терминала.

function HackGame({ lang, state, onSuccess, onCancel }) {
  const SIZE = 10;
  const t = lang === 'ru';

  // Пул слов по языкам, тематические
  const WORDS_RU = ['КЕТЕР','ЕВКЛИД','АНОМАЛ','СЕКТОР','ФОНД','ОБЪЕКТ','ПРОТОКОЛ','АРХИВ','ЗОНА','СОДЕРЖ','СЕКРЕТ','ДОСТУП','ПРОРЫВ','ПРИЗРАК','ВАКЦИНА','БАРЬЕР','СИГНАЛ','РАЗЛОМ','ЦИФРА','МОЛНИЯ','ОКО','ЭХО','ТЕНЬ','ЖРЕЦ'];
  const WORDS_EN = ['KETER','EUCLID','ANOMALY','SECTOR','FOUND','OBJECT','PROTOCOL','ARCHIVE','SITE','CONTAIN','SECRET','ACCESS','BREACH','GHOST','VACCINE','BARRIER','SIGNAL','RIFT','CIPHER','OMEGA','EYE','ECHO','SHADE','PRIEST'];

  // Собираем игру один раз
  const game = React.useMemo(() => makeGrid(SIZE, t ? WORDS_RU : WORDS_EN), [lang]);
  const [found, setFound] = React.useState([]); // индексы слов
  const [dragging, setDragging] = React.useState(null); // {start:[r,c]}
  const [current, setCurrent] = React.useState(null); // {cells:[[r,c]...]}
  const [shake, setShake] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [rewardPw, setRewardPw] = React.useState(null);

  React.useEffect(() => {
    if (found.length === game.words.length && !done) {
      setDone(true);
      SCPAudio.granted();
      // Выдаём случайный пароль из имеющихся терминалов
      const terms = state.terminals;
      if (terms.length > 0) {
        const pick = terms[Math.floor(Math.random() * terms.length)];
        setRewardPw({ pw: pick.password, name: lang === 'ru' ? (pick.nameRu || pick.name) : pick.name });
      }
    }
  }, [found]);

  const cellAt = (e, boardRef) => {
    if (!boardRef.current) return null;
    const rect = boardRef.current.getBoundingClientRect();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const cw = rect.width / SIZE;
    const ch = rect.height / SIZE;
    const c = Math.floor(x / cw);
    const r = Math.floor(y / ch);
    if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return null;
    return [r, c];
  };

  const boardRef = React.useRef(null);

  const onStart = (e) => {
    e.preventDefault();
    const cell = cellAt(e, boardRef);
    if (!cell) return;
    setDragging({ start: cell });
    setCurrent({ cells: [cell] });
    SCPAudio.key();
  };
  const onMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const cell = cellAt(e, boardRef);
    if (!cell) return;
    const [r1, c1] = dragging.start;
    const [r2, c2] = cell;
    const dr = r2 - r1, dc = c2 - c1;
    // Только 8 направлений
    const adr = Math.abs(dr), adc = Math.abs(dc);
    if (adr !== 0 && adc !== 0 && adr !== adc) return; // не валидная линия
    const len = Math.max(adr, adc) + 1;
    const sr = Math.sign(dr), sc = Math.sign(dc);
    const cells = [];
    for (let i = 0; i < len; i++) cells.push([r1 + sr * i, c1 + sc * i]);
    setCurrent({ cells });
  };
  const onEnd = () => {
    if (!dragging || !current) { setDragging(null); setCurrent(null); return; }
    // Собираем строку
    const word = current.cells.map(([r, c]) => game.grid[r][c]).join('');
    const rev = word.split('').reverse().join('');
    const idx = game.words.findIndex((w, i) => !found.includes(i) && (w === word || w === rev));
    if (idx >= 0) {
      const newCells = current.cells.slice();
      setFound(f => [...f, idx]);
      // Сохраняем подсветку
      setFoundCellsMap(m => {
        const copy = new Set(m);
        newCells.forEach(([r, c]) => copy.add(r + ',' + c));
        return copy;
      });
      SCPAudio.beep(720, 0.1);
      setTimeout(() => SCPAudio.beep(1040, 0.14), 90);
    } else {
      SCPAudio.error();
      setShake(true);
      setTimeout(() => setShake(false), 300);
    }
    setDragging(null);
    setCurrent(null);
  };

  const [foundCellsMap, setFoundCellsMap] = React.useState(new Set());

  const isInCurrent = (r, c) => current && current.cells.some(([rr, cc]) => rr === r && cc === c);
  const isFound = (r, c) => foundCellsMap.has(r + ',' + c);

  return (
    <div className="modal-overlay" style={{overflowY: 'auto', padding: '10px', alignItems: 'flex-start'}}>
      <div className="modal hack-modal">
        <h3 className="t-amber" style={{margin: 0}}>{t ? '[ВИРУС-ДИСКЕТА АКТИВИРОВАНА]' : '[VIRUS DISK ACTIVE]'}</h3>
        <div className="mono t-dim" style={{fontSize: 13, lineHeight: 1.3}}>
          {t
            ? '> Найдите 3 скрытых слова. Выделите буквы мышью или пальцем.'
            : '> Find 3 hidden words. Drag with mouse or finger to select.'}
        </div>

        <div className="hack-words mono" style={{fontSize: 14}}>
          {game.words.map((w, i) => (
            <span key={i} className={found.includes(i) ? 't-bright hack-word-found' : 't-dim'}>
              {found.includes(i) ? '✓ ' + w : '• ' + w.replace(/./g, '_')}
              {i < game.words.length - 1 ? '   ' : ''}
            </span>
          ))}
        </div>

        <div className="hack-grid-wrap">
        <div
          ref={boardRef}
          className={'hack-grid' + (shake ? ' hack-shake' : '')}
          onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
          onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
        >
          {game.grid.map((row, r) => row.map((ch, c) => (
            <div
              key={r + '-' + c}
              className={'hack-cell' + (isFound(r, c) ? ' found' : '') + (isInCurrent(r, c) ? ' selecting' : '')}
            >{ch}</div>
          )))}
        </div>
        </div>

        {done && rewardPw && (
          <div className="mono" style={{padding: 8, border: '1px solid var(--phosphor)', fontSize: 14}}>
            <div className="t-bright">{t ? '>> ДОСТУП РАЗРЕШЁН <<' : '>> ACCESS GRANTED <<'}</div>
            <div className="t-dim">{t ? 'Пароль от ' : 'Password for '}{rewardPw.name}:</div>
            <div className="t-amber" style={{fontSize: 22, letterSpacing: '0.1em', marginTop: 4}}>{rewardPw.pw}</div>
          </div>
        )}

        <div className="modal-actions" style={{marginTop: 4}}>
          <button className="btn" onClick={onCancel}>{t ? 'ОТМЕНА' : 'CANCEL'}</button>
          {done && <button className="btn" onClick={() => onSuccess(rewardPw)}>{t ? 'ИСПОЛЬЗОВАТЬ' : 'USE'}</button>}
        </div>
      </div>
    </div>
  );
}

// Сборщик сетки с 3 случайными словами
function makeGrid(size, pool) {
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => null));
  // выбираем 3 слова, которые поместятся
  const picks = [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const dirs = [
    [0, 1], [1, 0], [1, 1], [-1, 1], // → ↓ ↘ ↗
    [0, -1], [-1, 0], [-1, -1], [1, -1], // обратные
  ];
  for (const word of shuffled) {
    if (picks.length >= 3) break;
    if (word.length > size) continue;
    let placed = false;
    for (let tries = 0; tries < 80 && !placed; tries++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r0 = Math.floor(Math.random() * size);
      const c0 = Math.floor(Math.random() * size);
      const r1 = r0 + dr * (word.length - 1);
      const c1 = c0 + dc * (word.length - 1);
      if (r1 < 0 || r1 >= size || c1 < 0 || c1 >= size) continue;
      let ok = true;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i, c = c0 + dc * i;
        if (grid[r][c] !== null && grid[r][c] !== word[i]) { ok = false; break; }
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i++) {
        const r = r0 + dr * i, c = c0 + dc * i;
        grid[r][c] = word[i];
      }
      picks.push(word);
      placed = true;
    }
  }
  // Заполняем пустые клетки случайными буквами
  const alpha = /[А-ЯЁ]/.test(picks[0] || '') ? 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === null) grid[r][c] = alpha[Math.floor(Math.random() * alpha.length)];
    }
  }
  return { grid, words: picks };
}

window.HackGame = HackGame;

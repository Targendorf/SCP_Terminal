// Дополнительные головоломки для /hack. Каждая — самостоятельный React-компонент
// с контрактом: props { lang, onWin }, вызывает onWin() при успехе.

// =====================================================================
// 1. SEQUENCE LOCK — повторить последовательность (Simon Says)
// =====================================================================
function SequencePuzzle({ lang, onWin }) {
  const t = lang === 'ru';
  const SYMBOLS = ['▲', '◆', '●', '■', '★'];
  const COLORS = ['#ff5566', '#ffb000', '#66ccff', '#33ff66', '#cc88ff'];
  const TOTAL_ROUNDS = 4;
  const START_LEN = 3;

  const [round, setRound] = React.useState(1);
  const [seq, setSeq] = React.useState(() => gen(START_LEN));
  const [flash, setFlash] = React.useState(-1);
  const [userIdx, setUserIdx] = React.useState(0);
  const [phase, setPhase] = React.useState('show'); // show | input | fail
  const [errors, setErrors] = React.useState(0);
  const wonRef = React.useRef(false);

  function gen(n) { return Array.from({length: n}, () => Math.floor(Math.random() * SYMBOLS.length)); }

  React.useEffect(() => {
    if (phase !== 'show') return;
    let i = 0, timer;
    const step = () => {
      if (i >= seq.length) { setFlash(-1); setPhase('input'); setUserIdx(0); return; }
      const s = seq[i];
      setFlash(s);
      SCPAudio.beep(400 + s * 120, 0.18);
      timer = setTimeout(() => { setFlash(-1); i++; timer = setTimeout(step, 220); }, 500);
    };
    const t0 = setTimeout(step, 600);
    return () => { clearTimeout(t0); clearTimeout(timer); };
  }, [phase, seq]);

  const press = (i) => {
    if (phase !== 'input') return;
    SCPAudio.beep(400 + i * 120, 0.12);
    setFlash(i);
    setTimeout(() => setFlash(-1), 140);
    if (seq[userIdx] === i) {
      const next = userIdx + 1;
      if (next === seq.length) {
        if (round >= TOTAL_ROUNDS) {
          if (!wonRef.current) { wonRef.current = true; onWin(); }
        } else {
          setRound(r => r + 1);
          setSeq(gen(START_LEN + round));
          setPhase('show');
        }
      } else setUserIdx(next);
    } else {
      SCPAudio.error();
      const e = errors + 1; setErrors(e);
      if (e >= 3) { setErrors(0); setRound(1); setSeq(gen(START_LEN)); setPhase('show'); }
      else setPhase('show');
    }
  };

  return (
    <div className="seq-box">
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Запомните последовательность и повторите её нажатиями.' : '> Memorize the sequence and tap it back.'}
      </div>
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? 'РАУНД' : 'ROUND'}: {round}/{TOTAL_ROUNDS} · {t ? 'ОШИБКИ' : 'ERRORS'}: {errors}/3
      </div>
      <div className="seq-pads">
        {SYMBOLS.map((s, i) => (
          <button
            key={i}
            className={'seq-pad' + (flash === i ? ' on' : '')}
            style={{'--pad-color': COLORS[i]}}
            onClick={() => press(i)}
            disabled={phase === 'show'}
          >{s}</button>
        ))}
      </div>
      <div className="mono t-dim" style={{fontSize: 12, textAlign: 'center'}}>
        {phase === 'show' ? (t ? '// ТРАНСЛЯЦИЯ //' : '// TRANSMITTING //') : (t ? '// ВВОД //' : '// INPUT //')}
      </div>
    </div>
  );
}

// =====================================================================
// 2. WIRE TRACE — провести точку по ASCII-лабиринту
// =====================================================================
function WirePuzzle({ lang, onWin }) {
  const t = lang === 'ru';
  const W = 17, H = 11; // нечётные
  const maze = React.useMemo(() => carveMaze(W, H), []);
  const [pos, setPos] = React.useState([1, 1]);
  const goal = [W - 2, H - 2];
  const wonRef = React.useRef(false);

  React.useEffect(() => {
    const h = (e) => {
      if (wonRef.current) return;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx = 1;
      else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dy = 1;
      else return;
      e.preventDefault();
      setPos(p => {
        const nx = p[0] + dx, ny = p[1] + dy;
        if (ny < 0 || ny >= H || nx < 0 || nx >= W) return p;
        if (maze[ny][nx] === 1) return p;
        SCPAudio.key();
        if (nx === goal[0] && ny === goal[1] && !wonRef.current) { wonRef.current = true; onWin(); }
        return [nx, ny];
      });
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [maze]);

  return (
    <div className="wire-box">
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Проведите ◉ к цели ◎. Клавиши ← ↑ → ↓ или WASD.' : '> Guide ◉ to ◎. Use ← ↑ → ↓ or WASD.'}
      </div>
      <pre className="wire-maze">
{maze.map((row, y) => row.map((c, x) => {
  const isP = x === pos[0] && y === pos[1];
  const isG = x === goal[0] && y === goal[1];
  return isP ? '◉' : isG ? '◎' : (c ? '█' : '·');
}).join('')).join('\n')}
      </pre>
    </div>
  );
}

function carveMaze(W, H) {
  const g = Array.from({length: H}, () => Array.from({length: W}, () => 1));
  const stack = [[1, 1]];
  g[1][1] = 0;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    const dirs = [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5);
    let carved = false;
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (nx > 0 && nx < W - 1 && ny > 0 && ny < H - 1 && g[ny][nx] === 1) {
        g[y + dy / 2][x + dx / 2] = 0;
        g[ny][nx] = 0;
        stack.push([nx, ny]);
        carved = true;
        break;
      }
    }
    if (!carved) stack.pop();
  }
  g[H - 2][W - 2] = 0;
  return g;
}

// =====================================================================
// 3. CIPHER DECODE — шифр Цезаря. Игрок двигает сдвиг до читаемости.
// =====================================================================
function CipherPuzzle({ lang, onWin }) {
  const t = lang === 'ru';
  const ALPHA = t ? 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const PHRASES_RU = ['ПРОРЫВ ПЕРИМЕТРА СЕКТОР СЕМЬ', 'ПРОТОКОЛ ОМЕГА АКТИВЕН', 'ДОСТУП РАЗРЕШЕН УРОВЕНЬ ПЯТЬ', 'ЭВАКУАЦИЯ ПЕРСОНАЛА КЛАСС КЕТЕР', 'КОНТЕЙНМЕНТ НАРУШЕН ПОВТОРЯЮ НАРУШЕН'];
  const PHRASES_EN = ['CONTAINMENT BREACH SECTOR SEVEN', 'OMEGA PROTOCOL ACTIVE', 'ACCESS AUTHORIZED LEVEL FIVE', 'EVACUATE PERSONNEL CLASS KETER', 'PERIMETER COMPROMISED REPEAT COMPROMISED'];

  const { target, encrypted, rightShift } = React.useMemo(() => {
    const list = t ? PHRASES_RU : PHRASES_EN;
    const phrase = list[Math.floor(Math.random() * list.length)];
    const sh = 3 + Math.floor(Math.random() * (ALPHA.length - 5));
    return { target: phrase, encrypted: caesarShift(phrase, sh, ALPHA), rightShift: sh };
  }, []);

  const [userShift, setUserShift] = React.useState(0);
  const decrypted = caesarShift(encrypted, -userShift, ALPHA);
  const [msg, setMsg] = React.useState(null);
  const wonRef = React.useRef(false);

  const tryLock = () => {
    if (decrypted === target) {
      if (!wonRef.current) { wonRef.current = true; SCPAudio.granted(); onWin(); }
    } else {
      SCPAudio.error();
      setMsg(t ? 'ТЕКСТ НЕ ЧИТАЕТСЯ' : 'TEXT UNREADABLE');
      setTimeout(() => setMsg(null), 1200);
    }
  };

  return (
    <div className="cipher-box">
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Подберите сдвиг, чтобы расшифровать перехват.' : '> Adjust the shift to decode the intercept.'}
      </div>
      <div className="cipher-field">
        <div className="t-dim" style={{fontSize: 12}}>ENCRYPTED //</div>
        <div className="cipher-text t-amber">{encrypted}</div>
      </div>
      <div className="cipher-controls">
        <button className="btn" onClick={() => { setUserShift(s => (s - 1 + ALPHA.length) % ALPHA.length); SCPAudio.key(); }}>‹ −1</button>
        <div className="cipher-shift t-bright">SHIFT = {userShift}</div>
        <button className="btn" onClick={() => { setUserShift(s => (s + 1) % ALPHA.length); SCPAudio.key(); }}>+1 ›</button>
      </div>
      <div className="cipher-field">
        <div className="t-dim" style={{fontSize: 12}}>DECRYPTED //</div>
        <div className="cipher-text t-bright">{decrypted}</div>
      </div>
      {msg && <div className="mono t-red" style={{textAlign: 'center'}}>{'>> ' + msg + ' <<'}</div>}
      <button className="btn" onClick={tryLock} style={{alignSelf: 'center', minWidth: 140}}>
        {t ? 'ПОДТВЕРДИТЬ' : 'LOCK'}
      </button>
    </div>
  );
}
function caesarShift(text, shift, alpha) {
  const n = alpha.length;
  return text.split('').map(ch => {
    const i = alpha.indexOf(ch);
    if (i < 0) return ch;
    return alpha[((i + shift) % n + n) % n];
  }).join('');
}

// =====================================================================
// 4. MEMORY GRID — запомнить подсвеченные клетки и кликнуть их снова
// =====================================================================
function MemoryPuzzle({ lang, onWin }) {
  const t = lang === 'ru';
  const SIZE = 5;
  const ROUNDS = 3;
  const [round, setRound] = React.useState(0);
  const [phase, setPhase] = React.useState('show');
  const [target, setTarget] = React.useState(new Set());
  const [picked, setPicked] = React.useState(new Set());
  const [err, setErr] = React.useState(false);
  const wonRef = React.useRef(false);

  const startRound = (r) => {
    const n = 3 + r;
    const set = new Set();
    while (set.size < n) set.add(Math.floor(Math.random() * SIZE * SIZE));
    setTarget(set);
    setPicked(new Set());
    setPhase('show');
    setTimeout(() => setPhase('input'), 1800 + r * 300);
  };

  React.useEffect(() => { startRound(0); }, []);

  const click = (i) => {
    if (phase !== 'input') return;
    if (!target.has(i)) {
      SCPAudio.error();
      setErr(true); setTimeout(() => setErr(false), 250);
      return;
    }
    if (picked.has(i)) return;
    const np = new Set([...picked, i]);
    setPicked(np);
    SCPAudio.beep(560 + np.size * 80, 0.12);
    if (np.size === target.size) {
      if (round + 1 >= ROUNDS) {
        if (!wonRef.current) { wonRef.current = true; onWin(); }
      } else {
        setRound(r => r + 1);
        setTimeout(() => startRound(round + 1), 500);
      }
    }
  };

  return (
    <div className={'memgrid-box' + (err ? ' err' : '')}>
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Запомните клетки и нажмите их после отсчёта.' : '> Memorize the cells and tap them back.'}
      </div>
      <div className="mono t-dim" style={{fontSize: 13, textAlign: 'center'}}>
        {t ? 'РАУНД' : 'ROUND'}: {round + 1}/{ROUNDS} · {phase === 'show' ? (t ? 'ЗАПОМНИТЕ' : 'MEMORIZE') : (t ? 'ВВОД' : 'INPUT')}
      </div>
      <div className="memgrid">
        {Array.from({length: SIZE * SIZE}, (_, i) => {
          const show = phase === 'show' && target.has(i);
          const pick = picked.has(i);
          return <div key={i} className={'memcell' + (show ? ' hl' : '') + (pick ? ' picked' : '')} onClick={() => click(i)}></div>;
        })}
      </div>
    </div>
  );
}

// =====================================================================
// 5. PIPE CONNECT — поворачивай сегменты, соедини вход с выходом
// =====================================================================
function PipePuzzle({ lang, onWin }) {
  const t = lang === 'ru';
  const W = 5, H = 4;
  const START = { x: 0, y: 1 };
  const END = { x: W - 1, y: H - 2 };

  const makeBoard = () => {
    const PIECES = [5, 10, 3, 6, 12, 9, 7, 14, 13, 11];
    const b = [];
    for (let y = 0; y < H; y++) {
      const row = [];
      for (let x = 0; x < W; x++) row.push(PIECES[Math.floor(Math.random() * PIECES.length)]);
      b.push(row);
    }
    return b;
  };
  const [board, setBoard] = React.useState(makeBoard);
  const wonRef = React.useRef(false);

  const rotate = (x, y) => {
    setBoard(b => {
      const nb = b.map(r => r.slice());
      const m = nb[y][x];
      nb[y][x] = ((m << 1) & 15) | ((m & 8) ? 1 : 0);
      return nb;
    });
    SCPAudio.key();
  };

  const connected = React.useMemo(() => {
    const visited = new Set([START.x + ',' + START.y]);
    const q = [START];
    const D = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    while (q.length) {
      const { x, y } = q.shift();
      if (x === END.x && y === END.y) return true;
      const m = board[y][x];
      for (const [dx, dy, mb, tb] of D) {
        if (!(m & mb)) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const k = nx + ',' + ny;
        if (visited.has(k)) continue;
        if (!(board[ny][nx] & tb)) continue;
        visited.add(k); q.push({ x: nx, y: ny });
      }
    }
    return false;
  }, [board]);

  React.useEffect(() => {
    if (connected && !wonRef.current) { wonRef.current = true; onWin(); }
  }, [connected]);

  return (
    <div className="pipe-box">
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Кликайте по трубам — они вращаются. Соедините вход [←] с выходом [→].' : '> Click pipes to rotate. Connect inlet [←] to outlet [→].'}
      </div>
      <div className="pipe-wrap">
        <div className="pipe-port">◄</div>
        <div className="pipe-grid" style={{gridTemplateColumns: `repeat(${W}, 1fr)`}}>
          {board.map((row, y) => row.map((m, x) => (
            <div key={x + '-' + y}
              className={'pipe-cell' + ((x === START.x && y === START.y) ? ' start' : '') + ((x === END.x && y === END.y) ? ' end' : '')}
              onClick={() => rotate(x, y)}>
              {pipeChar(m)}
            </div>
          )))}
        </div>
        <div className="pipe-port">►</div>
      </div>
    </div>
  );
}
function pipeChar(m) {
  const map = { 0:' ', 5:'│', 10:'─', 15:'┼', 3:'└', 6:'┌', 12:'┐', 9:'┘', 7:'├', 14:'┬', 13:'┤', 11:'┴', 1:'╵', 2:'╶', 4:'╷', 8:'╴' };
  return map[m] || '·';
}

// =====================================================================
// 6. FREQUENCY LOCK — поймай сигнал в узкой полосе
// =====================================================================
function FrequencyPuzzle({ lang, onWin }) {
  const t = lang === 'ru';
  const targetRef = React.useRef(null);
  if (targetRef.current === null) targetRef.current = 15 + Math.random() * 70;
  const target = targetRef.current;
  const tolerance = 1.8;
  const [val, setVal] = React.useState(50);
  const [timeLeft, setTimeLeft] = React.useState(20);
  const [msg, setMsg] = React.useState(null);
  const wonRef = React.useRef(false);

  React.useEffect(() => {
    if (wonRef.current) return;
    const id = setInterval(() => setTimeLeft(x => Math.max(0, +(x - 0.1).toFixed(1))), 100);
    return () => clearInterval(id);
  }, []);

  const dist = Math.abs(val - target);
  const strength = Math.max(0, Math.min(1, 1 - dist / 35));
  const blocks = Math.round(strength * 24);

  const tryLock = () => {
    if (timeLeft <= 0) return;
    if (dist <= tolerance) {
      if (!wonRef.current) { wonRef.current = true; SCPAudio.granted(); onWin(); }
    } else {
      SCPAudio.error();
      setMsg(t ? 'ПОМЕХИ. ПРОДОЛЖАЙТЕ НАСТРОЙКУ.' : 'NOISE. KEEP TUNING.');
      setTimeout(() => setMsg(null), 1000);
    }
  };

  return (
    <div className="freq-box">
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Найдите несущую частоту. Лочьте, когда сигнал чистый.' : '> Find the carrier frequency. Lock when the signal is clean.'}
      </div>
      <div className="freq-stat">
        <div>{t ? 'ЧАСТОТА' : 'FREQ'}: <span className="t-bright">{val.toFixed(1)}</span> MHz</div>
        <div>{t ? 'ОСТАЛОСЬ' : 'TIME'}: <span className={timeLeft < 5 ? 't-red' : 't-bright'}>{timeLeft.toFixed(1)}s</span></div>
      </div>
      <div className="freq-meter">
        <div className="freq-bar" style={{width: (strength * 100) + '%'}}></div>
      </div>
      <div className="mono t-amber" style={{letterSpacing: '0.1em', fontSize: 15, textAlign: 'center'}}>
        [{'█'.repeat(blocks)}{'·'.repeat(24 - blocks)}]
      </div>
      <input type="range" min="0" max="100" step="0.1" value={val} className="freq-slider"
        onChange={e => setVal(+e.target.value)} disabled={timeLeft <= 0} />
      {msg && <div className="mono t-red" style={{textAlign: 'center'}}>{'>> ' + msg + ' <<'}</div>}
      <button className="btn" onClick={tryLock} disabled={timeLeft <= 0} style={{alignSelf: 'center', minWidth: 140}}>
        {t ? 'ЗАХВАТ' : 'LOCK'}
      </button>
    </div>
  );
}

// =====================================================================
// 7. SPEED TYPER — ввести код за 15 секунд
// =====================================================================
function TyperPuzzle({ lang, onWin }) {
  const t = lang === 'ru';
  const target = React.useMemo(() => {
    const parts = ['SCP', String(Math.floor(Math.random() * 900 + 100)), 'ACC', randHex(6), randHex(4)];
    return parts.join('-');
  }, []);
  const [input, setInput] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(15);
  const [msg, setMsg] = React.useState(null);
  const ref = React.useRef(null);
  const wonRef = React.useRef(false);

  React.useEffect(() => { if (ref.current) ref.current.focus(); }, []);
  React.useEffect(() => {
    if (timeLeft <= 0 || wonRef.current) return;
    const id = setInterval(() => setTimeLeft(x => Math.max(0, +(x - 0.1).toFixed(1))), 100);
    return () => clearInterval(id);
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (timeLeft <= 0) return;
    if (input === target) {
      if (!wonRef.current) { wonRef.current = true; SCPAudio.granted(); onWin(); }
    } else {
      SCPAudio.error();
      setMsg(t ? 'НЕТОЧНЫЙ КОД' : 'CODE MISMATCH');
      setTimeout(() => setMsg(null), 900);
    }
  };

  const diff = target.split('').map((ch, i) => {
    const u = input[i];
    if (u === undefined) return <span key={i} className="t-dim">{ch}</span>;
    if (u === ch) return <span key={i} className="t-bright">{ch}</span>;
    return <span key={i} className="t-red">{u}</span>;
  });

  return (
    <form onSubmit={onSubmit} className="typer-box">
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Введите код ТОЧНО, как показан. Время ограничено.' : '> Type the code EXACTLY as shown. Time is limited.'}
      </div>
      <div className="mono" style={{textAlign: 'center'}}>
        <div className="t-dim" style={{fontSize: 12}}>{t ? 'ЦЕЛЬ' : 'TARGET'}</div>
        <div className="typer-target t-amber">{target}</div>
      </div>
      <div className="mono" style={{textAlign: 'center'}}>
        <div className="t-dim" style={{fontSize: 12}}>{t ? 'ВВОД' : 'INPUT'}</div>
        <div className="typer-diff">{diff}</div>
      </div>
      <input ref={ref} className="typer-input" value={input}
        onChange={e => { setInput(e.target.value); SCPAudio.key(); }}
        disabled={timeLeft <= 0} spellCheck="false" autoComplete="off" />
      <div className="mono t-dim" style={{textAlign: 'center'}}>
        {t ? 'ОСТАЛОСЬ' : 'TIME'}: <span className={timeLeft < 5 ? 't-red' : 't-bright'}>{timeLeft.toFixed(1)}s</span>
      </div>
      {msg && <div className="mono t-red" style={{textAlign: 'center'}}>{'>> ' + msg + ' <<'}</div>}
      <button type="submit" className="btn" disabled={timeLeft <= 0} style={{alignSelf: 'center', minWidth: 140}}>
        {t ? 'ПОДТВЕРДИТЬ' : 'SUBMIT'}
      </button>
    </form>
  );
}
function randHex(n) {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({length: n}, () => a[Math.floor(Math.random() * a.length)]).join('');
}

window.SequencePuzzle = SequencePuzzle;
window.WirePuzzle = WirePuzzle;
window.CipherPuzzle = CipherPuzzle;
window.MemoryPuzzle = MemoryPuzzle;
window.PipePuzzle = PipePuzzle;
window.FrequencyPuzzle = FrequencyPuzzle;
window.TyperPuzzle = TyperPuzzle;

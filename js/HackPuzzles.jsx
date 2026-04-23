// Дополнительные головоломки для /hack. Каждая — самостоятельный React-компонент
// с контрактом: props { lang, onWin, onStateChange?, readOnlySnapshot? }, вызывает onWin() при успехе.

// =====================================================================
// 1. SEQUENCE LOCK — повторить последовательность (Simon Says)
// =====================================================================
function SequencePuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
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
    if (onStateChange) onStateChange({ phase, round, flash, errors });
  }, [phase, round, flash, errors]);

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

  const dp            = readOnlySnapshot || {};
  const displayPhase  = readOnlySnapshot ? dp.phase  : phase;
  const displayRound  = readOnlySnapshot ? dp.round  : round;
  const displayFlash  = readOnlySnapshot ? dp.flash  : flash;
  const displayErrors = readOnlySnapshot ? dp.errors : errors;

  return (
    <div className="seq-box">
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Запомните последовательность и повторите её нажатиями.' : '> Memorize the sequence and tap it back.'}
      </div>
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? 'РАУНД' : 'ROUND'}: {displayRound}/{TOTAL_ROUNDS} · {t ? 'ОШИБКИ' : 'ERRORS'}: {displayErrors}/3
      </div>
      <div className="seq-pads">
        {SYMBOLS.map((s, i) => (
          <button
            key={i}
            className={'seq-pad' + (displayFlash === i ? ' on' : '')}
            style={{'--pad-color': COLORS[i]}}
            onClick={readOnlySnapshot ? undefined : () => press(i)}
            disabled={displayPhase === 'show' || !!readOnlySnapshot}
          >{s}</button>
        ))}
      </div>
      <div className="mono t-dim" style={{fontSize: 12, textAlign: 'center'}}>
        {displayPhase === 'show' ? (t ? '// ТРАНСЛЯЦИЯ //' : '// TRANSMITTING //') : (t ? '// ВВОД //' : '// INPUT //')}
      </div>
    </div>
  );
}

// =====================================================================
// 3. CIPHER DECODE — шифр Цезаря. Игрок двигает сдвиг до читаемости.
// =====================================================================
function CipherPuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
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

  React.useEffect(() => {
    if (onStateChange) onStateChange({ userShift });
  }, [userShift]);

  const tryLock = () => {
    if (decrypted === target) {
      if (!wonRef.current) { wonRef.current = true; SCPAudio.granted(); onWin(); }
    } else {
      SCPAudio.error();
      setMsg(t ? 'ТЕКСТ НЕ ЧИТАЕТСЯ' : 'TEXT UNREADABLE');
      setTimeout(() => setMsg(null), 1200);
    }
  };

  const displayShift     = readOnlySnapshot ? (readOnlySnapshot.userShift || 0) : userShift;
  const displayDecrypted = caesarShift(encrypted, -displayShift, ALPHA);

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
        <button className="btn"
          onClick={readOnlySnapshot ? undefined : () => { setUserShift(s => (s - 1 + ALPHA.length) % ALPHA.length); SCPAudio.key(); }}
          disabled={!!readOnlySnapshot}>‹ −1</button>
        <div className="cipher-shift t-bright">SHIFT = {displayShift}</div>
        <button className="btn"
          onClick={readOnlySnapshot ? undefined : () => { setUserShift(s => (s + 1) % ALPHA.length); SCPAudio.key(); }}
          disabled={!!readOnlySnapshot}>+1 ›</button>
      </div>
      <div className="cipher-field">
        <div className="t-dim" style={{fontSize: 12}}>DECRYPTED //</div>
        <div className="cipher-text t-bright">{displayDecrypted}</div>
      </div>
      {msg && <div className="mono t-red" style={{textAlign: 'center'}}>{'>> ' + msg + ' <<'}</div>}
      <button className="btn"
        onClick={readOnlySnapshot ? undefined : tryLock}
        disabled={!!readOnlySnapshot}
        style={{alignSelf: 'center', minWidth: 140}}>
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
function MemoryPuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
  const t = lang === 'ru';
  const SIZE = 5;
  const ROUNDS = 3;
  const [round, setRound] = React.useState(0);
  const [phase, setPhase] = React.useState('show');
  const [target, setTarget] = React.useState(new Set());
  const [picked, setPicked] = React.useState(new Set());
  const [err, setErr] = React.useState(false);
  const wonRef = React.useRef(false);

  React.useEffect(() => {
    if (onStateChange) onStateChange({
      phase, round,
      target: Array.from(target),
      picked: Array.from(picked),
    });
  }, [phase, round, target, picked]);

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

  const dp            = readOnlySnapshot || {};
  const displayPhase  = readOnlySnapshot ? dp.phase  : phase;
  const displayRound  = readOnlySnapshot ? dp.round  : round;
  const displayTarget = readOnlySnapshot ? new Set(dp.target || []) : target;
  const displayPicked = readOnlySnapshot ? new Set(dp.picked || []) : picked;

  return (
    <div className={'memgrid-box' + (err ? ' err' : '')}>
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Запомните клетки и нажмите их после отсчёта.' : '> Memorize the cells and tap them back.'}
      </div>
      <div className="mono t-dim" style={{fontSize: 13, textAlign: 'center'}}>
        {t ? 'РАУНД' : 'ROUND'}: {displayRound + 1}/{ROUNDS} · {displayPhase === 'show' ? (t ? 'ЗАПОМНИТЕ' : 'MEMORIZE') : (t ? 'ВВОД' : 'INPUT')}
      </div>
      <div className="memgrid">
        {Array.from({length: SIZE * SIZE}, (_, i) => {
          const show = displayPhase === 'show' && displayTarget.has(i);
          const pick = displayPicked.has(i);
          return (
            <div
              key={i}
              className={'memcell' + (show ? ' hl' : '') + (pick ? ' picked' : '')}
              onClick={readOnlySnapshot ? undefined : () => click(i)}
            ></div>
          );
        })}
      </div>
    </div>
  );
}

// =====================================================================
// 5. PIPE CONNECT — поворачивай сегменты, соедини вход с выходом
// =====================================================================
function PipePuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
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

  React.useEffect(() => {
    if (onStateChange) onStateChange({ board });
  }, [board]);

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
    const b = readOnlySnapshot ? (readOnlySnapshot.board || board) : board;
    const visited = new Set([START.x + ',' + START.y]);
    const q = [START];
    const D = [[0, -1, 1, 4], [1, 0, 2, 8], [0, 1, 4, 1], [-1, 0, 8, 2]];
    while (q.length) {
      const { x, y } = q.shift();
      if (x === END.x && y === END.y) return true;
      const m = b[y][x];
      for (const [dx, dy, mb, tb] of D) {
        if (!(m & mb)) continue;
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue;
        const k = nx + ',' + ny;
        if (visited.has(k)) continue;
        if (!(b[ny][nx] & tb)) continue;
        visited.add(k); q.push({ x: nx, y: ny });
      }
    }
    return false;
  }, [readOnlySnapshot, board]);

  React.useEffect(() => {
    if (connected && !wonRef.current && !readOnlySnapshot) { wonRef.current = true; onWin(); }
  }, [connected]);

  const displayBoard = readOnlySnapshot ? (readOnlySnapshot.board || board) : board;

  return (
    <div className="pipe-box">
      <div className="mono t-dim" style={{fontSize: 13}}>
        {t ? '> Кликайте по трубам — они вращаются. Соедините вход [←] с выходом [→].' : '> Click pipes to rotate. Connect inlet [←] to outlet [→].'}
      </div>
      <div className="pipe-wrap">
        <div className="pipe-port">◄</div>
        <div className="pipe-grid" style={{gridTemplateColumns: `repeat(${W}, 1fr)`}}>
          {displayBoard.map((row, y) => row.map((m, x) => (
            <div key={x + '-' + y}
              className={'pipe-cell' + ((x === START.x && y === START.y) ? ' start' : '') + ((x === END.x && y === END.y) ? ' end' : '')}
              onClick={readOnlySnapshot ? undefined : () => rotate(x, y)}>
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
// 7. SPEED TYPER — ввести код за 15 секунд
// =====================================================================
function TyperPuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
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

  React.useEffect(() => {
    if (onStateChange) onStateChange({ input, timeLeft });
  }, [input, timeLeft]);

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

  const displayInput    = readOnlySnapshot ? (readOnlySnapshot.input    || '')       : input;
  const displayTimeLeft = readOnlySnapshot ? (readOnlySnapshot.timeLeft ?? timeLeft) : timeLeft;

  const diff = target.split('').map((ch, i) => {
    const u = displayInput[i];
    if (u === undefined) return <span key={i} className="t-dim">{ch}</span>;
    if (u === ch)        return <span key={i} className="t-bright">{ch}</span>;
    return <span key={i} className="t-red">{u}</span>;
  });

  return (
    <form onSubmit={readOnlySnapshot ? e => e.preventDefault() : onSubmit} className="typer-box">
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
      <input ref={ref} className="typer-input" value={displayInput}
        onChange={readOnlySnapshot ? undefined : e => { setInput(e.target.value); SCPAudio.key(); }}
        disabled={timeLeft <= 0 || !!readOnlySnapshot}
        spellCheck="false" autoComplete="off" />
      <div className="mono t-dim" style={{textAlign: 'center'}}>
        {t ? 'ОСТАЛОСЬ' : 'TIME'}: <span className={displayTimeLeft < 5 ? 't-red' : 't-bright'}>{displayTimeLeft.toFixed(1)}s</span>
      </div>
      {msg && <div className="mono t-red" style={{textAlign: 'center'}}>{'>> ' + msg + ' <<'}</div>}
      <button type="submit" className="btn"
        disabled={displayTimeLeft <= 0 || !!readOnlySnapshot}
        style={{alignSelf: 'center', minWidth: 140}}>
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
window.CipherPuzzle = CipherPuzzle;
window.MemoryPuzzle = MemoryPuzzle;
window.PipePuzzle = PipePuzzle;
window.TyperPuzzle = TyperPuzzle;

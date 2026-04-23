# SCP Terminal — Viewer Sync & UX Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 issues: (1) title alignment, (2) puzzle CSS responsiveness, (3) full viewer mirroring of password typing + hack game state, (4) cursor cleanup on tab close.

**Architecture:** Lift hack game state to `App.jsx`; broadcast `{pwInput, hackOpen, hackDone, hackReward, hackPuzzleType, hackSnapshot}` via existing `SCPSession.broadcastState`. Each puzzle emits snapshots via `onStateChange` prop (throttled 100 ms). Viewers render `HackGame readOnly` consuming the received snapshot. Cursors get a 5-second TTL purge loop on the host plus a best-effort `beforeunload` goodbye message.

**Tech Stack:** React 18 via Babel standalone (no build step, no test framework), PeerJS WebRTC, CSS custom properties, VT323 monospace. All components exported as `window.Xxx`.

---

## File Map

| File | What changes |
|------|-------------|
| `css/crt.css` | `.ascii-title` smaller clamp; `.seq-pad`, `.wire-maze`, `.pipe-cell`, `.memgrid` use clamp/min |
| `js/PasswordScreen.jsx` | New props: `onPwChange`, `syncPwInput`, `hackHostCallbacks`, `hackViewState`; viewer pw mirror display; viewer HackGame overlay |
| `js/HackGame.jsx` | New props: `readOnly`, `viewState`, `onSnapshot`, `onDone`; active puzzle from viewState; handleSnapshot throttle; WordSearchPuzzle snapshot |
| `js/HackPuzzles.jsx` | All 7 puzzles: `onStateChange(snapshot)` + `readOnlySnapshot` props |
| `js/App.jsx` | 6 new state vars; updated `onState`; updated `broadcastState`; `hackHostCallbacks`/`hackViewState` objects; new PasswordScreen props |
| `js/session.js` | Host: TTL purge loop + handle `bye`; viewer: `beforeunload` send `bye` |
| `js/helpers.jsx` | No change needed — `BRAND_ASCII_SMALL` already exported |

---

## Task 1 — CSS: title + puzzle responsiveness

**Files:** `css/crt.css`

- [ ] **1.1 Fix `.ascii-title` — smaller clamp + responsive fallback**

Find:
```css
.ascii-title {
  color: var(--phosphor);
  font-size: clamp(10px, 1vw, 13px);
  line-height: 1;
  white-space: pre;
  letter-spacing: 0;
}
```
Replace with:
```css
.ascii-title {
  color: var(--phosphor);
  font-size: clamp(6px, 0.85vw, 11px);
  line-height: 1;
  white-space: pre;
  letter-spacing: 0;
  max-width: 100%;
  overflow: hidden;
}
.ascii-title-small { display: none; }
@media (max-width: 860px) {
  .ascii-title-full  { display: none; }
  .ascii-title-small { display: block; font-family: var(--mono); color: var(--phosphor);
                        font-size: clamp(13px, 2.2vw, 18px); white-space: pre; }
}
```

- [ ] **1.2 Fix `.seq-pad` — responsive size**

Find in the `/* ===== Sequence Lock ===== */` block:
```css
.seq-pad {
  width: 64px; height: 64px;
```
and also:
```css
  font-size: 28px;
```
Replace both occurrences (same rule block):
```css
.seq-pad {
  width: clamp(40px, 7vw, 64px); height: clamp(40px, 7vw, 64px);
  background: #041208;
  border: 1px solid var(--phosphor-dim);
  color: var(--pad-color, var(--phosphor));
  font-family: var(--mono);
  font-size: clamp(18px, 3vw, 28px);
  cursor: pointer;
  transition: transform 80ms, box-shadow 120ms, background 120ms;
  text-shadow: 0 0 6px currentColor;
}
```

- [ ] **1.3 Fix `.wire-maze` — responsive font + no overflow**

Find:
```css
.wire-maze {
  font-family: var(--mono);
  font-size: 18px;
  line-height: 1.05;
  letter-spacing: 0.05em;
```
Replace those four lines with:
```css
.wire-maze {
  font-family: var(--mono);
  font-size: clamp(10px, 1.5vw, 17px);
  line-height: 1.05;
  letter-spacing: 0;
  max-width: 100%;
  overflow-x: auto;
```

- [ ] **1.4 Fix `.pipe-cell` — responsive size**

Find:
```css
.pipe-cell {
  width: 44px; height: 44px;
```
and `font-size: 28px;` in the same rule block. Replace the whole rule:
```css
.pipe-cell {
  width: clamp(28px, 5vw, 44px); height: clamp(28px, 5vw, 44px);
  background: #041208;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--mono);
  font-size: clamp(16px, 3vw, 28px);
  color: var(--phosphor);
  cursor: pointer;
  user-select: none;
  transition: background 120ms;
  text-shadow: 0 0 4px var(--phosphor);
}
```

- [ ] **1.5 Fix `.memgrid` — responsive width**

Find:
```css
  max-width: 280px;
  margin: 4px auto;
```
Replace with:
```css
  width: min(280px, 80vw);
  margin: 4px auto;
```

- [ ] **1.6 Fix `.hack-modal` max-width for wider content**

Find:
```css
.hack-modal {
  min-width: min(440px, 96vw);
  max-width: 520px;
```
Replace with:
```css
.hack-modal {
  min-width: min(400px, 96vw);
  max-width: min(600px, 96vw);
```

- [ ] **1.7 Commit**
```bash
git add css/crt.css
git commit -m "fix: responsive title clamp and puzzle CSS clamp/min values"
```

---

## Task 2 — PasswordScreen: pw sync + viewer overlay

**Files:** `js/PasswordScreen.jsx`

- [ ] **2.1 Add new props to function signature**

Change line 2:
```js
function PasswordScreen({ lang, state, onLogin, onMasterUnlock, lockInfo, setLockInfo, canInput = true }) {
```
To:
```js
function PasswordScreen({
  lang, state, onLogin, onMasterUnlock, lockInfo, setLockInfo, canInput = true,
  onPwChange, syncPwInput,
  hackHostCallbacks, hackViewState,
}) {
```

- [ ] **2.2 Wire `onPwChange` into the password input `onChange`**

Find:
```js
onChange={e => { setPw(e.target.value); if (e.target.value) SCPAudio.key(); }}
```
Replace with:
```js
onChange={e => {
  setPw(e.target.value);
  if (e.target.value) SCPAudio.key();
  if (onPwChange) onPwChange(e.target.value);
}}
```

- [ ] **2.3 Clear `pwInput` on every `setPw('')`**

There are several `setPw('')` calls (after wrong password, after submit, inside `/hack` handler). After each one, add:
```js
if (onPwChange) onPwChange('');
```
Specifically the locations are: (a) at end of wrong-password branch (`setPw(''); setChecking(false);`), (b) inside the `/hack` command block (`setPw('');`).

- [ ] **2.4 Show viewer pw-mirror below the input form**

Directly after the `</form>` closing tag (before the `{revealedTerms.length > 0 && ...}` block), add:
```jsx
{syncPwInput != null && (
  <div className="mono" style={{marginTop: '0.4em', letterSpacing: '0.22em', fontSize: 20}}>
    <span className="t-dim">{'RMT: '}</span>
    {syncPwInput.length > 0
      ? <span className="t-amber">{'●'.repeat(syncPwInput.length)}</span>
      : <span className="t-dim" style={{opacity: 0.45}}>
          {lang === 'ru' ? '[ожидание ввода]' : '[waiting for input]'}
        </span>
    }
  </div>
)}
```

- [ ] **2.5 Wire `hackHostCallbacks.onOpen` when hack launches**

Find the `/hack` command handler block that currently does:
```js
setMsg({ kind: 'master', text: lang === 'ru' ? 'ЗАПУСК ВИРУС-ДИСКЕТЫ...' : 'LAUNCHING VIRUS DISK...' });
setTimeout(() => { setMsg(null); setHackOpen(true); }, 500);
```
Change to:
```js
setMsg({ kind: 'master', text: lang === 'ru' ? 'ЗАПУСК ВИРУС-ДИСКЕТЫ...' : 'LAUNCHING VIRUS DISK...' });
setTimeout(() => {
  setMsg(null);
  setHackOpen(true);
  if (hackHostCallbacks && hackHostCallbacks.onOpen) hackHostCallbacks.onOpen();
}, 500);
```

- [ ] **2.6 Wire `hackHostCallbacks.onClose` when hack closes**

Find the HackGame's `onCancel` prop:
```js
onCancel={() => setHackOpen(false)}
```
Replace with:
```js
onCancel={() => {
  setHackOpen(false);
  if (hackHostCallbacks && hackHostCallbacks.onClose) hackHostCallbacks.onClose();
}}
```

Find the HackGame's `onSuccess` prop:
```js
onSuccess={(r) => {
  setHackOpen(false);
  if (r && r.pw) {
    setPw(r.pw);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  }
}}
```
Replace with:
```js
onSuccess={(r) => {
  setHackOpen(false);
  if (hackHostCallbacks && hackHostCallbacks.onClose) hackHostCallbacks.onClose();
  if (r && r.pw) {
    setPw(r.pw);
    if (onPwChange) onPwChange(r.pw);
    setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
  }
}}
```

- [ ] **2.7 Pass snapshot/done callbacks to host HackGame**

In the host `<HackGame>` element (the one guarded by `{hackOpen && ...}`), add two props:
```jsx
onSnapshot={hackHostCallbacks ? hackHostCallbacks.onSnapshot : null}
onDone={hackHostCallbacks ? hackHostCallbacks.onDone : null}
```

- [ ] **2.8 Add viewer HackGame overlay**

After the existing `{hackOpen && <HackGame ... />}` block, add:
```jsx
{hackViewState && hackViewState.open && (
  <HackGame
    lang={lang}
    state={state}
    readOnly={true}
    viewState={hackViewState}
    onCancel={() => {}}
    onSuccess={() => {}}
  />
)}
```

- [ ] **2.9 Commit**
```bash
git add js/PasswordScreen.jsx
git commit -m "feat: pw input sync and viewer hack overlay in PasswordScreen"
```

---

## Task 3 — HackGame: readOnly mode + snapshot relay + WordSearch snapshot

**Files:** `js/HackGame.jsx`

- [ ] **3.1 Expand function signature**

Change:
```js
function HackGame({ lang, state, onSuccess, onCancel }) {
```
To:
```js
function HackGame({ lang, state, onSuccess, onCancel, onSnapshot, onDone, readOnly, viewState }) {
```

- [ ] **3.2 Derive active puzzle type from `viewState` when `readOnly`**

After the existing `puzzleType` and `title` lines, add:
```js
// When viewer, use the puzzle type from host's broadcast; otherwise use locally picked type.
const activePuzzleType = (readOnly && viewState) ? (viewState.puzzleType || 'wordsearch') : puzzleType;
const activeTitle = PUZZLE_TITLES[activePuzzleType]?.[t ? 'ru' : 'en'] || activePuzzleType;
const effectiveDone   = (readOnly && viewState) ? (viewState.done   || false) : done;
const effectiveReward = (readOnly && viewState) ? (viewState.reward || null)  : reward;
const effectiveSnap   = (readOnly && viewState) ? (viewState.snapshot || null) : null;
```

Replace uses of `puzzleType` / `title` / `done` / `reward` in the JSX with `activePuzzleType` / `activeTitle` / `effectiveDone` / `effectiveReward`.

In the PUZZLES lookup:
```js
const Puzzle = PUZZLES[activePuzzleType] || WordSearchPuzzle;
```

- [ ] **3.3 Add throttled `handleSnapshot` helper**

Add before the `return`:
```js
const _snapTimer = React.useRef(null);
const handleSnapshot = React.useCallback((puzzleState) => {
  if (!onSnapshot) return;
  if (_snapTimer.current) clearTimeout(_snapTimer.current);
  _snapTimer.current = setTimeout(() => {
    onSnapshot({ puzzleType: activePuzzleType, puzzleState });
  }, 100);
}, [onSnapshot, activePuzzleType]);
```

- [ ] **3.4 Viewer status banner**

As the first child inside `<div className="modal hack-modal">`, add:
```jsx
{readOnly && (
  <div className="mono t-amber" style={{textAlign: 'center', fontSize: 13, padding: '2px 0', borderBottom: '1px solid var(--amber)', marginBottom: 4}}>
    {'>> '}{t ? 'ЗРИТЕЛЬСКИЙ РЕЖИМ — ТОЛЬКО ПРОСМОТР' : 'VIEWER MODE — READ ONLY'}{' <<'}
  </div>
)}
```

- [ ] **3.5 Pass new props to the Puzzle component**

Change:
```jsx
{!done && <Puzzle lang={lang} onWin={() => { setDone(true); SCPAudio.granted(); }} />}
```
To:
```jsx
{!effectiveDone && (
  <Puzzle
    lang={lang}
    onWin={() => {
      if (!readOnly) {
        setDone(true);
        SCPAudio.granted();
        if (onDone) onDone(reward);
      }
    }}
    onStateChange={!readOnly ? handleSnapshot : null}
    readOnlySnapshot={readOnly ? effectiveSnap : null}
  />
)}
```

- [ ] **3.6 Update done/reward JSX to use effective variants + hide USE for viewer**

Change the done reward block:
```jsx
{done && reward && (
  <div className="mono hack-reward">
    <div className="t-bright">{t ? '>> ДОСТУП РАЗРЕШЁН <<' : '>> ACCESS GRANTED <<'}</div>
    <div className="t-dim">{t ? 'Пароль от ' : 'Password for '}{reward.name}:</div>
    <div className="t-amber" style={{fontSize: 22, letterSpacing: '0.1em', marginTop: 4}}>{reward.pw}</div>
  </div>
)}
{done && !reward && (
  <div className="mono t-red">{t ? 'ЦЕЛЬ НЕ НАСТРОЕНА' : 'NO TARGET CONFIGURED'}</div>
)}
```
To:
```jsx
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
```

Change the USE button:
```jsx
{done && reward && <button className="btn" onClick={() => onSuccess(reward)}>{t ? 'ИСПОЛЬЗОВАТЬ' : 'USE'}</button>}
```
To:
```jsx
{effectiveDone && effectiveReward && !readOnly && (
  <button className="btn" onClick={() => onSuccess(effectiveReward)}>{t ? 'ИСПОЛЬЗОВАТЬ' : 'USE'}</button>
)}
```

- [ ] **3.7 Add `onStateChange` + `readOnlySnapshot` to `WordSearchPuzzle`**

Change signature:
```js
function WordSearchPuzzle({ lang, onWin }) {
```
To:
```js
function WordSearchPuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
```

Add snapshot emission after the `found` and `current` state declarations:
```js
React.useEffect(() => {
  if (!onStateChange) return;
  onStateChange({
    found,
    foundCells: Array.from(foundCellsMap),
    currentCells: current ? current.cells : [],
  });
}, [found, current, foundCellsMap]);
```

Add display variable derivation before the `return`:
```js
const roFound      = readOnlySnapshot ? (readOnlySnapshot.found || []) : found;
const roFoundCells = readOnlySnapshot ? new Set(readOnlySnapshot.foundCells || []) : foundCellsMap;
const roCurrent    = readOnlySnapshot ? (readOnlySnapshot.currentCells || []) : (current ? current.cells : []);
const isInCurrent  = (r, c) => roCurrent.some(([rr, cc]) => rr === r && cc === c);
const isFoundCell  = (r, c) => roFoundCells.has(r + ',' + c);
```

Update the grid element event handlers to be conditional:
```jsx
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
```

Update the cell className to use `isFoundCell` and `isInCurrent` (already functions, but replace old `isFound`/`isInCurrent` if they referenced local state directly).

Update the words list to use `roFound`:
```jsx
{game.words.map((w, i) => (
  <span key={i} className={roFound.includes(i) ? 't-bright hack-word-found' : 't-dim'}>
    {roFound.includes(i) ? '✓ ' + w : '• ' + w.replace(/./g, '_')}
    {i < game.words.length - 1 ? '   ' : ''}
  </span>
))}
```

- [ ] **3.8 Commit**
```bash
git add js/HackGame.jsx
git commit -m "feat: HackGame readOnly viewer mode, snapshot relay, WordSearch snapshot"
```

---

## Task 4 — HackPuzzles: all 7 puzzles get `onStateChange` + `readOnlySnapshot`

**Files:** `js/HackPuzzles.jsx`

The pattern for every puzzle:
1. Expand signature with `onStateChange, readOnlySnapshot`
2. Add a `React.useEffect` that calls `onStateChange(snapshot)` when key state changes
3. Derive `display*` variables: `const displayX = readOnlySnapshot ? (readOnlySnapshot.x ?? localX) : localX`
4. Use `display*` in JSX; disable interactions when `readOnlySnapshot` is truthy

- [ ] **4.1 SequencePuzzle**

Signature:
```js
function SequencePuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
```

Add after state declarations:
```js
React.useEffect(() => {
  if (onStateChange) onStateChange({ phase, round, flash, errors });
}, [phase, round, flash, errors]);
```

Display vars (add before `return`):
```js
const dp            = readOnlySnapshot || {};
const displayPhase  = readOnlySnapshot ? dp.phase  : phase;
const displayRound  = readOnlySnapshot ? dp.round  : round;
const displayFlash  = readOnlySnapshot ? dp.flash  : flash;
const displayErrors = readOnlySnapshot ? dp.errors : errors;
```

In JSX — replace all bare `phase`, `round`, `flash`, `errors` with display vars. Disable pads:
```jsx
<button
  key={i}
  className={'seq-pad' + (displayFlash === i ? ' on' : '')}
  style={{'--pad-color': COLORS[i]}}
  onClick={readOnlySnapshot ? undefined : () => press(i)}
  disabled={displayPhase === 'show' || !!readOnlySnapshot}
>{s}</button>
```
Status line:
```jsx
{t ? 'РАУНД' : 'ROUND'}: {displayRound}/{TOTAL_ROUNDS} · {t ? 'ОШИБКИ' : 'ERRORS'}: {displayErrors}/3
```
Phase text:
```jsx
{displayPhase === 'show' ? (t ? '// ТРАНСЛЯЦИЯ //' : '// TRANSMITTING //') : (t ? '// ВВОД //' : '// INPUT //')}
```

- [ ] **4.2 WirePuzzle**

Signature:
```js
function WirePuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
```

Emit after pos changes:
```js
React.useEffect(() => {
  if (onStateChange) onStateChange({ pos });
}, [pos]);
```

In the keydown handler, skip when `readOnlySnapshot`:
```js
const h = (e) => {
  if (wonRef.current || readOnlySnapshot) return;
  // … rest unchanged
};
```

Display pos:
```js
const displayPos = readOnlySnapshot ? (readOnlySnapshot.pos || [1, 1]) : pos;
```

In maze render:
```js
const isP = x === displayPos[0] && y === displayPos[1];
```

- [ ] **4.3 CipherPuzzle**

Signature:
```js
function CipherPuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
```

Emit:
```js
React.useEffect(() => {
  if (onStateChange) onStateChange({ userShift });
}, [userShift]);
```

Display:
```js
const displayShift     = readOnlySnapshot ? (readOnlySnapshot.userShift || 0) : userShift;
const displayDecrypted = caesarShift(encrypted, -displayShift, ALPHA);
```

Controls (disable both shift buttons and LOCK):
```jsx
<button className="btn"
  onClick={readOnlySnapshot ? undefined : () => { setUserShift(s => (s - 1 + ALPHA.length) % ALPHA.length); SCPAudio.key(); }}
  disabled={!!readOnlySnapshot}>‹ −1</button>
<div className="cipher-shift t-bright">SHIFT = {displayShift}</div>
<button className="btn"
  onClick={readOnlySnapshot ? undefined : () => { setUserShift(s => (s + 1) % ALPHA.length); SCPAudio.key(); }}
  disabled={!!readOnlySnapshot}>+1 ›</button>
```
Decrypted field: use `displayDecrypted`. LOCK button: `disabled={!!readOnlySnapshot}`, `onClick={readOnlySnapshot ? undefined : tryLock}`.

- [ ] **4.4 MemoryPuzzle**

Signature:
```js
function MemoryPuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
```

Emit (Sets must be serialised to arrays):
```js
React.useEffect(() => {
  if (onStateChange) onStateChange({
    phase, round,
    target: Array.from(target),
    picked: Array.from(picked),
  });
}, [phase, round, target, picked]);
```

Display:
```js
const dp            = readOnlySnapshot || {};
const displayPhase  = readOnlySnapshot ? dp.phase  : phase;
const displayRound  = readOnlySnapshot ? dp.round  : round;
const displayTarget = readOnlySnapshot ? new Set(dp.target || []) : target;
const displayPicked = readOnlySnapshot ? new Set(dp.picked || []) : picked;
```

Cell render:
```jsx
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
```

Status line:
```jsx
{t ? 'РАУНД' : 'ROUND'}: {displayRound + 1}/{ROUNDS} · {displayPhase === 'show' ? ... : ...}
```

- [ ] **4.5 PipePuzzle**

Signature:
```js
function PipePuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
```

Emit:
```js
React.useEffect(() => {
  if (onStateChange) onStateChange({ board });
}, [board]);
```

Display:
```js
const displayBoard = readOnlySnapshot ? (readOnlySnapshot.board || board) : board;
```

Update `connected` useMemo to use `displayBoard`:
```js
const connected = React.useMemo(() => {
  // … same BFS code but replace `board` with `displayBoard` everywhere inside
}, [displayBoard]);
```

Grid render — use `displayBoard` and disable clicks:
```jsx
{displayBoard.map((row, y) => row.map((m, x) => (
  <div key={x + '-' + y}
    className={'pipe-cell' + ((x === START.x && y === START.y) ? ' start' : '') + ((x === END.x && y === END.y) ? ' end' : '')}
    onClick={readOnlySnapshot ? undefined : () => rotate(x, y)}>
    {pipeChar(m)}
  </div>
)))}
```

- [ ] **4.6 FrequencyPuzzle**

Signature:
```js
function FrequencyPuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
```

Emit:
```js
React.useEffect(() => {
  if (onStateChange) onStateChange({ val, timeLeft });
}, [val, timeLeft]);
```

Display:
```js
const displayVal      = readOnlySnapshot ? (readOnlySnapshot.val      ?? val)      : val;
const displayTimeLeft = readOnlySnapshot ? (readOnlySnapshot.timeLeft ?? timeLeft) : timeLeft;
const dist    = Math.abs(displayVal - target);
const strength = Math.max(0, Math.min(1, 1 - dist / 35));
const blocks  = Math.round(strength * 24);
```

Slider and button:
```jsx
<input type="range" min="0" max="100" step="0.1" value={displayVal}
  className="freq-slider"
  onChange={readOnlySnapshot ? undefined : e => setVal(+e.target.value)}
  disabled={timeLeft <= 0 || !!readOnlySnapshot} />
<button className="btn"
  onClick={readOnlySnapshot ? undefined : tryLock}
  disabled={displayTimeLeft <= 0 || !!readOnlySnapshot}
  style={{alignSelf: 'center', minWidth: 140}}>
  {t ? 'ЗАХВАТ' : 'LOCK'}
</button>
```

Time display: use `displayTimeLeft`.
FREQ display: use `displayVal.toFixed(1)`.

- [ ] **4.7 TyperPuzzle**

Signature:
```js
function TyperPuzzle({ lang, onWin, onStateChange, readOnlySnapshot }) {
```

Emit:
```js
React.useEffect(() => {
  if (onStateChange) onStateChange({ input, timeLeft });
}, [input, timeLeft]);
```

Display:
```js
const displayInput    = readOnlySnapshot ? (readOnlySnapshot.input    || '')       : input;
const displayTimeLeft = readOnlySnapshot ? (readOnlySnapshot.timeLeft ?? timeLeft) : timeLeft;
```

Diff uses `displayInput`:
```js
const diff = target.split('').map((ch, i) => {
  const u = displayInput[i];
  if (u === undefined) return <span key={i} className="t-dim">{ch}</span>;
  if (u === ch)        return <span key={i} className="t-bright">{ch}</span>;
  return <span key={i} className="t-red">{u}</span>;
});
```

Form submit: `onSubmit={readOnlySnapshot ? e => e.preventDefault() : onSubmit}`

Input and button:
```jsx
<input ref={ref} className="typer-input" value={displayInput}
  onChange={readOnlySnapshot ? undefined : e => { setInput(e.target.value); SCPAudio.key(); }}
  disabled={timeLeft <= 0 || !!readOnlySnapshot}
  spellCheck="false" autoComplete="off" />
<button type="submit" className="btn"
  disabled={displayTimeLeft <= 0 || !!readOnlySnapshot}
  style={{alignSelf: 'center', minWidth: 140}}>
  {t ? 'ПОДТВЕРДИТЬ' : 'SUBMIT'}
</button>
```

Time display: use `displayTimeLeft`.

- [ ] **4.8 Commit**
```bash
git add js/HackPuzzles.jsx
git commit -m "feat: all 7 puzzles support onStateChange and readOnlySnapshot for viewer sync"
```

---

## Task 5 — App.jsx: lift hack state + updated broadcastState

**Files:** `js/App.jsx`

- [ ] **5.1 Declare new state variables**

After the existing `const [remoteNav, setRemoteNav] = ...` line, add:
```js
// Hack game state (lifted for session sync)
const [hackOpen,       setHackOpen]       = _useState(false);
const [hackDone,       setHackDone]       = _useState(false);
const [hackReward,     setHackReward]     = _useState(null);
const [hackPuzzleType, setHackPuzzleType] = _useState(null);
const [hackSnapshot,   setHackSnapshot]   = _useState(null);
const [pwInput,        setPwInput]        = _useState('');
```

- [ ] **5.2 Receive new fields in `onState` callback**

In the `SCPSession.init` `onState` callback, after the existing `if (shared.nav)` line, add:
```js
if (shared.pwInput        !== undefined) setPwInput(shared.pwInput);
if (shared.hackOpen       !== undefined) setHackOpen(shared.hackOpen);
if (shared.hackDone       !== undefined) setHackDone(shared.hackDone);
if (shared.hackReward     !== undefined) setHackReward(shared.hackReward);
if (shared.hackPuzzleType !== undefined) setHackPuzzleType(shared.hackPuzzleType);
if (shared.hackSnapshot   !== undefined) setHackSnapshot(shared.hackSnapshot);
```

- [ ] **5.3 Include new fields in `broadcastState`**

Change the `SCPSession.broadcastState({...})` call to:
```js
SCPSession.broadcastState({
  stage,
  currentTermId: currentTerm ? currentTerm.id : null,
  nav: remoteNav,
  pwInput,
  hackOpen,
  hackDone,
  hackReward,
  hackPuzzleType,
  hackSnapshot,
});
```

Extend the dependency array of that `useEffect` to include the new vars:
```js
}, [sessionRole, stage,
    currentTerm && currentTerm.id,
    remoteNav && remoteNav.view, remoteNav && remoteNav.folderIdx, remoteNav && remoteNav.fileIdx,
    pwInput, hackOpen, hackDone, hackReward, hackPuzzleType, hackSnapshot]);
```

- [ ] **5.4 Build `hackHostCallbacks` and `hackViewState` objects**

Add before the `return (`:
```js
const hackHostCallbacks = (isHost && !isViewer) ? {
  onOpen:     ()       => { setHackOpen(true); setHackDone(false); setHackReward(null); setHackSnapshot(null); setHackPuzzleType(null); },
  onClose:    ()       => { setHackOpen(false); },
  onDone:     (reward) => { setHackDone(true); setHackReward(reward); },
  onSnapshot: (snap)   => {
    if (snap && snap.puzzleType) setHackPuzzleType(snap.puzzleType);
    setHackSnapshot(snap ? snap.puzzleState : null);
  },
} : null;

const hackViewState = isViewer ? {
  open:       hackOpen,
  done:       hackDone,
  reward:     hackReward,
  puzzleType: hackPuzzleType,
  snapshot:   hackSnapshot,
} : null;
```

- [ ] **5.5 Pass new props to `PasswordScreen`**

Find the `{stage === 'login' && (<PasswordScreen ... />)}` block and add the new props:
```jsx
onPwChange={isHost && !isViewer ? setPwInput : null}
syncPwInput={isViewer ? pwInput : null}
hackHostCallbacks={hackHostCallbacks}
hackViewState={hackViewState}
```

- [ ] **5.6 Commit**
```bash
git add js/App.jsx
git commit -m "feat: lift hack state to App, include in broadcastState, wire to PasswordScreen"
```

---

## Task 6 — session.js: cursor TTL + bye message

**Files:** `js/session.js`

- [ ] **6.1 Add TTL purge loop in `becomeHost`**

At the end of `becomeHost`, before its closing `}`, add:
```js
// Purge cursors that haven't moved in 5 s — handles tabs closed without a clean goodbye
setInterval(() => {
  const STALE_MS = 5000;
  const now = Date.now();
  let changed = false;
  state.cursors.forEach((c, id) => {
    if (now - c.t > STALE_MS) { state.cursors.delete(id); changed = true; }
  });
  if (changed) {
    broadcastFromHost({
      type: 'cursors',
      cursors: Array.from(state.cursors.entries()).map(([id, c]) => ({ id, x: c.x, y: c.y })),
    });
    emitCursors();
  }
}, 3000);
```

- [ ] **6.2 Handle `bye` message in `onHostData`**

In `onHostData`, add a new branch after the `cursor` handler (before the closing `}`):
```js
} else if (msg.type === 'bye') {
  state.viewerConns.delete(conn.peer);
  state.peers.delete(conn.peer);
  state.cursors.delete(conn.peer);
  emitPeers();
  emitCursors();
  broadcastFromHost({
    type: 'peers',
    peers: Array.from(state.peers.entries()).map(([id, p]) => ({ id, ...p })),
  });
  try { conn.close(); } catch (e) {}
}
```

- [ ] **6.3 Send `bye` on `beforeunload` in `becomeViewer`**

Inside `becomeViewer`, in the `conn.on('open', ...)` callback, after the existing `conn.send` hello, add:
```js
const _bye = () => { try { conn.send(JSON.stringify({ type: 'bye' })); } catch (e) {} };
window.addEventListener('beforeunload', _bye);
conn._bye = _bye;
```

In the `conn.on('close', ...)` callback, at the very start, add:
```js
if (conn._bye) { window.removeEventListener('beforeunload', conn._bye); conn._bye = null; }
```

- [ ] **6.4 Commit**
```bash
git add js/session.js
git commit -m "fix: cursor TTL purge loop + beforeunload bye for clean disconnect"
```

---

## Task 7 — Responsive brand title in PasswordScreen

**Files:** `js/PasswordScreen.jsx`

- [ ] **7.1 Replace single `<pre>` with full + small variants**

Find:
```jsx
<pre className="ascii-title t-bright">{BRAND_ASCII}</pre>
```
Replace with:
```jsx
<pre className="ascii-title ascii-title-full t-bright">{BRAND_ASCII}</pre>
<pre className="ascii-title ascii-title-small t-bright">{BRAND_ASCII_SMALL}</pre>
```
CSS from Task 1 already hides the correct one at each breakpoint.

- [ ] **7.2 Commit**
```bash
git add js/PasswordScreen.jsx
git commit -m "fix: responsive brand title uses ascii-title-full/small CSS classes"
```

---

## Task 8 — Final verification + push

- [ ] **8.1 Open two browser tabs — verify pw sync**

- Tab 1 (host): type any password characters
- Tab 2 (viewer): must show `RMT: ●●●●` with matching dot count in real time

- [ ] **8.2 Open two browser tabs — verify hack game sync**

- Tab 1: type `/hack`, enter HackGame
- Tab 2: must show the "VIEWER MODE — READ ONLY" overlay with the same active puzzle rendering the live state
- Host solves puzzle → both tabs show the reward password

- [ ] **8.3 Verify cursor cleanup**

- Open 3 tabs. Let cursors appear.
- Close one tab. Within ~5 seconds the cursor must disappear from the other two.

- [ ] **8.4 Verify title on narrow screen**

- Resize browser to ≤ 860px wide. The full block-letter logo must hide; the compact `[#] SCP FOUNDATION // SECURE, CONTAIN, PROTECT` line must appear.

- [ ] **8.5 Push**
```bash
git push
```

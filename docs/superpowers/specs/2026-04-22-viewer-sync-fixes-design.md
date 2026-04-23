# SCP Terminal — Viewer Sync & UX Fixes Design
**Date:** 2026-04-22

## Overview
Four issues to fix in the SCP Terminal multiplayer retro app:
1. Brand title misalignment on various screen sizes
2. Puzzle components not responsive (fixed pixel sizes)
3. Viewers don't see password input or hack puzzles (needs full mirroring)
4. Cursors linger after a user closes their tab

---

## 1. Brand Title Fix

**Problem:** `BRAND_ASCII` is ~105 chars wide. `.ascii-title` uses `font-size: clamp(10px, 1vw, 13px)`. The title shares horizontal space with the NODE/date block in `.screen-header`, so it overflows on screens < ~1400px.

**Solution:**
- Reduce to `font-size: clamp(6px, 0.85vw, 11px)` + `max-width: 100%; overflow: hidden`
- Add a media query `@media (max-width: 900px)` that hides `.ascii-title-full` and shows `.ascii-title-small` (which uses `BRAND_ASCII_SMALL`)
- In `PasswordScreen.jsx`: render both variants, CSS controls visibility

---

## 2. Puzzle Responsiveness

**Problem:** New puzzle CSS uses hard-coded px values that break on non-1080p screens.

**Changes:**
- `.seq-pad`: `64px` → `clamp(40px, 7vw, 64px)` width/height, font-size `clamp(20px, 3vw, 28px)`
- `.wire-maze`: `font-size: 18px` → `clamp(10px, 1.5vw, 17px)`, `letter-spacing: 0`
- `.pipe-cell`: `44px` → `clamp(28px, 5vw, 44px)` width/height, font-size `clamp(18px, 3vw, 28px)`
- `.memgrid`: remove fixed `max-width: 280px`, use `width: min(280px, 80vw)`
- `.hack-modal`: ensure `max-width: min(600px, 96vw)` and inner scroll

---

## 3. Full Viewer Mirroring

### 3a. Password Input Mirroring

Host broadcasts `pwInput: string` (the current value of the password field). Viewers display `'●'.repeat(pwInput.length)` in a read-only display above their disabled input to show typing activity.

### 3b. Hack Game Mirroring

**State lifted to App.jsx:**
```js
const [hackOpen, setHackOpen] = useState(false);
const [hackDone, setHackDone] = useState(false);
const [hackReward, setHackReward] = useState(null);
const [hackPuzzleType, setHackPuzzleType] = useState(null);
const [hackSnapshot, setHackSnapshot] = useState(null);
```

**Broadcast (host only):**
```js
broadcastState({
  stage, currentTermId, nav,
  pwInput,
  hackOpen, hackDone, hackReward, hackPuzzleType, hackSnapshot,
})
```

**Viewer receives** all fields and passes them as props to `PasswordScreen` → `HackGame`.

**Puzzle contract additions:**
- `onStateChange(snapshot)` — called by host on state changes (throttled 100ms)
- `readOnlySnapshot` — if provided, puzzle renders state from this object, all interactions disabled

**Per-puzzle snapshot shapes:**
| Puzzle | Fields |
|--------|--------|
| WordSearch | `{found: number[], foundCells: string[], currentCells: [number,number][]}` |
| Sequence | `{phase, round, flash, errors}` |
| Wire | `{pos: [number,number]}` |
| Cipher | `{userShift: number}` |
| Memory | `{phase, round, target: number[], picked: number[]}` |
| Pipe | `{board: number[][]}` |
| Frequency | `{val: number, timeLeft: number}` |
| Typer | `{input: string, timeLeft: number}` |

**HackGame additions:**
- New props: `readOnly`, `viewSnapshot` (for viewer render path)
- When `readOnly=true`, passes `readOnlySnapshot=viewSnapshot.puzzleState` to puzzle
- Puzzle type forced by `viewSnapshot.puzzleType` (so viewer renders same puzzle)

---

## 4. Cursor Cleanup (TTL)

**In `session.js`:**
- Cursors stored with timestamp: `{ x, y, t: Date.now() }`
- Host runs `setInterval(purgeStale, 3000)` — removes entries where `Date.now() - t > 5000`, then re-broadcasts `peers` + `cursors`
- Add `window.addEventListener('beforeunload', () => send({type:'bye'}))` — best-effort cleanup on tab close
- Viewer: on receiving `{type:'bye'}`, host removes peer immediately

---

## Files Changed

| File | Changes |
|------|---------|
| `css/crt.css` | Title responsive, all puzzle px→clamp |
| `js/helpers.jsx` | Export `BRAND_ASCII_SMALL` class hint |
| `js/PasswordScreen.jsx` | `syncPwInput` prop, `onPwChange` callback, `hackViewState` prop |
| `js/HackGame.jsx` | `readOnly`+`viewSnapshot` props, `onStateChange` relay, `onHackSnapshot` plumbing |
| `js/HackPuzzles.jsx` | All 7 puzzles: `onStateChange`+`readOnlySnapshot` |
| `js/App.jsx` | Lift hack state, include in broadcastState, relay to PasswordScreen |
| `js/session.js` | TTL purge, beforeunload bye, handle 'bye' message |

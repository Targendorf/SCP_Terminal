// Tweaks panel (edit-mode) — настройки CRT/языка/звука
function TweaksPanel({ tweaks, setTweaks }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
    <button className="tweaks-toggle" onClick={() => setOpen(o => !o)} title="Tweaks">
      {open ? '× TWEAKS' : '⚙ TWEAKS'}
    </button>
    {open && (
    <div className="tweaks-panel">
      <h3>TWEAKS // НАСТРОЙКИ</h3>

      <div className="tweak-row">
        <label>LANG / ЯЗЫК</label>
        <select value={tweaks.lang} onChange={e => setTweaks({lang: e.target.value})}>
          <option value="en">English</option>
          <option value="ru">Русский</option>
        </select>
      </div>

      <div className="tweak-row">
        <label>SCANLINES {Math.round(tweaks.scanlines * 100)}%</label>
        <input type="range" min="0" max="1" step="0.05"
          value={tweaks.scanlines}
          onChange={e => setTweaks({scanlines: Number(e.target.value)})} />
      </div>

      <div className="tweak-row">
        <label>GLOW {Math.round(tweaks.glow * 100)}%</label>
        <input type="range" min="0" max="2" step="0.05"
          value={tweaks.glow}
          onChange={e => setTweaks({glow: Number(e.target.value)})} />
      </div>

      <div className="tweak-row">
        <label>NOISE {Math.round(tweaks.noise * 100)}%</label>
        <input type="range" min="0" max="0.3" step="0.01"
          value={tweaks.noise}
          onChange={e => setTweaks({noise: Number(e.target.value)})} />
      </div>

      <div className="tweak-row">
        <label>VIBRATION {Math.round(tweaks.vibration * 100)}%</label>
        <input type="range" min="0" max="2" step="0.1"
          value={tweaks.vibration}
          onChange={e => setTweaks({vibration: Number(e.target.value)})} />
      </div>

      <div className="tweak-row">
        <label>
          <input type="checkbox" checked={tweaks.sound}
            onChange={e => setTweaks({sound: e.target.checked})}
            style={{marginRight: 6}} />
          SOUND / ЗВУК
        </label>
      </div>

      <div className="tweak-row">
        <label>COLOR / ЦВЕТ</label>
        <select value={tweaks.color} onChange={e => setTweaks({color: e.target.value})}>
          <option value="green">Phosphor Green (P1)</option>
          <option value="amber">Amber (P3)</option>
          <option value="white">White monochrome</option>
        </select>
      </div>
    </div>
    )}
    </>
  );
}

window.TweaksPanel = TweaksPanel;

// Хранилище данных: localStorage + JSON-экспорт/импорт.
// Для Vercel/Git-деплоя: seed.js — это "канон" (коммитится в репо),
// localStorage — это "игровая сессия" (изменения мастера в браузере),
// JSON-экспорт — способ передать изменённую вселенную между устройствами/мастерами.

(function () {
  const LS_KEY = 'scp_terminal_state_v1';
  const LS_LOG = 'scp_terminal_log_v1';

  function clone(v) { return JSON.parse(JSON.stringify(v)); }

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) { console.warn('Failed to load state', e); }
    return clone(window.SCP_SEED);
  }

  function save(state) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch (e) { console.warn('Failed to save state', e); }
  }

  function reset() {
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_LOG);
    return clone(window.SCP_SEED);
  }

  function loadLog() {
    try {
      const raw = localStorage.getItem(LS_LOG);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [];
  }

  function appendLog(entry) {
    const log = loadLog();
    log.push({ ...entry, ts: new Date().toISOString() });
    // ограничим размер
    if (log.length > 500) log.splice(0, log.length - 500);
    try { localStorage.setItem(LS_LOG, JSON.stringify(log)); } catch (e) {}
    return log;
  }

  function clearLog() {
    localStorage.removeItem(LS_LOG);
    return [];
  }

  function exportJson(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    a.href = url;
    a.download = `scp-terminals-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  function importJson(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => {
        try {
          const state = JSON.parse(r.result);
          if (!state || !Array.isArray(state.terminals)) throw new Error('Invalid structure');
          resolve(state);
        } catch (e) { reject(e); }
      };
      r.onerror = reject;
      r.readAsText(file);
    });
  }

  window.SCPStorage = { load, save, reset, loadLog, appendLog, clearLog, exportJson, importJson };
})();

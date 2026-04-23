// Хелперы и хуки
const { useState, useEffect, useRef, useMemo, useCallback } = React;

// Генерация ID
window.uid = function (prefix) {
  return (prefix || 'id') + '-' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
};

// Локальный стор с React
window.useStore = function () {
  const [state, setState] = useState(() => SCPStorage.load());
  useEffect(() => { SCPStorage.save(state); }, [state]);

  // Подхватываем изменения из других вкладок (например, из вкладки ?admin=1)
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'scp_terminal_state_v1' || !e.newValue) return;
      try {
        const incoming = JSON.parse(e.newValue);
        if (incoming && Array.isArray(incoming.terminals)) {
          setState(incoming);
        }
      } catch (_) {}
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return [state, setState];
};


// Сейчас 1991 — форматируем в псевдо-старый формат времени
window.formatRetroDate = function (d) {
  const pad = n => String(n).padStart(2, '0');
  const mRu = ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];
  const m = mRu[d.getMonth()];
  return `${pad(d.getDate())}-${m}-91  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// Получение ASCII-рамки с текстом
window.asciiFrame = function(text, width) {
  const pad = width - text.length - 4;
  const left = Math.floor(pad / 2);
  const right = pad - left;
  const top = ' ╔' + '═'.repeat(width - 4) + '╗';
  const mid = ' ║' + ' '.repeat(left) + text + ' '.repeat(right) + '║';
  const bot = ' ╚' + '═'.repeat(width - 4) + '╝';
  return top + '\n' + mid + '\n' + bot;
};

// Эффект печатающегося текста
window.useTypewriter = function(text, speed = 1) {
  const [current, setCurrent] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!text) {
      setCurrent('');
      setDone(true);
      return;
    }
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i += speed;
      if (i >= text.length) {
        setCurrent(text);
        setDone(true);
        clearInterval(interval);
      } else {
        setCurrent(text.slice(0, i));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [text, speed]);

  return [current, done];
};

// Строки для статус-бара
window.statusBarText = function () {
  return '[ESC] ВЫХОД  [↑↓] ВЫБОР  [ENTER] ОТКРЫТЬ  [\\] КОМАНДА';
};

// Уровни доступа подписи (каноничные по лору SCP Foundation)
// 1 — Confidential / 2 — Restricted / 3 — Secret / 4 — Top Secret / 5 — Thaumiel
window.levelLabel = function (lvl) {
  const ru = [
    'УРОВЕНЬ 0 / БЕЗ ОГРАНИЧЕНИЙ',
    'УРОВЕНЬ 1 / КОНФИДЕНЦИАЛЬНО',
    'УРОВЕНЬ 2 / ОГРАНИЧЕННЫЙ ДОСТУП',
    'УРОВЕНЬ 3 / СЕКРЕТНО',
    'УРОВЕНЬ 4 / СОВЕРШЕННО СЕКРЕТНО',
    'УРОВЕНЬ 5 / ТАУМИЭЛЬ',
  ];
  return ru[lvl] || '';
};

// Утилита: ASCII заголовок "SCP FOUNDATION"
window.BRAND_ASCII = `
 ███████╗ ██████╗██████╗      ███████╗ ██████╗ ██╗   ██╗███╗   ██╗██████╗  █████╗ ████████╗██╗ ██████╗ ███╗   ██╗
 ██╔════╝██╔════╝██╔══██╗     ██╔════╝██╔═══██╗██║   ██║████╗  ██║██╔══██╗██╔══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
 ███████╗██║     ██████╔╝     █████╗  ██║   ██║██║   ██║██╔██╗ ██║██║  ██║███████║   ██║   ██║██║   ██║██╔██╗ ██║
 ╚════██║██║     ██╔═══╝      ██╔══╝  ██║   ██║██║   ██║██║╚██╗██║██║  ██║██╔══██║   ██║   ██║██║   ██║██║╚██╗██║
 ███████║╚██████╗██║          ██║     ╚██████╔╝╚██████╔╝██║ ╚████║██████╔╝██║  ██║   ██║   ██║╚██████╔╝██║ ╚████║
 ╚══════╝ ╚═════╝╚═╝          ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
`.trimEnd();

window.BRAND_ASCII_SMALL = `
 [#] SCP FOUNDATION // SECURE, CONTAIN, PROTECT
`.trimEnd();

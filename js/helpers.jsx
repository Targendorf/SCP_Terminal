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

// Уровни доступа подписи
window.levelLabel = function (lvl) {
  const ru = ['','УРОВЕНЬ 1 / ОГРАНИЧ.','УРОВЕНЬ 2 / КОНФИДЕНЦ.','УРОВЕНЬ 3 / СЕКРЕТНО','УРОВЕНЬ 4 / СОВ.СЕКРЕТНО','УРОВЕНЬ 5 / КОСМИЧЕСКИЙ'];
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

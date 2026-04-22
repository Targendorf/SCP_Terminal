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

// Перевод
window.tr = function (lang, en, ru) {
  if (lang === 'ru') return ru != null ? ru : en;
  return en != null ? en : ru;
};

// Сейчас 1991 — форматируем в псевдо-старый формат времени
window.formatRetroDate = function (d, lang) {
  const pad = n => String(n).padStart(2, '0');
  const mRu = ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];
  const mEn = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const m = (lang === 'ru' ? mRu : mEn)[d.getMonth()];
  return `${pad(d.getDate())}-${m}-91  ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

// ASCII псевдо-рамка (из символов)
window.asciiFrame = function (text, width) {
  width = width || 60;
  const hr = '+' + '-'.repeat(width - 2) + '+';
  const lines = String(text).split('\n').map(l => {
    const pad = Math.max(0, width - 4 - l.length);
    return '| ' + l + ' '.repeat(pad) + ' |';
  });
  return [hr, ...lines, hr].join('\n');
};

// Печатающийся текст (имитация медленного вывода)
window.useTypewriter = function (text, speed) {
  const [out, setOut] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text) { setOut(''); setDone(true); return; }
    setOut(''); setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += Math.max(1, Math.ceil((speed || 3)));
      if (i >= text.length) {
        setOut(text);
        setDone(true);
        clearInterval(id);
      } else {
        setOut(text.slice(0, i));
      }
    }, 12);
    return () => clearInterval(id);
  }, [text, speed]);
  return [out, done];
};

// Строки для статус-бара
window.statusBarText = function (lang) {
  return lang === 'ru'
    ? '[ESC] ВЫХОД  [↑↓] ВЫБОР  [ENTER] ОТКРЫТЬ  [\\] КОМАНДА'
    : '[ESC] EXIT  [↑↓] SELECT  [ENTER] OPEN  [\\] CMD';
};

// Уровни доступа подписи
window.levelLabel = function (lvl, lang) {
  const en = ['','LEVEL 1 / RESTRICTED','LEVEL 2 / CONFIDENTIAL','LEVEL 3 / SECRET','LEVEL 4 / TOP SECRET','LEVEL 5 / COSMIC'];
  const ru = ['','УРОВЕНЬ 1 / ОГРАНИЧ.','УРОВЕНЬ 2 / КОНФИДЕНЦ.','УРОВЕНЬ 3 / СЕКРЕТНО','УРОВЕНЬ 4 / СОВ.СЕКРЕТНО','УРОВЕНЬ 5 / КОСМИЧЕСКИЙ'];
  return (lang === 'ru' ? ru : en)[lvl] || '';
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

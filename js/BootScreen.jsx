// Экран загрузки BIOS / POST
function BootScreen({ onDone }) {
  const [lines, setLines] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const script = [
      { t: 0,    s: 'ОС-SCP v4.17.3', cls: 't-bright' },
      { t: 50,   s: '(c) 1991 Отдел системных технологий Фонда. Все права защищены.' },
      { t: 200,  s: '' },
      { t: 250,  s: 'Выполняется POST...' },
      { t: 600,  s: '  ЦПУ ........... 80386DX @ 33 МГц    [OK]' },
      { t: 750,  s: '  ПАМЯТЬ ........ 4096 КБ              [OK]' },
      { t: 900,  s: '  HDD ........... ST-225  20 МБ        [OK]' },
      { t: 1050, s: '  ВИДЕО ......... VGA  640x480         [OK]' },
      { t: 1200, s: '  КРИПТО ........ ШИФРАТОР К-7         [OK]' },
      { t: 1350, s: '' },
      { t: 1400, s: 'Подключение к СЕТЬ-ЗОНА... ', cls: 't-dim' },
      { t: 1900, s: '[УСТАНОВЛЕНО]', cls: 't-bright' },
      { t: 2000, s: 'Загрузка службы учётных записей...' },
      { t: 2400, s: 'Готов.', cls: 't-bright' },
    ];
    const timers = [];
    script.forEach((line, i) => {
      timers.push(setTimeout(() => {
        setLines(prev => [...prev, line]);
        if (i === 5 || i === 6 || i === 7 || i === 8) SCPAudio.key();
        if (i === script.length - 1) SCPAudio.beep(880, 0.06);
      }, line.t));
    });
    timers.push(setTimeout(() => setDone(true), script[script.length - 1].t + 600));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!done) return;
    const h = e => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        SCPAudio.key();
        onDone();
      }
    };
    window.addEventListener('keydown', h);
    const click = () => onDone();
    window.addEventListener('click', click);
    return () => { window.removeEventListener('keydown', h); window.removeEventListener('click', click); };
  }, [done, onDone]);

  return (
    <div className="boot-screen mono">
      {lines.map((l, i) => (
        <div key={i} className={l.cls || ''}>{l.s || '\u00A0'}</div>
      ))}
      {done && (
        <>
          <div>&nbsp;</div>
          <div className="t-dim">
            {'Нажмите любую клавишу для продолжения'}
            <span className="caret" style={{marginLeft: 6}}></span>
          </div>
        </>
      )}
    </div>
  );
}

window.BootScreen = BootScreen;

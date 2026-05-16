// Админ-панель: CRUD терминалов, папок, файлов, экспорт/импорт, логи
// DRAFT MODE: все правки идут в локальный draft, в Firestore пишется только по кнопке СОХРАНИТЬ.
function AdminPanel({ state, setState, onExit, onPreview }) {
  const [tab, setTab] = useState('terminals'); // terminals | logs | settings
  const [selectedTermId, setSelectedTermId] = useState(state.terminals[0]?.id || null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [log, setLog] = useState(() => SCPStorage.loadLog());
  const [confirm, setConfirm] = useState(null);

  // ===== DRAFT STATE =====
  // Все правки идут сюда. setState (Firestore) вызывается только по кнопке СОХРАНИТЬ.
  const [draft, setDraft] = useState(state);
  const [dirty, setDirty] = useState(false);
  // Флаг: пришёл свежий snapshot с сервера, пока юзер редактировал — показать индикатор.
  const [hasRemoteUpdate, setHasRemoteUpdate] = useState(false);
  const lastExternalRef = useRef(state);

  // Синхронизация: prop state может прийти от Firestore (новый snapshot).
  useEffect(() => {
    if (state === lastExternalRef.current) return; // тот же объект — игнор
    lastExternalRef.current = state;
    if (!dirty) {
      // Нет несохранённых правок — подхватываем серверный snapshot.
      setDraft(state);
      setHasRemoteUpdate(false);
    } else {
      // Есть несохранённые правки — НЕ перезаписываем draft, но отметим.
      setHasRemoteUpdate(true);
    }
  }, [state, dirty]);

  // Универсальный мутатор draft. fn :: prevDraft -> nextDraft
  const mutate = (fn) => {
    setDraft(prev => fn(prev));
    setDirty(true);
  };

  const save = () => {
    setState(draft);
    setDirty(false);
    setHasRemoteUpdate(false);
    SCPAudio.beep(720, 0.06);
    // lastExternalRef обновится автоматически в useEffect, когда Firestore вернёт snapshot.
  };

  const revert = () => {
    setDraft(state);
    setDirty(false);
    setHasRemoteUpdate(false);
    lastExternalRef.current = state;
    SCPAudio.beep(420, 0.05);
  };

  // BroadcastChannel удалён: все правки админа уходят через setState (= update в Firestore),
  // и каждая вкладка получает их через onSnapshot за <1с.

  const L = {
    title: 'АДМИНИСТРАТИВНАЯ КОНСОЛЬ',
    terminals: 'ТЕРМИНАЛЫ',
    logs: 'ЖУРНАЛ ВХОДОВ',
    settings: 'НАСТРОЙКИ',
    close: 'ВЫЙТИ',
    newT: '+ ТЕРМИНАЛ',
    newF: '+ ПАПКА',
    newFl: '+ ФАЙЛ',
    del: 'УДАЛИТЬ',
    preview: 'ПРЕДПРОСМОТР',
    exportJ: 'ЭКСПОРТ JSON',
    importJ: 'ИМПОРТ JSON',
    reset: 'СБРОС К SEED',
    master: 'МАСТЕР-ПАРОЛЬ',
    name: 'НАЗВАНИЕ',
    host: 'HOSTNAME',
    op: 'ОПЕРАТОР',
    pw: 'ПАРОЛЬ ДОСТУПА',
    lvl: 'УРОВЕНЬ (1-5)',
    motd: 'MOTD (по строке)',
    content: 'СОДЕРЖИМОЕ',
    corrupted: 'Помечен как [ПОВРЕЖДЁН]',
    templates: 'ШАБЛОНЫ',
    tmplScp: 'SCP-объект',
    tmplInc: 'Инцидент',
    tmplExp: 'Эксперимент',
    logsEmpty: 'Журнал пуст.',
    clearLog: 'ОЧИСТИТЬ ЖУРНАЛ',
    savedAs: 'Файл JSON сохранён в загрузки.',
  };

  // Везде читаем из draft (а не из state) — пользователь видит свои текущие правки.
  const terminals = draft.terminals;
  const term = terminals.find(x => x.id === selectedTermId) || null;
  const folder = term ? (term.folders || []).find(x => x.id === selectedFolderId) : null;
  const file = folder ? (folder.files || []).find(x => x.id === selectedFileId) : null;

  // helpers для мутаций — теперь через mutate(draft)
  const updateTerm = (patch) => mutate(s => ({...s, terminals: s.terminals.map(x => x.id === term.id ? {...x, ...patch} : x)}));
  const updateFolder = (patch) => mutate(s => ({...s, terminals: s.terminals.map(tt => tt.id !== term.id ? tt : {
    ...tt, folders: (tt.folders || []).map(f => f.id === folder.id ? {...f, ...patch} : f)
  })}));
  const updateFile = (patch) => mutate(s => ({...s, terminals: s.terminals.map(tt => tt.id !== term.id ? tt : {
    ...tt, folders: (tt.folders || []).map(f => f.id !== folder.id ? f : {
      ...f, files: (f.files || []).map(fl => fl.id === file.id ? {...fl, ...patch} : fl)
    })
  })}));

  const genPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pw = '';
    for (let i = 0; i < 8; i++) {
      pw += chars[Math.floor(Math.random() * chars.length)];
    }
    return pw;
  };

  const addTerminal = () => {
    const newT = {
      id: uid('t'),
      name: 'НОВЫЙ ТЕРМИНАЛ',
      password: genPassword(),
      level: 1,
      hostname: 'SITE-' + Math.floor(Math.random() * 99 + 1).toString().padStart(2, '0') + '-NEW',
      operator: 'НЕ НАЗНАЧЕН',
      motd: ['>> СОЕДИНЕНИЕ УСТАНОВЛЕНО <<'],
      folders: [],
    };
    mutate(s => ({...s, terminals: [...s.terminals, newT]}));
    setSelectedTermId(newT.id);
    setSelectedFolderId(null); setSelectedFileId(null);
    SCPAudio.beep(620, 0.05);
  };

  const delTerminal = () => setConfirm({
    title: 'Удалить терминал?',
    text: term.name + ' — это необратимо.',
    action: () => {
      mutate(s => ({...s, terminals: s.terminals.filter(x => x.id !== term.id)}));
      setSelectedTermId(null); setSelectedFolderId(null); setSelectedFileId(null);
    },
  });

  const addFolder = () => {
    const nf = { id: uid('f'), name: 'НОВАЯ_ПАПКА', files: [] };
    updateTerm({ folders: [...(term.folders || []), nf] });
    setSelectedFolderId(nf.id); setSelectedFileId(null);
    SCPAudio.beep(620, 0.05);
  };
  const delFolder = () => setConfirm({
    title: 'Удалить папку?',
    text: folder.name,
    action: () => {
      updateTerm({ folders: term.folders.filter(f => f.id !== folder.id) });
      setSelectedFolderId(null); setSelectedFileId(null);
    },
  });

  const addFile = () => {
    const nf = { id: uid('fl'), name: 'НОВЫЙ_ФАЙЛ.TXT', content: '' };
    updateFolder({ files: [...(folder.files || []), nf] });
    setSelectedFileId(nf.id);
    SCPAudio.beep(620, 0.05);
  };
  const delFile = () => setConfirm({
    title: 'Удалить файл?',
    text: file.name,
    action: () => {
      updateFolder({ files: folder.files.filter(fl => fl.id !== file.id) });
      setSelectedFileId(null);
    },
  });

  const applyTemplate = (kind) => {
    const tmpls = {
      scp: {
        name: 'SCP-XXX.DOC',
        content: 'ОБЪЕКТ №: SCP-XXX\nКЛАСС: БЕЗОПАСНЫЙ / ЕВКЛИД / КЕТЕР\n\nОСОБЫЕ УСЛОВИЯ СОДЕРЖАНИЯ:\n[описание условий]\n\nОПИСАНИЕ:\n[описание аномалии]\n\nПРИЛОЖЕНИЕ XXX-А:\n[журнал экспериментов]\n\n-- КОНЕЦ ДОКУМЕНТА --',
      },
      inc: {
        name: 'ИНЦИДЕНТ_XXX.LOG',
        content: 'ОТЧЁТ ОБ ИНЦИДЕНТЕ XXX\n========================\n\nДАТА: ██/██/1991\nМЕСТО: ______\nУЧАСТНИКИ: ______\n\nКРАТКОЕ ОПИСАНИЕ:\n[опишите событие]\n\nИСХОД:\n[опишите последствия]\n\nРЕАГИРОВАВШАЯ МОГ: ______\n\n-- СОСТАВИЛ: ______ --',
      },
      exp: {
        name: 'ЭКСПЕРИМЕНТ_XXX.LOG',
        content: 'ЖУРНАЛ ЭКСПЕРИМЕНТА XXX\n=========================\n\nОБЪЕКТ: SCP-███\nРУКОВОДИТЕЛЬ: д-р ______\nДАТА: ██/██/1991\n\nПРОЦЕДУРА:\n[описание теста]\n\nРЕЗУЛЬТАТ:\n[наблюдаемый исход]\n\nПРИМЕЧАНИЯ:\n[заметки исследователя]\n\n-- АРХИВИРОВАНО --',
      },
    };
    const tmpl = tmpls[kind];
    if (!tmpl || !file) return;
    updateFile(tmpl);
  };

  // Экспорт — берём draft, чтобы выгрузить ровно то, что юзер сейчас видит на экране.
  const doExport = () => { SCPStorage.exportJson(draft); SCPAudio.granted(); };

  const doImport = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    SCPStorage.importJson(f).then(data => {
      // Импорт = полная замена draft. Дорог до Firestore только через СОХРАНИТЬ.
      mutate(_ => data);
      setSelectedTermId(data.terminals[0]?.id || null);
      setSelectedFolderId(null); setSelectedFileId(null);
      SCPAudio.granted();
      alert('Импорт загружен в черновик. Нажмите СОХРАНИТЬ, чтобы применить.');
    }).catch(err => {
      SCPAudio.error();
      alert('Ошибка импорта: ' + err.message);
    });
    e.target.value = '';
  };

  const doReset = () => setConfirm({
    title: 'Сбросить всё?',
    text: 'Все изменения будут потеряны. Будут восстановлены seed-данные. (Применится после СОХРАНИТЬ.)',
    action: () => {
      const seed = SCPStorage.reset();
      mutate(_ => seed);
      setSelectedTermId(seed.terminals[0]?.id || null);
      setSelectedFolderId(null); setSelectedFileId(null);
    },
  });

  const doRestart = () => {
    // Все правки уже в Firestore. Этот тумблер просто триггерит общий reload
    // на всех клиентах (если игроки хотят перечитать после большого редактирования).
    // НЕ идёт через draft — это самостоятельный однополевой апдейт.
    setState({ lastForceReload: Date.now() });
    SCPAudio.granted();
    alert('✓ Команда reload разослана. Игровые вкладки перезагрузятся.');
  };

  // Выход с проверкой dirty
  const tryExit = () => {
    if (dirty) {
      setConfirm({
        title: 'Есть несохранённые изменения',
        text: 'Закрыть админ-панель без сохранения? Изменения будут потеряны.',
        action: () => { onExit(); },
      });
    } else {
      onExit();
    }
  };

  return (
    <div className="admin-panel">
      <div className="flex" style={{justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
        <h2>{'>>> ' + L.title + ' <<<'}</h2>
        <div className="flex gap-s" style={{alignItems: 'center'}}>
          <span className="t-dim mono" style={{fontSize: 14}}>{formatRetroDate(new Date())}</span>
          {hasRemoteUpdate && (
            <span className="mono t-amber" style={{fontSize: 12}} title="На сервере появились новые данные, пока вы редактировали. Сохранение перезапишет их.">
              {'⚠ есть свежие данные на сервере'}
            </span>
          )}
          <button
            className="btn"
            disabled={!dirty}
            onClick={save}
            style={dirty
              ? {borderColor: 'var(--phosphor-bright)', color: 'var(--phosphor-bright)', fontWeight: 'bold'}
              : {opacity: 0.5, cursor: 'not-allowed'}}
            title={dirty ? 'Записать черновик в Firestore' : 'Нет несохранённых изменений'}
          >
            {dirty ? '💾 СОХРАНИТЬ *' : '💾 СОХРАНИТЬ'}
          </button>
          <button
            className="btn"
            disabled={!dirty}
            onClick={revert}
            style={!dirty ? {opacity: 0.5, cursor: 'not-allowed'} : {}}
            title={dirty ? 'Отбросить все правки, вернуть к серверной версии' : 'Нечего отменять'}
          >
            {'↺ ОТМЕНИТЬ'}
          </button>
          <button className="btn" onClick={tryExit}>{L.close}</button>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={'btn' + (tab === 'terminals' ? ' active' : '')} onClick={() => setTab('terminals')}>{L.terminals}</button>
        <button className={'btn' + (tab === 'logs' ? ' active' : '')} onClick={() => { setTab('logs'); setLog(SCPStorage.loadLog()); }}>{L.logs}</button>
        <button className={'btn' + (tab === 'settings' ? ' active' : '')} onClick={() => setTab('settings')}>{L.settings}</button>
      </div>

      {tab === 'terminals' && (
        <div className="admin-body">
          <div className="admin-list">
            <div className="actions-bar">
              <button className="btn" onClick={addTerminal}>{L.newT}</button>
            </div>
            {terminals.map(x => (
              <div key={x.id} className={'row-item' + (x.id === selectedTermId ? ' active' : '')}
                onClick={() => { setSelectedTermId(x.id); setSelectedFolderId(null); setSelectedFileId(null); }}>
                <div>
                  <div>{x.name}</div>
                  <div className="meta">{x.hostname}</div>
                </div>
                <span className={'pill lvl-' + (x.level || 1)}>L{x.level || 1}</span>
              </div>
            ))}
          </div>
          <div className="admin-editor">
            {term && (
              <TerminalEditor
                term={term} folder={folder} file={file}
                selectedFolderId={selectedFolderId} selectedFileId={selectedFileId}
                setSelectedFolderId={setSelectedFolderId} setSelectedFileId={setSelectedFileId}
                updateTerm={updateTerm} updateFolder={updateFolder} updateFile={updateFile}
                addFolder={addFolder} delFolder={delFolder}
                addFile={addFile} delFile={delFile}
                delTerminal={delTerminal}
                applyTemplate={applyTemplate}
                onPreview={() => onPreview(term)}
                L={L}
              />
            )}
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div style={{overflowY: 'auto', flex: 1}}>
          <div className="actions-bar">
            <button className="btn danger" onClick={() => { SCPStorage.clearLog(); setLog([]); }}>{L.clearLog}</button>
          </div>
          {log.length === 0 && <div className="t-dim mono">{L.logsEmpty}</div>}
          {log.slice().reverse().map((e, i) => (
            <div key={i} className="mono" style={{padding: '4px 0', borderBottom: '1px dashed var(--phosphor-dim)'}}>
              <span className="t-dim">{e.ts}</span>{' · '}
              <span className={e.ok ? 't-bright' : 't-red'}>{e.ok ? 'ДОСТУП' : 'ОТКАЗ'}</span>
              {' · '}
              <span>{e.type}</span>
              {e.terminal && <span>{' → ' + e.terminal}</span>}
              {e.password && <span className="t-dim">{' [pw: ' + e.password + ']'}</span>}
            </div>
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div style={{overflowY: 'auto', flex: 1}}>
          <div className="field">
            <label>{L.master}</label>
            <input type="text" value={draft.masterPassword || ''}
              onChange={e => mutate(s => ({...s, masterPassword: e.target.value}))} />
          </div>

          <div className="field" style={{padding: 10, border: '1px dashed var(--phosphor-dim)'}}>
            <label style={{color: 'var(--phosphor-bright)'}}>
              {'🔑 ИЗВЕСТНЫЕ ПАРОЛИ (ВИДНЫ ИГРОКАМ)'}
            </label>
            <div className="mono t-dim" style={{fontSize: 13, marginTop: 4, marginBottom: 10, lineHeight: 1.3}}>
              {'Отметьте пароли, которые игроки "нашли" в настольной игре. В экране логина у них появится кнопка НАЙДЕННЫЕ ПАРОЛИ с выбранными записями и вашими заметками.'}
            </div>
            {draft.terminals.map(t0 => {
              const setHint = (patch) => mutate(s => ({
                ...s,
                terminals: s.terminals.map(x => x.id === t0.id ? { ...x, ...patch } : x),
              }));
              return (
                <div key={t0.id} className="hint-row">
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, color: 'var(--phosphor-bright)', textTransform: 'none', fontSize: 15, marginBottom: 6}}>
                    <input type="checkbox" checked={!!t0.hintRevealed}
                      onChange={e => setHint({ hintRevealed: e.target.checked })}
                      style={{width: 'auto', accentColor: 'var(--phosphor)'}} />
                    <span>
                      <span className="t-bright">{t0.name}</span>
                      <span className="t-dim"> · {t0.hostname} · </span>
                      <span className="t-amber" style={{letterSpacing: '0.08em'}}>{t0.password}</span>
                    </span>
                  </label>
                  {t0.hintRevealed && (
                    <textarea
                      placeholder={'Заметка для игроков (например: "найден в кармане д-ра Клефа")'}
                      value={t0.hintNotes || ''}
                      onChange={e => setHint({ hintNotes: e.target.value })}
                      style={{minHeight: 60, fontSize: 14}}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <div className="field" style={{padding: 10, border: '1px dashed var(--amber)'}}>
            <label style={{cursor: 'pointer', color: 'var(--amber)', display: 'flex', alignItems: 'center', gap: 8}}>
              <input type="checkbox" checked={!!draft.virusDiskReady}
                onChange={e => mutate(s => ({...s, virusDiskReady: e.target.checked}))}
                style={{width: 'auto', accentColor: 'var(--amber)'}} />
              {'💾 ВИРУС-ДИСКЕТА СОБРАНА'}
            </label>
            <div className="mono t-dim" style={{fontSize: 13, marginTop: 6, lineHeight: 1.3}}>
              {'Включите, когда игроки в физической игре соберут вирус-дискету. На экране пароля появится возможность запустить взлом целевого терминала — при успехе получат пароль.'}
            </div>

            <div className="field-row" style={{marginTop: 12}}>
              <div className="field">
                <label>{'ЦЕЛЬ ХАКА — ТЕРМИНАЛ'}</label>
                <select
                  value={draft.hackTargetTerminalId || ''}
                  onChange={e => mutate(s => ({...s, hackTargetTerminalId: e.target.value || null}))}
                >
                  <option value="">{'— выберите терминал-цель —'}</option>
                  {draft.terminals.map(t0 => (
                    <option key={t0.id} value={t0.id}>
                      {t0.name + ' · ' + t0.hostname + ' · [' + t0.password + ']'}
                    </option>
                  ))}
                </select>
                {draft.hackTargetTerminalId && (() => {
                  const tgt = (draft.terminals || []).find(t => t.id === draft.hackTargetTerminalId);
                  const tname = tgt ? tgt.name : '';
                  return tname ? (
                    <div className="mono t-amber" style={{fontSize: 12, marginTop: 6}}>
                      {'▶ Игроки видят подсказку о терминале: ' + tname}
                    </div>
                  ) : null;
                })()}
              </div>
              <div className="field">
                <label>{'ТИП ГОЛОВОЛОМКИ'}</label>
                <select
                  value={draft.hackPuzzleType || 'random'}
                  onChange={e => mutate(s => ({...s, hackPuzzleType: e.target.value}))}
                >
                  <option value="random">{'🎲 случайная'}</option>
                  <option value="wordsearch">{'🔤 поиск слов (15×15)'}</option>
                  <option value="sequence">{'🟦 повтор последовательности'}</option>
                  <option value="cipher">{'🔐 шифр Цезаря'}</option>
                  <option value="memory">{'🧠 запомни сетку'}</option>
                  <option value="pipe">{'🚰 соедини трубы'}</option>
                  <option value="typer">{'⌨️ скорость ввода'}</option>
                </select>
              </div>
            </div>
          </div>
          <div className="actions-bar">
            <button className="btn" onClick={doExport}>{L.exportJ}</button>
            <label className="btn" style={{cursor: 'pointer'}}>
              {L.importJ}
              <input type="file" accept="application/json,.json" style={{display: 'none'}} onChange={doImport} />
            </label>
            <button className="btn" onClick={doRestart} style={{backgroundColor: 'rgba(255, 160, 0, 0.3)', borderColor: '#ffa000'}}>⟳ СИНХРОНИЗИРОВАТЬ</button>
            <button className="btn danger" onClick={doReset}>{L.reset}</button>
          </div>
          <div className="mono t-dim" style={{marginTop: 16, lineHeight: 1.4}}>
            <div>// КАК РАБОТАЕТ СОХРАНЕНИЕ //</div>
            <div>· Все правки в админке копятся в локальном черновике.</div>
            <div>· В Firestore (и игрокам) уходит только по кнопке 💾 СОХРАНИТЬ.</div>
            <div>· ↺ ОТМЕНИТЬ — выкидывает черновик и возвращается к серверной версии.</div>
            <div>· При попытке закрыть админку с несохранёнными правками — будет запрос подтверждения.</div>
            <div>· Чтобы передать терминалы другому мастеру или сохранить версию — используйте ЭКСПОРТ JSON.</div>
            <div>· Чтобы сделать набор терминалов \"каноном\" — замените data/seed.js в репозитории на экспортированный JSON.</div>
            <div>· СБРОС К SEED — восстанавливает исходные терминалы из репозитория (применится по СОХРАНИТЬ).</div>
          </div>
        </div>
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{confirm.title}</h3>
            <div className="mono t-dim">{confirm.text}</div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setConfirm(null)}>{'ОТМЕНА'}</button>
              <button className="btn danger" onClick={() => { confirm.action(); setConfirm(null); }}>{'ПОДТВЕРДИТЬ'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TerminalEditor({
  term, folder, file,
  selectedFolderId, selectedFileId,
  setSelectedFolderId, setSelectedFileId,
  updateTerm, updateFolder, updateFile,
  addFolder, delFolder, addFile, delFile, delTerminal,
  applyTemplate, onPreview, L,
}) {
  return (
    <div>
      <div className="actions-bar">
        <button className="btn" onClick={onPreview}>{'▶ ' + L.preview}</button>
        <button className="btn danger" onClick={delTerminal}>{L.del}</button>
      </div>

      <div className="field-row">
        <div className="field">
          <label>{L.name}</label>
          <input type="text" value={term.name || ''} onChange={e => updateTerm({name: e.target.value})} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>{L.host}</label>
          <input type="text" value={term.hostname || ''} onChange={e => updateTerm({hostname: e.target.value})} />
        </div>
        <div className="field">
          <label>{L.op}</label>
          <input type="text" value={term.operator || ''} onChange={e => updateTerm({operator: e.target.value})} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>{L.pw}</label>
          <input type="text" value={term.password || ''} onChange={e => updateTerm({password: e.target.value})} />
        </div>
        <div className="field">
          <label>{L.lvl}</label>
          <select value={term.level || 1} onChange={e => updateTerm({level: Number(e.target.value)})}>
            <option value={1}>1 / ОГРАНИЧЕННЫЙ</option>
            <option value={2}>2 / КОНФИДЕНЦИАЛЬНЫЙ</option>
            <option value={3}>3 / СЕКРЕТНО</option>
            <option value={4}>4 / СОВ. СЕКРЕТНО</option>
            <option value={5}>5 / КОСМИЧЕСКИЙ</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>{L.motd}</label>
          <textarea value={(term.motd || []).join('\n')} onChange={e => updateTerm({motd: e.target.value.split('\n')})} />
        </div>
      </div>

      <hr style={{border: 0, borderTop: '1px dashed var(--phosphor-dim)', margin: '16px 0'}} />

      {/* Папки */}
      <div className="field-row" style={{alignItems: 'flex-start'}}>
        <div className="field" style={{flex: '0 0 220px'}}>
          <label>{'ПАПКИ (' + (term.folders || []).length + ')'}</label>
          <div className="actions-bar">
            <button className="btn" onClick={addFolder}>{L.newF}</button>
          </div>
          {(term.folders || []).map(f => (
            <div key={f.id} className={'row-item' + (f.id === selectedFolderId ? ' active' : '')}
              onClick={() => { setSelectedFolderId(f.id); setSelectedFileId(null); }}>
              <div>{f.name}</div>
              <span className="meta">{(f.files || []).length}</span>
            </div>
          ))}
        </div>

        <div className="field" style={{flex: 1, minWidth: 200}}>
          {folder && (
            <div>
              <label>{'НАСТРОЙКИ ПАПКИ'}</label>
              <div className="field-row">
                <div className="field">
                  <label>{L.name}</label>
                  <input type="text" value={folder.name || ''} onChange={e => updateFolder({name: e.target.value})} />
                </div>
              </div>
              <div className="actions-bar">
                <button className="btn" onClick={addFile}>{L.newFl}</button>
                <button className="btn danger" onClick={delFolder}>{L.del}</button>
              </div>
              <label>{'ФАЙЛЫ (' + (folder.files || []).length + ')'}</label>
              {(folder.files || []).map(fl => (
                <div key={fl.id} className={'row-item' + (fl.id === selectedFileId ? ' active' : '')}
                  onClick={() => setSelectedFileId(fl.id)}>
                  <div>
                    {fl.corrupted && <span className="t-red">[!] </span>}
                    {fl.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {file && (
            <div style={{marginTop: 16, borderTop: '1px dashed var(--phosphor-dim)', paddingTop: 12}}>
              <label>{'НАСТРОЙКИ ФАЙЛА'}</label>
              <div className="field-row">
                <div className="field">
                  <label>{L.name}</label>
                  <input type="text" value={file.name || ''} onChange={e => updateFile({name: e.target.value})} />
                </div>
              </div>
              <div className="field">
                <label style={{cursor: 'pointer'}}>
                  <input type="checkbox" checked={!!file.corrupted}
                    onChange={e => updateFile({corrupted: e.target.checked})}
                    style={{marginRight: 8}} />
                  {L.corrupted}
                </label>
              </div>
              <div className="field">
                <label>{L.templates}</label>
                <div className="actions-bar">
                  <button className="btn" onClick={() => applyTemplate('scp')}>{L.tmplScp}</button>
                  <button className="btn" onClick={() => applyTemplate('inc')}>{L.tmplInc}</button>
                  <button className="btn" onClick={() => applyTemplate('exp')}>{L.tmplExp}</button>
                </div>
              </div>
              <div className="field">
                <label>{L.content}</label>
                <textarea value={file.content || ''} onChange={e => updateFile({content: e.target.value})} style={{minHeight: 240, fontSize: 14}} />
              </div>
              <div className="actions-bar">
                <button className="btn danger" onClick={delFile}>{L.del}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.AdminPanel = AdminPanel;

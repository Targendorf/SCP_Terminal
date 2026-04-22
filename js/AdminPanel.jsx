// Админ-панель: CRUD терминалов, папок, файлов, экспорт/импорт, логи
function AdminPanel({ lang, state, setState, onExit, onPreview }) {
  const [tab, setTab] = useState('terminals'); // terminals | logs | settings
  const [selectedTermId, setSelectedTermId] = useState(state.terminals[0]?.id || null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [log, setLog] = useState(() => SCPStorage.loadLog());
  const [confirm, setConfirm] = useState(null);

  const t = lang === 'ru';
  const L = {
    title: t ? 'АДМИНИСТРАТИВНАЯ КОНСОЛЬ' : 'ADMINISTRATOR CONSOLE',
    terminals: t ? 'ТЕРМИНАЛЫ' : 'TERMINALS',
    logs: t ? 'ЖУРНАЛ ВХОДОВ' : 'LOGIN LOG',
    settings: t ? 'НАСТРОЙКИ' : 'SETTINGS',
    close: t ? 'ВЫЙТИ' : 'EXIT',
    newT: t ? '+ ТЕРМИНАЛ' : '+ TERMINAL',
    newF: t ? '+ ПАПКА' : '+ FOLDER',
    newFl: t ? '+ ФАЙЛ' : '+ FILE',
    del: t ? 'УДАЛИТЬ' : 'DELETE',
    preview: t ? 'ПРЕДПРОСМОТР' : 'PREVIEW',
    exportJ: t ? 'ЭКСПОРТ JSON' : 'EXPORT JSON',
    importJ: t ? 'ИМПОРТ JSON' : 'IMPORT JSON',
    reset: t ? 'СБРОС К SEED' : 'RESET TO SEED',
    master: t ? 'МАСТЕР-ПАРОЛЬ' : 'MASTER PASSWORD',
    nameEn: t ? 'НАЗВАНИЕ (EN)' : 'NAME (EN)',
    nameRu: t ? 'НАЗВАНИЕ (RU)' : 'NAME (RU)',
    host: t ? 'HOSTNAME' : 'HOSTNAME',
    op: t ? 'ОПЕРАТОР' : 'OPERATOR',
    pw: t ? 'ПАРОЛЬ ДОСТУПА' : 'ACCESS PASSWORD',
    lvl: t ? 'УРОВЕНЬ (1-5)' : 'LEVEL (1-5)',
    motdEn: t ? 'MOTD (EN, по строке)' : 'MOTD (EN, one per line)',
    motdRu: t ? 'MOTD (RU, по строке)' : 'MOTD (RU, one per line)',
    contentEn: t ? 'СОДЕРЖИМОЕ (EN)' : 'CONTENT (EN)',
    contentRu: t ? 'СОДЕРЖИМОЕ (RU)' : 'CONTENT (RU)',
    corrupted: t ? 'Помечен как [ПОВРЕЖДЁН]' : 'Mark as [CORRUPTED]',
    templates: t ? 'ШАБЛОНЫ' : 'TEMPLATES',
    tmplScp: t ? 'SCP-объект' : 'SCP Object',
    tmplInc: t ? 'Инцидент' : 'Incident',
    tmplExp: t ? 'Эксперимент' : 'Experiment',
    logsEmpty: t ? 'Журнал пуст.' : 'Log is empty.',
    clearLog: t ? 'ОЧИСТИТЬ ЖУРНАЛ' : 'CLEAR LOG',
    savedAs: t ? 'Файл JSON сохранён в загрузки.' : 'JSON file saved to downloads.',
  };

  const terminals = state.terminals;
  const term = terminals.find(x => x.id === selectedTermId) || null;
  const folder = term ? (term.folders || []).find(x => x.id === selectedFolderId) : null;
  const file = folder ? (folder.files || []).find(x => x.id === selectedFileId) : null;

  // helpers для мутаций
  const updateTerm = (patch) => setState(s => ({...s, terminals: s.terminals.map(x => x.id === term.id ? {...x, ...patch} : x)}));
  const updateFolder = (patch) => setState(s => ({...s, terminals: s.terminals.map(tt => tt.id !== term.id ? tt : {
    ...tt, folders: (tt.folders || []).map(f => f.id === folder.id ? {...f, ...patch} : f)
  })}));
  const updateFile = (patch) => setState(s => ({...s, terminals: s.terminals.map(tt => tt.id !== term.id ? tt : {
    ...tt, folders: (tt.folders || []).map(f => f.id !== folder.id ? f : {
      ...f, files: (f.files || []).map(fl => fl.id === file.id ? {...fl, ...patch} : fl)
    })
  })}));

  const addTerminal = () => {
    const newT = {
      id: uid('t'),
      name: 'NEW TERMINAL',
      nameRu: 'НОВЫЙ ТЕРМИНАЛ',
      password: 'changeme-' + Math.floor(Math.random() * 9000 + 1000),
      level: 1,
      hostname: 'SITE-' + Math.floor(Math.random() * 99 + 1).toString().padStart(2, '0') + '-NEW',
      operator: 'UNASSIGNED',
      operatorEn: 'UNASSIGNED',
      motd: ['>> CONNECTION ESTABLISHED <<'],
      motdRu: ['>> СОЕДИНЕНИЕ УСТАНОВЛЕНО <<'],
      folders: [],
    };
    setState(s => ({...s, terminals: [...s.terminals, newT]}));
    setSelectedTermId(newT.id);
    setSelectedFolderId(null); setSelectedFileId(null);
    SCPAudio.beep(620, 0.05);
  };

  const delTerminal = () => setConfirm({
    title: t ? 'Удалить терминал?' : 'Delete terminal?',
    text: term.name + ' — ' + (t ? 'это необратимо.' : 'this is irreversible.'),
    action: () => {
      setState(s => ({...s, terminals: s.terminals.filter(x => x.id !== term.id)}));
      setSelectedTermId(null); setSelectedFolderId(null); setSelectedFileId(null);
    },
  });

  const addFolder = () => {
    const nf = { id: uid('f'), name: 'NEW_FOLDER', nameRu: 'НОВАЯ_ПАПКА', files: [] };
    updateTerm({ folders: [...(term.folders || []), nf] });
    setSelectedFolderId(nf.id); setSelectedFileId(null);
    SCPAudio.beep(620, 0.05);
  };
  const delFolder = () => setConfirm({
    title: t ? 'Удалить папку?' : 'Delete folder?',
    text: folder.name,
    action: () => {
      updateTerm({ folders: term.folders.filter(f => f.id !== folder.id) });
      setSelectedFolderId(null); setSelectedFileId(null);
    },
  });

  const addFile = () => {
    const nf = { id: uid('fl'), name: 'NEW_FILE.TXT', nameRu: 'НОВЫЙ_ФАЙЛ.TXT', contentEn: '', contentRu: '' };
    updateFolder({ files: [...(folder.files || []), nf] });
    setSelectedFileId(nf.id);
    SCPAudio.beep(620, 0.05);
  };
  const delFile = () => setConfirm({
    title: t ? 'Удалить файл?' : 'Delete file?',
    text: file.name,
    action: () => {
      updateFolder({ files: folder.files.filter(fl => fl.id !== file.id) });
      setSelectedFileId(null);
    },
  });

  const applyTemplate = (kind) => {
    const tmpls = {
      scp: {
        name: 'SCP-XXX.DOC', nameRu: 'SCP-XXX.DOC',
        contentEn: 'ITEM #: SCP-XXX\nOBJECT CLASS: SAFE / EUCLID / KETER\n\nSPECIAL CONTAINMENT PROCEDURES:\n[describe containment]\n\nDESCRIPTION:\n[describe the anomaly]\n\nADDENDUM XXX-A:\n[optional experiment logs]\n\n-- END OF DOCUMENT --',
        contentRu: 'ОБЪЕКТ №: SCP-XXX\nКЛАСС: БЕЗОПАСНЫЙ / ЕВКЛИД / КЕТЕР\n\nОСОБЫЕ УСЛОВИЯ СОДЕРЖАНИЯ:\n[описание условий]\n\nОПИСАНИЕ:\n[описание аномалии]\n\nПРИЛОЖЕНИЕ XXX-А:\n[журнал экспериментов]\n\n-- КОНЕЦ ДОКУМЕНТА --',
      },
      inc: {
        name: 'INCIDENT_XXX.LOG', nameRu: 'ИНЦИДЕНТ_XXX.LOG',
        contentEn: 'INCIDENT REPORT XXX\n====================\n\nDATE: ██/██/1991\nLOCATION: ______\nPERSONNEL INVOLVED: ______\n\nSUMMARY:\n[describe the event]\n\nOUTCOME:\n[describe aftermath]\n\nRESPONDING MTF: ______\n\n-- FILED BY: ______ --',
        contentRu: 'ОТЧЁТ ОБ ИНЦИДЕНТЕ XXX\n========================\n\nДАТА: ██/██/1991\nМЕСТО: ______\nУЧАСТНИКИ: ______\n\nКРАТКОЕ ОПИСАНИЕ:\n[опишите событие]\n\nИСХОД:\n[опишите последствия]\n\nРЕАГИРОВАВШАЯ МОГ: ______\n\n-- СОСТАВИЛ: ______ --',
      },
      exp: {
        name: 'EXPERIMENT_XXX.LOG', nameRu: 'ЭКСПЕРИМЕНТ_XXX.LOG',
        contentEn: 'EXPERIMENT LOG XXX\n====================\n\nSUBJECT: SCP-███\nCONDUCTED BY: Dr. ______\nDATE: ██/██/1991\n\nPROCEDURE:\n[describe the test]\n\nRESULT:\n[observed outcome]\n\nNOTES:\n[researcher notes]\n\n-- ARCHIVED --',
        contentRu: 'ЖУРНАЛ ЭКСПЕРИМЕНТА XXX\n=========================\n\nОБЪЕКТ: SCP-███\nРУКОВОДИТЕЛЬ: д-р ______\nДАТА: ██/██/1991\n\nПРОЦЕДУРА:\n[описание теста]\n\nРЕЗУЛЬТАТ:\n[наблюдаемый исход]\n\nПРИМЕЧАНИЯ:\n[заметки исследователя]\n\n-- АРХИВИРОВАНО --',
      },
    };
    const tmpl = tmpls[kind];
    if (!tmpl || !file) return;
    updateFile(tmpl);
  };

  const doExport = () => { SCPStorage.exportJson(state); SCPAudio.granted(); };

  const doImport = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    SCPStorage.importJson(f).then(data => {
      setState(data);
      setSelectedTermId(data.terminals[0]?.id || null);
      setSelectedFolderId(null); setSelectedFileId(null);
      SCPAudio.granted();
      alert(t ? 'Импорт успешно завершён.' : 'Import successful.');
    }).catch(err => {
      SCPAudio.error();
      alert((t ? 'Ошибка импорта: ' : 'Import error: ') + err.message);
    });
    e.target.value = '';
  };

  const doReset = () => setConfirm({
    title: t ? 'Сбросить всё?' : 'Reset everything?',
    text: t ? 'Все изменения будут потеряны. Будут восстановлены seed-данные.' : 'All changes will be lost. Seed data will be restored.',
    action: () => {
      const seed = SCPStorage.reset();
      setState(seed);
      setSelectedTermId(seed.terminals[0]?.id || null);
      setSelectedFolderId(null); setSelectedFileId(null);
    },
  });

  return (
    <div className="admin-panel">
      <div className="flex" style={{justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
        <h2>{'>>> ' + L.title + ' <<<'}</h2>
        <div className="flex gap-s">
          <span className="t-dim mono" style={{fontSize: 14}}>{formatRetroDate(new Date(), lang)}</span>
          <button className="btn" onClick={onExit}>{L.close}</button>
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
                  <div>{lang === 'ru' ? (x.nameRu || x.name) : x.name}</div>
                  <div className="meta">{x.hostname}</div>
                </div>
                <span className={'pill lvl-' + (x.level || 1)}>L{x.level || 1}</span>
              </div>
            ))}
          </div>
          <div className="admin-editor">
            {term && (
              <TerminalEditor
                lang={lang} term={term} folder={folder} file={file}
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
              <span className={e.ok ? 't-bright' : 't-red'}>{e.ok ? (t ? 'ДОСТУП' : 'ACCESS') : (t ? 'ОТКАЗ' : 'DENIED')}</span>
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
            <input type="text" value={state.masterPassword || ''}
              onChange={e => setState(s => ({...s, masterPassword: e.target.value}))} />
          </div>

          <div className="field" style={{padding: 10, border: '1px dashed var(--phosphor-dim)'}}>
            <label style={{color: 'var(--phosphor-bright)'}}>
              {t ? '🔑 ИЗВЕСТНЫЕ ПАРОЛИ (ВИДНЫ ИГРОКАМ)' : '🔑 KNOWN PASSWORDS (VISIBLE TO PLAYERS)'}
            </label>
            <div className="mono t-dim" style={{fontSize: 13, marginTop: 4, marginBottom: 10, lineHeight: 1.3}}>
              {t
                ? 'Отметьте пароли, которые игроки "нашли" в настольной игре. В экране логина у них появится кнопка НАЙДЕННЫЕ ПАРОЛИ с выбранными записями и вашими заметками.'
                : 'Check passwords the players "found" in the tabletop game. On the login screen they will see a FOUND PASSWORDS button with the selected entries and your notes.'}
            </div>
            {state.terminals.map(term => {
              const setHint = (patch) => setState(s => ({
                ...s,
                terminals: s.terminals.map(x => x.id === term.id ? { ...x, ...patch } : x),
              }));
              return (
                <div key={term.id} className="hint-row">
                  <label style={{display: 'flex', alignItems: 'center', gap: 8, color: 'var(--phosphor-bright)', textTransform: 'none', fontSize: 15, marginBottom: 6}}>
                    <input type="checkbox" checked={!!term.hintRevealed}
                      onChange={e => setHint({ hintRevealed: e.target.checked })}
                      style={{width: 'auto', accentColor: 'var(--phosphor)'}} />
                    <span>
                      <span className="t-bright">{lang === 'ru' ? (term.nameRu || term.name) : term.name}</span>
                      <span className="t-dim"> · {term.hostname} · </span>
                      <span className="t-amber" style={{letterSpacing: '0.08em'}}>{term.password}</span>
                    </span>
                  </label>
                  {term.hintRevealed && (
                    <textarea
                      placeholder={t ? 'Заметка для игроков (например: "найден в кармане д-ра Клефа")' : 'Note for players (e.g. "found in Dr. Clef\u2019s pocket")'}
                      value={term.hintNotes || ''}
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
              <input type="checkbox" checked={!!state.virusDiskReady}
                onChange={e => setState(s => ({...s, virusDiskReady: e.target.checked}))}
                style={{width: 'auto', accentColor: 'var(--amber)'}} />
              {t ? '💾 ВИРУС-ДИСКЕТА СОБРАНА' : '💾 VIRUS DISK ASSEMBLED'}
            </label>
            <div className="mono t-dim" style={{fontSize: 13, marginTop: 6, lineHeight: 1.3}}>
              {t
                ? 'Включите, когда игроки в физической игре соберут вирус-дискету. На экране пароля появится команда /hack, которая запустит мини-игру "поиск слов". При успехе игроки получат пароль от одного из терминалов.'
                : 'Enable when players assemble the virus disk in the tabletop game. The password screen will reveal the /hack command, launching a word-search mini-game. On success, players receive a random terminal password.'}
            </div>
          </div>
          <div className="actions-bar">
            <button className="btn" onClick={doExport}>{L.exportJ}</button>
            <label className="btn" style={{cursor: 'pointer'}}>
              {L.importJ}
              <input type="file" accept="application/json,.json" style={{display: 'none'}} onChange={doImport} />
            </label>
            <button className="btn danger" onClick={doReset}>{L.reset}</button>
          </div>
          <div className="mono t-dim" style={{marginTop: 16, lineHeight: 1.4}}>
            {t ? (
              <>
                <div>// КАК РАБОТАЕТ СОХРАНЕНИЕ //</div>
                <div>· Все изменения автоматически сохраняются в localStorage браузера.</div>
                <div>· Проект задеплоен статически (Vercel/Git), поэтому серверной базы нет.</div>
                <div>· Чтобы передать терминалы другому мастеру или сохранить версию — используйте ЭКСПОРТ JSON.</div>
                <div>· Чтобы сделать набор терминалов "каноном" — замените data/seed.js в репозитории на экспортированный JSON.</div>
                <div>· СБРОС К SEED — восстанавливает исходные терминалы из репозитория.</div>
              </>
            ) : (
              <>
                <div>// HOW PERSISTENCE WORKS //</div>
                <div>· All changes are auto-saved to browser localStorage.</div>
                <div>· Project is statically deployed (Vercel/Git), no server DB.</div>
                <div>· To share with another GM or save a version — use EXPORT JSON.</div>
                <div>· To make a set canonical — replace data/seed.js in the repo with the exported JSON.</div>
                <div>· RESET TO SEED — restores the original terminals from the repo.</div>
              </>
            )}
          </div>
        </div>
      )}

      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>{confirm.title}</h3>
            <div className="mono t-dim">{confirm.text}</div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setConfirm(null)}>{t ? 'ОТМЕНА' : 'CANCEL'}</button>
              <button className="btn danger" onClick={() => { confirm.action(); setConfirm(null); }}>{t ? 'ПОДТВЕРДИТЬ' : 'CONFIRM'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TerminalEditor({
  lang, term, folder, file,
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
          <label>{L.nameEn}</label>
          <input type="text" value={term.name || ''} onChange={e => updateTerm({name: e.target.value})} />
        </div>
        <div className="field">
          <label>{L.nameRu}</label>
          <input type="text" value={term.nameRu || ''} onChange={e => updateTerm({nameRu: e.target.value})} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>{L.host}</label>
          <input type="text" value={term.hostname || ''} onChange={e => updateTerm({hostname: e.target.value})} />
        </div>
        <div className="field">
          <label>{L.op}</label>
          <input type="text" value={term.operator || ''} onChange={e => updateTerm({operator: e.target.value, operatorEn: e.target.value})} />
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
            <option value={1}>1 / RESTRICTED</option>
            <option value={2}>2 / CONFIDENTIAL</option>
            <option value={3}>3 / SECRET</option>
            <option value={4}>4 / TOP SECRET</option>
            <option value={5}>5 / COSMIC</option>
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label>{L.motdEn}</label>
          <textarea value={(term.motd || []).join('\n')} onChange={e => updateTerm({motd: e.target.value.split('\n')})} />
        </div>
        <div className="field">
          <label>{L.motdRu}</label>
          <textarea value={(term.motdRu || []).join('\n')} onChange={e => updateTerm({motdRu: e.target.value.split('\n')})} />
        </div>
      </div>

      <hr style={{border: 0, borderTop: '1px dashed var(--phosphor-dim)', margin: '16px 0'}} />

      {/* Папки */}
      <div className="field-row" style={{alignItems: 'flex-start'}}>
        <div className="field" style={{flex: '0 0 220px'}}>
          <label>{(lang === 'ru' ? 'ПАПКИ' : 'FOLDERS') + ' (' + (term.folders || []).length + ')'}</label>
          <div className="actions-bar">
            <button className="btn" onClick={addFolder}>{L.newF}</button>
          </div>
          {(term.folders || []).map(f => (
            <div key={f.id} className={'row-item' + (f.id === selectedFolderId ? ' active' : '')}
              onClick={() => { setSelectedFolderId(f.id); setSelectedFileId(null); }}>
              <div>{lang === 'ru' ? (f.nameRu || f.name) : f.name}</div>
              <span className="meta">{(f.files || []).length}</span>
            </div>
          ))}
        </div>

        <div className="field" style={{flex: 1, minWidth: 200}}>
          {folder && (
            <div>
              <label>{lang === 'ru' ? 'НАСТРОЙКИ ПАПКИ' : 'FOLDER SETTINGS'}</label>
              <div className="field-row">
                <div className="field">
                  <label>{L.nameEn}</label>
                  <input type="text" value={folder.name || ''} onChange={e => updateFolder({name: e.target.value})} />
                </div>
                <div className="field">
                  <label>{L.nameRu}</label>
                  <input type="text" value={folder.nameRu || ''} onChange={e => updateFolder({nameRu: e.target.value})} />
                </div>
              </div>
              <div className="actions-bar">
                <button className="btn" onClick={addFile}>{L.newFl}</button>
                <button className="btn danger" onClick={delFolder}>{L.del}</button>
              </div>
              <label>{(lang === 'ru' ? 'ФАЙЛЫ' : 'FILES') + ' (' + (folder.files || []).length + ')'}</label>
              {(folder.files || []).map(fl => (
                <div key={fl.id} className={'row-item' + (fl.id === selectedFileId ? ' active' : '')}
                  onClick={() => setSelectedFileId(fl.id)}>
                  <div>
                    {fl.corrupted && <span className="t-red">[!] </span>}
                    {lang === 'ru' ? (fl.nameRu || fl.name) : fl.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {file && (
            <div style={{marginTop: 16, borderTop: '1px dashed var(--phosphor-dim)', paddingTop: 12}}>
              <label>{lang === 'ru' ? 'НАСТРОЙКИ ФАЙЛА' : 'FILE SETTINGS'}</label>
              <div className="field-row">
                <div className="field">
                  <label>{L.nameEn}</label>
                  <input type="text" value={file.name || ''} onChange={e => updateFile({name: e.target.value})} />
                </div>
                <div className="field">
                  <label>{L.nameRu}</label>
                  <input type="text" value={file.nameRu || ''} onChange={e => updateFile({nameRu: e.target.value})} />
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
              <div className="field-row">
                <div className="field">
                  <label>{L.contentEn}</label>
                  <textarea value={file.contentEn || ''} onChange={e => updateFile({contentEn: e.target.value})} style={{minHeight: 240, fontSize: 14}} />
                </div>
                <div className="field">
                  <label>{L.contentRu}</label>
                  <textarea value={file.contentRu || ''} onChange={e => updateFile({contentRu: e.target.value})} style={{minHeight: 240, fontSize: 14}} />
                </div>
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

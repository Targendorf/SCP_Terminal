// ============================================================
// SEED-ДАННЫЕ: ЛИЧНЫЕ ТЕРМИНАЛЫ СОТРУДНИКОВ ЗОНЫ-19
// Фонд SCP — Зона содержания №19
// Сентябрь 1991 г.
// Американские имена; все объекты берутся из базы Зоны-19.
// ============================================================

window.SCP_SEED_STAFF = [

  // ─────────────────────────────────────────────────────────
  // 1. DR. HAROLD FENWICK — Исследователь (Уровень 2)
  //    Отдел биологических аномалий
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-fenwick",
    name: "SITE-19 / DR. H. FENWICK",
    nameRu: "ЗОНА-19 / Д-Р Г. ФЕНВИК",
    password: "marrow77",
    level: 2,
    hostname: "SITE19-RSH-07",
    operator: "DR. H. FENWICK",
    operatorEn: "DR. H. FENWICK",
    motd: [
      ">> CONNECTION ESTABLISHED <<",
      ">> SITE-19 RESEARCH TERMINAL <<",
      ">> DR. FENWICK — CLEARANCE LVL 2 <<",
    ],
    motdRu: [
      ">> СОЕДИНЕНИЕ УСТАНОВЛЕНО <<",
      ">> ИССЛЕДОВАТЕЛЬСКИЙ ТЕРМИНАЛ ЗОНЫ-19 <<",
      ">> Д-Р ФЕНВИК — ДОПУСК УР. 2 <<",
    ],
    folders: [
      {
        id: "fw-f1",
        name: "RESEARCH_LOGS",
        nameRu: "ЖУРНАЛЫ_ИССЛЕДОВАНИЙ",
        files: [
          {
            id: "fw-fl1",
            name: "EXP_999_SEP91.LOG",
            nameRu: "ЭКС_999_СЕН91.LOG",
            contentEn: `EXPERIMENT LOG — SCP-999
DATE: 03 SEP 1991
RESEARCHER: DR. H. FENWICK
CLEARANCE LEVEL: 2

OBJECTIVE:
Determine whether prolonged exposure to
SCP-999 reduces baseline cortisol levels
in Foundation research staff.

SUBJECTS: D-1142, D-1143, D-1144
DURATION: 40 minutes each

RESULTS:
All three D-class subjects reported
immediate euphoria upon contact.
D-1142 laughed uncontrollably for
22 minutes. Post-session cortisol
readings dropped by ~38%.

SCP-999 appeared enthusiastic. It
consumed approximately 800g of M&Ms
supplied by Dr. Carmichael during the
session. No adverse effects observed.

CONCLUSION:
Recommend weekly therapeutic exposure
sessions for high-stress personnel.
Submitting formal proposal to Dr. Reyes.

NOTE: SCP-999 tried to follow me out
of the enclosure. Had to use three
orderlies to redirect it. Adorable.

-- H. Fenwick, PhD
   Dept. of Biological Anomalies`,
            contentRu: `ЖУРНАЛ ЭКСПЕРИМЕНТА — SCP-999
ДАТА: 03 СЕН 1991
ИССЛЕДОВАТЕЛЬ: Д-Р Г. ФЕНВИК
УРОВЕНЬ ДОПУСКА: 2

ЦЕЛЬ:
Установить, снижает ли длительный
контакт с SCP-999 базовый уровень
кортизола у исследовательского
персонала Фонда.

ИСПЫТУЕМЫЕ: D-1142, D-1143, D-1144
ПРОДОЛЖИТЕЛЬНОСТЬ: по 40 минут

РЕЗУЛЬТАТЫ:
Все трое испытуемых класса D сразу
же сообщили об эйфории при контакте.
D-1142 неудержимо смеялся 22 минуты.
Уровень кортизола после сеанса снизился
примерно на 38%.

SCP-999 вёл себя с энтузиазмом.
Поглотил около 800 г M&Ms, которые
принёс д-р Кармайкл. Побочных
эффектов не выявлено.

ВЫВОД:
Рекомендую еженедельные терапевтические
сеансы для персонала с высоким
уровнем стресса. Готовлю официальное
предложение для д-ра Рейес.

ПРИМЕЧАНИЕ: SCP-999 попытался выйти
следом за мной. Пришлось задействовать
трёх санитаров, чтобы перенаправить
его. Умилительно.

-- Г. Фенвик, к.м.н.
   Отдел биологических аномалий`,
          },
          {
            id: "fw-fl2",
            name: "EXP_447_SEP91.LOG",
            nameRu: "ЭКС_447_СЕН91.LOG",
            contentEn: `EXPERIMENT LOG — SCP-447
DATE: 11 SEP 1991
RESEARCHER: DR. H. FENWICK
CLEARANCE LEVEL: 2

OBJECTIVE:
Test lubricating properties of SCP-447
slime on mechanical components.

METHOD:
Applied slime to a standard Foundation-
issue lock mechanism (model JL-7).

RESULTS:
Lubrication effective. Lock operation
smoothed significantly. No anomalous
behavior observed. Slime inert outside
of contact with deceased tissue.

REMINDER TO SELF:
Under NO circumstances use SCP-447 in
sectors containing morgue access or any
deceased D-class material. Protocol 447-
OMEGA is not a drill.

Remind orderly Davis to read the memo
from Containment Director Henderson.
He almost wheeled a gurney past the
storage cabinet last Tuesday.

-- H. Fenwick`,
            contentRu: `ЖУРНАЛ ЭКСПЕРИМЕНТА — SCP-447
ДАТА: 11 СЕН 1991
ИССЛЕДОВАТЕЛЬ: Д-Р Г. ФЕНВИК
УРОВЕНЬ ДОПУСКА: 2

ЦЕЛЬ:
Проверить смазочные свойства слизи
SCP-447 на механических компонентах.

МЕТОД:
Нанесение слизи на стандартный
замковый механизм Фонда (модель JL-7).

РЕЗУЛЬТАТЫ:
Смазка работает эффективно. Замок
заметно легче. Аномального поведения
не выявлено. Слизь инертна вне
контакта с мёртвой тканью.

ЗАМЕТКА ДЛЯ СЕБЯ:
НИ В КОЕМ СЛУЧАЕ не использовать
SCP-447 в секторах с доступом к
моргу или телам Класса D. Протокол
447-ОМЕГА — не учение.

Напомнить санитару Дэвису прочесть
памятку директора по содержанию
Хендерсона. Он едва не провёз
каталку мимо шкафа хранения в
прошлый вторник.

-- Г. Фенвик`,
          },
        ],
      },
      {
        id: "fw-f2",
        name: "MAIL",
        nameRu: "ПОЧТА",
        files: [
          {
            id: "fw-fl3",
            name: "INBOX_09SEP.TXT",
            nameRu: "ВХОДЯЩИЕ_09СЕН.TXT",
            contentEn: `INTERNAL MAIL SYSTEM — SITE-19
FROM: DR. PATRICIA REYES <SITE19-RSH-04>
TO:   DR. H. FENWICK <SITE19-RSH-07>
DATE: 09 SEP 1991
SUBJ: RE: SCP-999 Therapy Proposal

Harold,

I reviewed your proposal. In principle
I support it, but Medical Division will
push back unless you include a proper
double-blind control group. They're
still sore about the SCP-207 incident.

Also — the Director reminded me that
all experiments requiring candy as
stimulant must go through Supply Form
19-C. Please submit before end of week
or the budget office won't cover it.

Looking forward to the write-up.

— Patricia

---

FROM: SECURITY STATION 4-B
TO:   RESEARCH WING DISTRIBUTION
DATE: 09 SEP 1991
SUBJ: BADGE RENEWAL REMINDER

All Level 2 personnel: proximity badges
expire 30 SEP 1991. Report to Admin
Section B, Window 3 between 08:00-12:00
for renewal photography.

Failure to renew by deadline will result
in temporary access suspension.

-- Sgt. M. GREER
   Physical Security, Site-19`,
            contentRu: `ВНУТРЕННЯЯ ПОЧТА — ЗОНА-19
ОТ: Д-Р ПАТРИСИЯ РЕЙЕС <SITE19-RSH-04>
КОМУ: Д-Р Г. ФЕНВИК <SITE19-RSH-07>
ДАТА: 09 СЕН 1991
ТЕМА: ОТВ: Предложение о терапии SCP-999

Гарольд,

Ознакомилась с твоим предложением.
В целом — поддерживаю, но Медотдел
будет против, если не включишь
нормальную контрольную группу двойного
слепого исследования. После инцидента
с SCP-207 они стали особенно
придирчивы.

Кроме того — Директор напомнил, что
все эксперименты, требующие сладкого
в качестве стимула, должны оформляться
через бланк снабжения 19-В. Подай до
конца недели, иначе бюджетный отдел
не покроет расходы.

Жду отчёта.

— Патрисия

---

ОТ: ПОСТ ОХРАНЫ 4-B
КОМУ: РАССЫЛКА ИССЛЕДОВАТЕЛЬСКОГО БЛОКА
ДАТА: 09 СЕН 1991
ТЕМА: НАПОМИНАНИЕ О ПРОДЛЕНИИ ПРОПУСКА

Персонал 2-го уровня: бесконтактные
пропуска истекают 30 СЕН 1991.
Обратитесь в секцию «Б» Администрации,
окно 3, с 08:00 до 12:00 для
фотосъёмки при продлении.

Несоблюдение срока — временное
приостановление доступа.

-- Сержант М. ГРИР
   Физическая охрана, Зона-19`,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 2. AGENT DEBORAH MILLS — Полевой агент МОГ (Уровень 3)
//    Оперативный отдел / МОГ Эпсилон-11
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-mills",
    name: "SITE-19 / AGENT D. MILLS",
    nameRu: "ЗОНА-19 / АГЕНТ Д. МИЛЛС",
    password: "foxhound91",
    level: 3,
    hostname: "SITE19-OPS-12",
    operator: "AGENT D. MILLS",
    operatorEn: "AGENT D. MILLS",
    motd: [
      ">> CONNECTION ESTABLISHED <<",
      ">> MTF EPSILON-11 OPERATIONS <<",
      ">> CLEARANCE LEVEL 3 ACCESS <<",
    ],
    motdRu: [
      ">> СОЕДИНЕНИЕ УСТАНОВЛЕНО <<",
      ">> ОПЕРАЦИИ МОГ ЭПСИЛОН-11 <<",
      ">> ДОСТУП УРОВНЯ 3 <<",
    ],
    folders: [
      {
        id: "ml-f1",
        name: "MISSION_REPORTS",
        nameRu: "ОТЧЁТЫ_О_ЗАДАНИЯХ",
        files: [
          {
            id: "ml-fl1",
            name: "OP-NIGHTLATCH-01.RPT",
            nameRu: "ОП-НОЧНОЙЗАМОК-01.RPT",
            contentEn: `OPERATION: NIGHTLATCH
CLASSIFICATION: CONFIDENTIAL
DATE: 01 SEP 1991
REPORTING AGENT: D. MILLS
UNIT: MTF EPSILON-11 "Nine-Tailed Fox"

OBJECTIVE:
Retrieve SCP-860 (Blue Key) after
unauthorized removal by D-4892 during
routine test. D-4892 entered the
woodland dimension and did not return.

ACTIONS TAKEN:
Team entered doorway created by SCP-860
at 22:14. Six agents, standard loadout
plus UV lamps per protocol.

Confirmed hostile entities in the
forest. Two agents sustained minor
lacerations — treated on-site.
D-4892 was located at grid mark 7-J,
unresponsive. Vital signs present.
Extracted via same door at 23:02.

SCP-860 recovered and secured.
D-4892 transferred to Medical for
psychological evaluation.

CASUALTIES: 0 fatalities
PROPERTY DAMAGE: 1 UV lamp (broken)

RECOMMENDATIONS:
Increase minimum team size for SCP-860
operations to 8. The entities appeared
more organized than in prior entries.

-- D. Mills, Agent
   MTF Epsilon-11`,
            contentRu: `ОПЕРАЦИЯ: НОЧНОЙ ЗАМОК
ГРИФ: КОНФИДЕНЦИАЛЬНО
ДАТА: 01 СЕН 1991
ОТЧЁТ АГЕНТА: Д. МИЛЛС
ПОДРАЗДЕЛЕНИЕ: МОГ ЭПСИЛОН-11 «Девятихвостый Лис»

ЦЕЛЬ:
Возврат SCP-860 (Синий ключ) после
несанкционированного изъятия D-4892
в ходе плановых испытаний. D-4892
вошёл в лесное измерение и не вернулся.

ПРЕДПРИНЯТЫЕ ДЕЙСТВИЯ:
Группа вошла в дверь, открытую
SCP-860, в 22:14. Шесть агентов,
стандартное снаряжение + УФ-фонари
согласно протоколу.

Враждебные существа в лесу подтверждены.
Двое агентов получили незначительные
порезы — обработаны на месте.
D-4892 обнаружен в точке 7-J,
без сознания. Жизненные показатели
присутствуют. Извлечён через ту же
дверь в 23:02.

SCP-860 возвращён и закреплён.
D-4892 направлен в Медотдел для
психологической оценки.

ПОТЕРИ: 0 погибших
МАТЕРИАЛЬНЫЙ УЩЕРБ: 1 УФ-фонарь (разбит)

РЕКОМЕНДАЦИИ:
Увеличить минимальный состав группы
для операций с SCP-860 до 8 человек.
Существа выглядели более организованными,
чем при предыдущих проникновениях.

-- Д. Миллс, агент
   МОГ Эпсилон-11`,
          },
          {
            id: "ml-fl2",
            name: "OP-SANDMAN-02.RPT",
            nameRu: "ОП-ПЕСОЧНИК-02.RPT",
            contentEn: `OPERATION: SANDMAN
CLASSIFICATION: CONFIDENTIAL
DATE: 17 SEP 1991
REPORTING AGENT: D. MILLS

OBJECTIVE:
Assess SCP-966 (Sleep Killers) after
possible breach of outer perimeter.
Motion sensors in corridor 44-F
triggered at 02:30.

ACTIONS TAKEN:
Deployed in full IR-equipped loadout.
Confirmed two SCP-966 entities in the
corridor. Third entity suspected but
not visually confirmed. Applied UV
suppression protocol. Entities retreated
to containment area.

Perimeter breach was likely user error —
a maintenance worker left a junction
panel open. He has been reprimanded and
referred to Psychological Support.

No personnel exposed to sleep-
deprivation field (exposure time: <4s).

CASUALTIES: 0

NOTE: Recommend mandatory IR goggle
refresher for all Sector-4 personnel.

-- D. Mills`,
            contentRu: `ОПЕРАЦИЯ: ПЕСОЧНИК
ГРИФ: КОНФИДЕНЦИАЛЬНО
ДАТА: 17 СЕН 1991
ОТЧЁТ АГЕНТА: Д. МИЛЛС

ЦЕЛЬ:
Оценка ситуации с SCP-966 (Убийцы сна)
после возможного нарушения внешнего
периметра. Датчики движения в коридоре
44-F сработали в 02:30.

ПРЕДПРИНЯТЫЕ ДЕЙСТВИЯ:
Выдвинулись в полной экипировке с ИК-
снаряжением. Подтверждено присутствие
двух экземпляров SCP-966 в коридоре.
Третий подозревался, визуально не
подтверждён. Применён протокол УФ-
подавления. Объекты отступили в
зону содержания.

Нарушение периметра, вероятно, ошибка
персонала — техник оставил открытой
соединительную панель. Объявлен выговор;
направлен на психологическую поддержку.

Персонал не подвергался воздействию
поля депривации сна (время контакта: <4 с).

ПОТЕРИ: 0

ЗАМЕТКА: Рекомендую обязательный
повторный инструктаж по ИК-очкам
для всего персонала Сектора 4.

-- Д. Миллс`,
          },
        ],
      },
      {
        id: "ml-f2",
        name: "MAIL",
        nameRu: "ПОЧТА",
        files: [
          {
            id: "ml-fl3",
            name: "INBOX_19SEP.TXT",
            nameRu: "ВХОДЯЩИЕ_19СЕН.TXT",
            contentEn: `INTERNAL MAIL — SITE-19
FROM: LT. RAYMOND CROSS <SITE19-OPS-03>
TO:   AGENT D. MILLS <SITE19-OPS-12>
DATE: 19 SEP 1991
SUBJ: Commendation / Nightlatch Op

Mills,

Strong work on Nightlatch. The
extraction was clean and the SCP-860
recovery was textbook. I'm putting
you in for a commendation.

Cross

---

FROM: AGENT D. MILLS <SITE19-OPS-12>
TO:   LT. R. CROSS <SITE19-OPS-03>
DATE: 19 SEP 1991
SUBJ: RE: Commendation / Nightlatch

Cross,

Appreciate it. The team did the heavy
lifting. If anything, make sure Agent
Torres gets named too — he held the
door open (literally) for six minutes
with his boot so we didn't lose D-4892
permanently in that dimension.

One thing: I want a proper briefing on
those forest entities. Their behavior
patterns are changing. That's not good.

-- Mills`,
            contentRu: `ВНУТРЕННЯЯ ПОЧТА — ЗОНА-19
ОТ: ЛТ. РЭЙМОНД КРОСС <SITE19-OPS-03>
КОМУ: АГЕНТ Д. МИЛЛС <SITE19-OPS-12>
ДАТА: 19 СЕН 1991
ТЕМА: Благодарность / Операция «Ночной замок»

Миллс,

Отличная работа при «Ночном замке».
Эвакуация прошла чисто, возврат
SCP-860 — учебниковая операция.
Оформляю тебе благодарность.

Кросс

---

ОТ: АГЕНТ Д. МИЛЛС <SITE19-OPS-12>
КОМУ: ЛТ. Р. КРОСС <SITE19-OPS-03>
ДАТА: 19 СЕН 1991
ТЕМА: ОТВ: Благодарность / «Ночной замок»

Кросс,

Спасибо. Команда сделала основную
работу. Если что — убедись, что
агент Торрес тоже упомянут: он шесть
минут буквально держал дверь ботинком,
чтобы D-4892 не остался навсегда
в том измерении.

Одно: хочу нормальный брифинг по
лесным существам. Их модели поведения
меняются. Это нехорошо.

-- Миллс`,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 3. DR. CAROL WHITMORE — Психолог (Уровень 2)
//    Отдел психологической поддержки
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-whitmore",
    name: "SITE-19 / DR. C. WHITMORE",
    nameRu: "ЗОНА-19 / Д-Р К. УИТМОР",
    password: "inkblot44",
    level: 2,
    hostname: "SITE19-PSY-02",
    operator: "DR. C. WHITMORE",
    operatorEn: "DR. C. WHITMORE",
    motd: [
      ">> CONNECTION ESTABLISHED <<",
      ">> PSYCHOLOGICAL SUPPORT DIVISION <<",
      ">> DR. WHITMORE // LVL 2 <<",
    ],
    motdRu: [
      ">> СОЕДИНЕНИЕ УСТАНОВЛЕНО <<",
      ">> ОТДЕЛ ПСИХОЛОГИЧЕСКОЙ ПОДДЕРЖКИ <<",
      ">> Д-Р УИТМОР // УР. 2 <<",
    ],
    folders: [
      {
        id: "wm-f1",
        name: "CASE_NOTES",
        nameRu: "КАРТОЧКИ_СЛУЧАЕВ",
        files: [
          {
            id: "wm-fl1",
            name: "CASE_PSY_0091.TXT",
            nameRu: "СЛУЧАЙ_ПСИ_0091.TXT",
            contentEn: `PSYCHOLOGICAL SUPPORT — CASE FILE
DATE OPENED: 02 SEP 1991
CASE ID: PSY-0091
ATTENDING: DR. C. WHITMORE
PATIENT: [REDACTED], Researcher, LVL 2

PRESENTING COMPLAINT:
Patient reports intrusive imagery
following participation in an SCP-1074
observation session. The patient was
exposed for approximately 9 seconds
(protocol allows 10 max).

SYMPTOMS:
- Persistent visual "overlay" of the
  painting when attempting to focus on
  other objects.
- Disrupted sleep (4 nights)
- Mild dissociation during daily tasks

ASSESSMENT:
Likely temporary perceptual disruption.
Infohazardous residue consistent with
short-term SCP-1074 exposure.

TREATMENT PLAN:
1. Three sessions / week, CBT-based.
2. Issued isolation request from SCP
   art objects for 30 days minimum.
3. Referral to Dr. Henrikson (neurology)
   for follow-up scan.

PROGNOSIS: Favorable. Full recovery
expected within 3-4 weeks.

-- C. Whitmore, PsyD
   Psychological Support, Site-19`,
            contentRu: `ПСИХОЛОГИЧЕСКАЯ ПОДДЕРЖКА — КАРТОЧКА СЛУЧАЯ
ДАТА ОТКРЫТИЯ: 02 СЕН 1991
ID СЛУЧАЯ: ПСИ-0091
ВЕДУЩИЙ СПЕЦИАЛИСТ: Д-Р К. УИТМОР
ПАЦИЕНТ: [ИЗЪЯТО], Исследователь, УР 2

ЖАЛОБА:
Пациент сообщает о навязчивых
образах после участия в сеансе
наблюдения за SCP-1074. Воздействие
составило около 9 секунд (протокол
допускает максимум 10).

СИМПТОМЫ:
- Постоянное визуальное «наложение»
  картины при попытке сосредоточиться
  на других объектах.
- Нарушение сна (4 ночи)
- Умеренная диссоциация в ежедневных
  делах

ОЦЕНКА:
Вероятное временное нарушение
восприятия. Инфоопасный остаточный
эффект, характерный для кратковременного
контакта с SCP-1074.

ПЛАН ЛЕЧЕНИЯ:
1. Три сеанса в неделю, КПТ-метод.
2. Выдан запрос на изоляцию от
   художественных объектов SCP на
   минимум 30 дней.
3. Направление к д-ру Хенриксону
   (неврология) для контрольного
   сканирования.

ПРОГНОЗ: Благоприятный. Полное
восстановление ожидается через 3-4 нед.

-- К. Уитмор, д-р психол. наук
   Отдел психол. поддержки, Зона-19`,
          },
          {
            id: "wm-fl2",
            name: "CASE_PSY_0098.TXT",
            nameRu: "СЛУЧАЙ_ПСИ_0098.TXT",
            contentEn: `PSYCHOLOGICAL SUPPORT — CASE FILE
DATE OPENED: 14 SEP 1991
CASE ID: PSY-0098
ATTENDING: DR. C. WHITMORE
PATIENT: [REDACTED], Security, LVL 1

PRESENTING COMPLAINT:
Patient was inadvertently exposed to
SCP-988 (Mirror of Mistakes) during a
routine containment check.
Exposure duration: approx. 2 minutes.

SYMPTOMS:
- Intense preoccupation with alternate
  life choices (patient described
  "seeing a version of myself that
  went to medical school instead")
- Recurring obsessive thoughts (OCD-
  type pattern emerging)
- Mild depression, appetite disruption

ASSESSMENT:
Consistent with documented SCP-988
exposure effects. Standard protocol.

TREATMENT:
Recommended 6-week course of structured
cognitive intervention. Patient placed
on non-combat duty pending assessment.

NOTE: Patient asked whether his
"other self" in the mirror seemed happy.
I told him the mirror doesn't work that
way. (I don't actually know.)

-- C. Whitmore`,
            contentRu: `ПСИХОЛОГИЧЕСКАЯ ПОДДЕРЖКА — КАРТОЧКА СЛУЧАЯ
ДАТА ОТКРЫТИЯ: 14 СЕН 1991
ID СЛУЧАЯ: ПСИ-0098
ВЕДУЩИЙ СПЕЦИАЛИСТ: Д-Р К. УИТМОР
ПАЦИЕНТ: [ИЗЪЯТО], Охрана, УР 1

ЖАЛОБА:
Пациент случайно попал под воздействие
SCP-988 (Зеркало ошибок) во время
планового осмотра камеры.
Длительность контакта: ок. 2 минут.

СИМПТОМЫ:
- Мучительная одержимость альтернативными
  жизненными выборами (пациент описал:
  «Я видел себя, который вместо этого
  пошёл учиться на врача»)
- Повторяющиеся навязчивые мысли
  (формируется ОКР-паттерн)
- Умеренная депрессия, нарушение аппетита

ОЦЕНКА:
Соответствует задокументированным
эффектам воздействия SCP-988.
Стандартный протокол.

ЛЕЧЕНИЕ:
Назначен 6-недельный курс структурированной
когнитивной терапии. Пациент переведён
на нестроевое дежурство до завершения
оценки.

ЗАМЕТКА: Пациент спросил, выглядело ли
его «другое я» в зеркале счастливым.
Я сказала, что зеркало работает не так.
(Честно — не знаю.)

-- К. Уитмор`,
          },
        ],
      },
      {
        id: "wm-f2",
        name: "MAIL",
        nameRu: "ПОЧТА",
        files: [
          {
            id: "wm-fl3",
            name: "INBOX_22SEP.TXT",
            nameRu: "ВХОДЯЩИЕ_22СЕН.TXT",
            contentEn: `INTERNAL MAIL — SITE-19
FROM: DR. H. FENWICK <SITE19-RSH-07>
TO:   DR. C. WHITMORE <SITE19-PSY-02>
DATE: 22 SEP 1991
SUBJ: Referral: SCP-999 sessions

Carol,

I want to formally propose weekly
SCP-999 contact sessions for staff
with elevated stress ratings. Given
the psychological strain of our work
here, and SCP-999's documented
therapeutic effects, I think it's worth
a pilot program.

Would you co-sign the proposal? Dr. Reyes
needs two signatures from different
departments.

Thanks,
Harold

---

FROM: DR. C. WHITMORE <SITE19-PSY-02>
TO:   DR. H. FENWICK <SITE19-RSH-07>
DATE: 22 SEP 1991
SUBJ: RE: Referral: SCP-999 sessions

Harold,

Yes, absolutely. Co-signing.
Honestly my caseload this month alone
justifies the program.

FYI — SCP-988 gave me three new patients
this week. THREE. One was a security
guard who just walked by the room.
The containment protocol on that one
needs revising.

— Carol`,
            contentRu: `ВНУТРЕННЯЯ ПОЧТА — ЗОНА-19
ОТ: Д-Р Г. ФЕНВИК <SITE19-RSH-07>
КОМУ: Д-Р К. УИТМОР <SITE19-PSY-02>
ДАТА: 22 СЕН 1991
ТЕМА: Направление: сеансы с SCP-999

Кэрол,

Хочу официально предложить еженедельные
сеансы контакта с SCP-999 для персонала
с повышенным уровнем стресса. Учитывая
психологическую нагрузку нашей работы
и задокументированные терапевтические
эффекты SCP-999, думаю, стоит запустить
пилотную программу.

Подпишешь предложение со мной? Д-ру
Рейес нужны две подписи из разных
отделов.

Спасибо,
Гарольд

---

ОТ: Д-Р К. УИТМОР <SITE19-PSY-02>
КОМУ: Д-Р Г. ФЕНВИК <SITE19-RSH-07>
ДАТА: 22 СЕН 1991
ТЕМА: ОТВ: Направление: сеансы с SCP-999

Гарольд,

Да, конечно. Подписываю.
Честно говоря, мой стек дел за один
этот месяц уже оправдывает программу.

К слову — SCP-988 принёс мне трёх
новых пациентов за эту неделю. ТРЁХ.
Один — охранник, который просто проходил
мимо комнаты. Протокол содержания
этого объекта нужно пересматривать.

— Кэрол`,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 4. TECHNICIAN JEROME BANKS — Техник (Уровень 1)
//    Отдел инфраструктуры
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-banks",
    name: "SITE-19 / TECH. J. BANKS",
    nameRu: "ЗОНА-19 / ТЕХ. Д. БЭНКС",
    password: "wrench19",
    level: 1,
    hostname: "SITE19-INF-08",
    operator: "TECH. J. BANKS",
    operatorEn: "TECH. J. BANKS",
    motd: [
      ">> SITE-19 INFRASTRUCTURE <<",
      ">> TECH TERMINAL — LVL 1 <<",
      ">> J. BANKS, MAINTENANCE DIV. <<",
    ],
    motdRu: [
      ">> ИНФРАСТРУКТУРА ЗОНЫ-19 <<",
      ">> ТЕХНИЧЕСКИЙ ТЕРМИНАЛ — УР. 1 <<",
      ">> Д. БЭНКС, СЛУЖБА ОБСЛУЖИВАНИЯ <<",
    ],
    folders: [
      {
        id: "bk-f1",
        name: "WORK_ORDERS",
        nameRu: "НАРЯДЫ_НА_РАБОТУ",
        files: [
          {
            id: "bk-fl1",
            name: "WO_SEP_OPEN.TXT",
            nameRu: "НР_СЕН_ОТКРЫТЫЕ.TXT",
            contentEn: `SITE-19 MAINTENANCE — OPEN WORK ORDERS
DATE: 23 SEP 1991
TECH: J. BANKS

WO #1041 — PRIORITY: HIGH
Location: Sector 7, Corridor 44-F
Issue: Electrical junction panel left
open by contractor. Re-seal and inspect
wiring per Security request.
Status: COMPLETED 20 SEP

WO #1047 — PRIORITY: MEDIUM
Location: SCP-263 containment room
Issue: Clock winding mechanism backup
unit battery needs replacement. NOTE:
DO NOT STOP THE CLOCK. Coordinate
with Containment before entry.
Status: IN PROGRESS

WO #1052 — PRIORITY: LOW
Location: Break room, Level 2 East
Issue: Coffee machine dispenses
slightly too hot. Complaints from staff.
NOTE: This is a normal machine. Not
SCP-294. Please stop calling it that.
Status: PENDING

WO #1055 — PRIORITY: HIGH
Location: SCP-002 outer perimeter
Issue: Welded steel panel 3-C shows
hairline fracture. Reinforce per
Henderson's spec sheet 19-77B.
Status: SCHEDULED 25 SEP

-- J. Banks, Maintenance`,
            contentRu: `ОБСЛУЖИВАНИЕ ЗОНЫ-19 — ОТКРЫТЫЕ НАРЯДЫ
ДАТА: 23 СЕН 1991
ТЕХНИК: Д. БЭНКС

НР #1041 — ПРИОРИТЕТ: ВЫСОКИЙ
Местонахождение: Сектор 7, коридор 44-F
Проблема: Электрическая распаечная
коробка оставлена открытой подрядчиком.
Запечатать и проверить проводку по
запросу охраны.
Статус: ВЫПОЛНЕНО 20 СЕН

НР #1047 — ПРИОРИТЕТ: СРЕДНИЙ
Местонахождение: Камера содержания
SCP-263
Проблема: Необходима замена батареи
резервного блока механизма завода
часов. ПРИМЕЧАНИЕ: НЕ ОСТАНАВЛИВАЙТЕ
ЧАСЫ. Согласовать с Содержанием
перед входом.
Статус: В РАБОТЕ

НР #1052 — ПРИОРИТЕТ: НИЗКИЙ
Местонахождение: Комната отдыха,
Уровень 2 Восток
Проблема: Кофемашина выдаёт слишком
горячий кофе. Жалобы от персонала.
ПРИМЕЧАНИЕ: Это обычная машина. Не
SCP-294. Прекратите так её называть.
Статус: ОЖИДАНИЕ

НР #1055 — ПРИОРИТЕТ: ВЫСОКИЙ
Местонахождение: Внешний периметр
SCP-002
Проблема: Сварная стальная панель 3-C
дала трещину. Усилить согласно
спецификации Хендерсона 19-77B.
Статус: ЗАПЛАНИРОВАНО 25 СЕН

-- Д. Бэнкс, техник`,
          },
        ],
      },
      {
        id: "bk-f2",
        name: "MAIL",
        nameRu: "ПОЧТА",
        files: [
          {
            id: "bk-fl2",
            name: "INBOX_BANKS.TXT",
            nameRu: "ВХОДЯЩИЕ_БЭНКС.TXT",
            contentEn: `INTERNAL MAIL — SITE-19
FROM: SGT. M. GREER <SITE19-SEC-4B>
TO:   TECH. J. BANKS <SITE19-INF-08>
DATE: 15 SEP 1991
SUBJ: Junction Panel Sector 7

Banks,

That open panel in 44-F caused a
serious security incident last night.
SCP-966 entities entered the corridor.
Got lucky — Mills' team was on site.

Next time a contractor leaves something
open, you call Security IMMEDIATELY.
Don't handle it the next morning.

Greer

---

FROM: TECH. J. BANKS <SITE19-INF-08>
TO:   SGT. M. GREER <SITE19-SEC-4B>
DATE: 15 SEP 1991
SUBJ: RE: Junction Panel Sector 7

Sgt. Greer,

Understood. It won't happen again.
For the record: I didn't know the
contractor left it open. I found it
myself at 07:00 and was going to log
it as WO #1041. I didn't know about
the SCP-966 situation until after.

I've patched it and added an extra
lock. I'll add this to my daily
perimeter check going forward.

Sorry. I mean it.

J. Banks`,
            contentRu: `ВНУТРЕННЯЯ ПОЧТА — ЗОНА-19
ОТ: СЕРЖАНТ М. ГРИР <SITE19-SEC-4B>
КОМУ: ТЕХ. Д. БЭНКС <SITE19-INF-08>
ДАТА: 15 СЕН 1991
ТЕМА: Распаечная коробка, Сектор 7

Бэнкс,

Открытая панель в 44-F прошлой ночью
вызвала серьёзный инцидент безопасности.
Объекты SCP-966 зашли в коридор.
Повезло — команда Миллс была рядом.

В следующий раз, когда подрядчик
что-то оставит открытым — звони в
Охрану НЕМЕДЛЕННО. Не занимайся
этим утром следующего дня.

Грир

---

ОТ: ТЕХ. Д. БЭНКС <SITE19-INF-08>
КОМУ: СЕРЖАНТ М. ГРИР <SITE19-SEC-4B>
ДАТА: 15 СЕН 1991
ТЕМА: ОТВ: Распаечная коробка, Сектор 7

Сержант Грир,

Понял. Больше такого не будет.
Для протокола: я не знал, что
подрядчик оставил её открытой.
Обнаружил сам в 07:00 и собирался
занести как НР #1041. О ситуации с
SCP-966 узнал уже после.

Всё заделал и поставил дополнительный
замок. С этого момента включаю в
ежедневный обход периметра.

Извините. Серьёзно.

Д. Бэнкс`,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 5. DR. PATRICIA REYES — Старший исследователь (Уровень 3)
//    Руководитель Исследовательского отдела Б
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-reyes",
    name: "SITE-19 / DR. P. REYES",
    nameRu: "ЗОНА-19 / Д-Р П. РЕЙЕС",
    password: "catalyst83",
    level: 3,
    hostname: "SITE19-RSH-04",
    operator: "DR. P. REYES",
    operatorEn: "DR. P. REYES",
    motd: [
      ">> CONNECTION ESTABLISHED <<",
      ">> RESEARCH DIV. B — SR. RESEARCHER <<",
      ">> DR. REYES // CLEARANCE LVL 3 <<",
    ],
    motdRu: [
      ">> СОЕДИНЕНИЕ УСТАНОВЛЕНО <<",
      ">> ИСС. ОТД. Б — СТАРШИЙ ИССЛЕДОВАТЕЛЬ <<",
      ">> Д-Р РЕЙЕС // ДОПУСК УР. 3 <<",
    ],
    folders: [
      {
        id: "ry-f1",
        name: "RESEARCH_REPORTS",
        nameRu: "ИССЛЕДОВАТЕЛЬСКИЕ_ОТЧЁТЫ",
        files: [
          {
            id: "ry-fl1",
            name: "RPT_SCP914_Q3.DOC",
            nameRu: "ОТЧ_SCP914_К3.DOC",
            contentEn: `QUARTERLY RESEARCH REPORT
ITEM: SCP-914 (Clockwork Mechanism)
DIVISION: Research Div. B
PERIOD: Q3 / JUL—SEP 1991
SR. RESEARCHER: DR. P. REYES

EXECUTIVE SUMMARY:
Q3 testing of SCP-914 focused on
organic compound transformation across
all five settings. Significant findings
in "Fine" and "Very Fine" modes.

KEY FINDINGS:

Setting "1:1":
Standard input-output ratio maintained.
No anomalous variation observed.

Setting "Fine":
Organic material showing unexpected
complexity increase. Sample: common
pencil → precision drafting instrument
with non-Euclidean measurement scale.
Further testing needed.

Setting "Very Fine":
[SEE APPENDIX 914-Q3-VF — LVL 4 REQUIRED]

INCIDENTS: 0 this quarter
D-CLASS USED: 4 (rotating pool)
DAMAGE TO EQUIPMENT: 1 intake tray
(warped, replaced)

NEXT QUARTER GOALS:
Focus on "Rough" setting impact on
electronic devices. Approved by
Containment Director Henderson 08 JUL.

-- P. Reyes, PhD
   Senior Researcher, Div. B`,
            contentRu: `КВАРТАЛЬНЫЙ ИССЛЕДОВАТЕЛЬСКИЙ ОТЧЁТ
ОБЪЕКТ: SCP-914 (Часовой механизм)
ОТДЕЛ: Исследовательский отдел Б
ПЕРИОД: К3 / ИЮЛ—СЕН 1991
СТАРШИЙ ИССЛЕДОВАТЕЛЬ: Д-Р П. РЕЙЕС

РЕЗЮМЕ:
Тестирование SCP-914 в К3 было
сосредоточено на трансформации
органических соединений во всех
пяти режимах. Значительные открытия
в режимах «Точно» и «Точно+».

КЛЮЧЕВЫЕ РЕЗУЛЬТАТЫ:

Режим «1:1»:
Стандартное соотношение вход-выход.
Аномальных отклонений не выявлено.

Режим «Точно»:
Органический материал демонстрирует
неожиданное усложнение. Пример:
обычный карандаш → прецизионный
чертёжный инструмент с неевклидовой
шкалой измерений. Требуются доп. тесты.

Режим «Точно+»:
[СМ. ПРИЛОЖЕНИЕ 914-К3-Т+ — ТРЕБУЕТСЯ УР. 4]

ИНЦИДЕНТЫ: 0 за квартал
ИСПОЛЬЗОВАНО КЛАССА D: 4 (ротация)
УЩЕРБ ОБОРУДОВАНИЮ: 1 входной лоток
(деформирован, заменён)

ЦЕЛИ НА СЛЕДУЮЩИЙ КВАРТАЛ:
Изучить влияние режима «Грубо» на
электронные устройства. Одобрено
директором по содержанию Хендерсоном
08 ИЮЛ.

-- П. Рейес, д.н.
   Старший исследователь, Отдел Б`,
          },
          {
            id: "ry-fl2",
            name: "NOTE_294_REQUESTS.TXT",
            nameRu: "ЗАМЕТКА_294_ЗАПРОСЫ.TXT",
            contentEn: `INTERNAL MEMO
TO: ALL RESEARCH DIVISION B STAFF
FROM: DR. P. REYES
DATE: 18 SEP 1991
RE: SCP-294 Use Requests

Effective immediately:

All requests to use SCP-294 must be
submitted in writing using Form 19-G
at least 48 hours in advance.

We have had three unauthorized vending
machine interactions this month.
Whoever ordered "liquid nostalgia" last
Tuesday — that is not an approved
research substance and I had to spend
two hours writing a containment memo.

The machine outputs dangerous abstract
liquids. It is not a recreational
appliance. It is not "kind of funny."

All logs must be maintained.

— Dr. Reyes`,
            contentRu: `ВНУТРЕННЯЯ ПАМЯТКА
КОМУ: ПЕРСОНАЛУ ИССЛЕДОВАТЕЛЬСКОГО ОТД. Б
ОТ: Д-Р П. РЕЙЕС
ДАТА: 18 СЕН 1991
ТЕМА: Запросы на использование SCP-294

С немедленным вступлением в силу:

Все запросы на использование SCP-294
должны подаваться письменно по
форме 19-Г не менее чем за 48 часов.

В этом месяце было три несанкционированных
взаимодействия с автоматом. Тот, кто
в прошлый вторник заказал «жидкую
ностальгию» — это не утверждённое
исследовательское вещество, и мне
пришлось потратить два часа на
составление памятки по содержанию.

Автомат выдаёт опасные абстрактные
жидкости. Это не развлечение. Это
совсем не «забавно».

Все журналы должны вестись.

— Д-р Рейес`,
          },
        ],
      },
      {
        id: "ry-f2",
        name: "MAIL",
        nameRu: "ПОЧТА",
        files: [
          {
            id: "ry-fl3",
            name: "INBOX_25SEP.TXT",
            nameRu: "ВХОДЯЩИЕ_25СЕН.TXT",
            contentEn: `INTERNAL MAIL — SITE-19
FROM: CONTAINMENT DIR. W. HENDERSON
TO:   DR. P. REYES <SITE19-RSH-04>
DATE: 25 SEP 1991
SUBJ: SCP-1874 Protocol Update

Dr. Reyes,

Effective 01 OCT 1991, all access to
SCP-1874 must be approved at Level 4+
regardless of research status.

We had a near-incident last week.
A typist in Section C accidentally
loaded a ribbon into the machine while
cleaning. Nothing was typed, but the
proximity alone was flagged by the
O5 liaison.

Submit revised research schedule by
28 SEP or your Q4 allocations
will be frozen pending review.

— W. Henderson
   Containment Director, Site-19

---

FROM: DR. P. REYES <SITE19-RSH-04>
TO:   CONTAINMENT DIR. W. HENDERSON
DATE: 25 SEP 1991
SUBJ: RE: SCP-1874 Protocol Update

Director Henderson,

Understood. I'll submit the revised
schedule by end of day 27 SEP.

Request noted. For the record, SCP-1874
has been under double-lock since Q2.
The ribbon loader access is a separate
ventilation panel — I'll flag it to
Maintenance (Banks) for physical sealing.

— P. Reyes`,
            contentRu: `ВНУТРЕННЯЯ ПОЧТА — ЗОНА-19
ОТ: ДИРЕКТОР ПО СОДЕРЖАНИЮ У. ХЕНДЕРСОН
КОМУ: Д-Р П. РЕЙЕС <SITE19-RSH-04>
ДАТА: 25 СЕН 1991
ТЕМА: Обновление протокола SCP-1874

Д-р Рейес,

С 01 ОКТ 1991 весь доступ к SCP-1874
требует одобрения уровня 4+ независимо
от исследовательского статуса.

На прошлой неделе был почти инцидент.
Машинистка из Секции С случайно
вставила ленту в машину во время
уборки. Ничего не было напечатано,
но само нахождение рядом было
зафиксировано связным O5.

Подайте пересмотренный план исследований
до 28 СЕН — иначе распределение на К4
будет заморожено до рассмотрения.

— У. Хендерсон
   Директор по содержанию, Зона-19

---

ОТ: Д-Р П. РЕЙЕС <SITE19-RSH-04>
КОМУ: ДИРЕКТОР ПО СОДЕРЖАНИЮ У. ХЕНДЕРСОН
ДАТА: 25 СЕН 1991
ТЕМА: ОТВ: Обновление протокола SCP-1874

Директор Хендерсон,

Принято. Пересмотренный план отправлю
до конца дня 27 СЕН.

Запрос принят. Для протокола: SCP-1874
находится под двойной блокировкой с К2.
Панель загрузки ленты — отдельная
вентиляционная панель — направлю
техническому специалисту (Бэнкс) для
физической заделки.

— П. Рейес`,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 6. SGT. MARCUS GREER — Начальник охраны (Уровень 2)
//    Физическая безопасность, Сектор 4-B
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-greer",
    name: "SITE-19 / SGT. M. GREER",
    nameRu: "ЗОНА-19 / СЕРЖАНТ М. ГРИР",
    password: "delta-4b",
    level: 2,
    hostname: "SITE19-SEC-4B",
    operator: "SGT. M. GREER",
    operatorEn: "SGT. M. GREER",
    motd: [
      ">> SITE-19 SECURITY TERMINAL <<",
      ">> SECTOR 4-B // LVL 2 <<",
      ">> SGT. GREER — PHYSICAL SECURITY <<",
    ],
    motdRu: [
      ">> ТЕРМИНАЛ ОХРАНЫ ЗОНЫ-19 <<",
      ">> СЕКТОР 4-B // УР. 2 <<",
      ">> СЕРЖАНТ ГРИР — ФИЗИЧЕСКАЯ ОХРАНА <<",
    ],
    folders: [
      {
        id: "gr-f1",
        name: "SHIFT_REPORTS",
        nameRu: "ОТЧЁТЫ_СМЕН",
        files: [
          {
            id: "gr-fl1",
            name: "SITREP_SEP_WEEK3.TXT",
            nameRu: "СИТРЕР_СЕН_НЕД3.TXT",
            contentEn: `SECURITY SITUATION REPORT
SITE-19 — SECTOR 4-B
WEEK 3 / SEPTEMBER 1991
REPORTING: SGT. M. GREER

MONDAY 16 SEP:
- All posts manned. No incidents.
- SCP-173 chamber: per-protocol check
  passed at 06:00, 14:00, 22:00.

TUESDAY 17 SEP:
- Perimeter breach in Corridor 44-F
  at 02:30. SCP-966 entities detected.
  MTF Epsilon-11 responded. Contained
  by 02:55. Full report filed under
  Security Log S-4B-1143.
- Maintenance notified (Banks) re:
  junction panel.

WEDNESDAY 18 SEP:
- Routine. SCP-372 chamber: mirror
  system integrity verified. No
  blind-zone anomalies detected.

THURSDAY 19 SEP:
- Badge renewal drive: 14 personnel
  renewed. 3 outstanding as of COB.
- Reminded LVL-1 staff re: SCP-330
  proximity (one guard approached bowl
  during break). No incident.

FRIDAY 20 SEP:
- Junction panel 44-F: Banks confirmed
  sealed and re-locked. Added to nightly
  inspection route.

STATUS: NOMINAL (with noted incident)

-- Sgt. M. Greer`,
            contentRu: `СИТУАЦИОННЫЙ ОТЧЁТ ПО БЕЗОПАСНОСТИ
ЗОНА-19 — СЕКТОР 4-B
НЕДЕЛЯ 3 / СЕНТЯБРЬ 1991
ОТЧИТЫВАЕТСЯ: СЕРЖАНТ М. ГРИР

ПОНЕДЕЛЬНИК 16 СЕН:
- Все посты укомплектованы. Инцидентов нет.
- Камера SCP-173: плановая проверка
  по протоколу пройдена в 06:00, 14:00, 22:00.

ВТОРНИК 17 СЕН:
- Нарушение периметра в коридоре 44-F
  в 02:30. Обнаружены объекты SCP-966.
  Ответ МОГ Эпсилон-11. Удержано в 02:55.
  Полный отчёт — журнал безопасности
  S-4B-1143.
- Уведомлён технический специалист
  (Бэнкс) по поводу панели.

СРЕДА 18 СЕН:
- Плановая. Камера SCP-372: целостность
  зеркальной системы подтверждена.
  Слепых зон не обнаружено.

ЧЕТВЕРГ 19 СЕН:
- Продление пропусков: 14 человек
  прошли. 3 не явились к концу дня.
- Напоминание персоналу УР-1 о
  близости к SCP-330 (один охранник
  подошёл к чаше во время перерыва).
  Инцидента нет.

ПЯТНИЦА 20 СЕН:
- Панель 44-F: Бэнкс подтвердил
  заделку и повторный замок. Добавлено
  в маршрут ночного обхода.

СТАТУС: НОРМА (с учётом отмеченного инцидента)

-- Сержант М. Грир`,
          },
        ],
      },
      {
        id: "gr-f2",
        name: "PERSONNEL_NOTICES",
        nameRu: "УВЕДОМЛЕНИЯ_ПЕРСОНАЛУ",
        files: [
          {
            id: "gr-fl2",
            name: "NOTICE_SCP330.TXT",
            nameRu: "УВЕ_SCP330.TXT",
            contentEn: `SECURITY NOTICE — ALL SECTOR 4 STAFF
FROM: SGT. M. GREER
DATE: 20 SEP 1991
RE: SCP-330 Proximity Incident

This is not the first time I have
issued this notice.

SCP-330 containment is a STANDARD
LOCKED SAFE. The bowl of candy is NOT
a snack dish. Taking MORE THAN TWO
pieces results in immediate traumatic
amputation of both hands.

IF YOU APPROACH SCP-330:
- Do not reach into the bowl.
- Do not touch the bowl.
- If your eye contact with the candy
  exceeds 10 seconds, report to
  Psychological Support immediately.

There is candy in the break room.
It is normal candy. Please eat that.

Compliance is mandatory. Next violation
goes straight to Director Henderson.

-- Sgt. Greer`,
            contentRu: `УВЕДОМЛЕНИЕ БЕЗОПАСНОСТИ — ПЕРСОНАЛУ СЕКТОРА 4
ОТ: СЕРЖАНТ М. ГРИР
ДАТА: 20 СЕН 1991
ТЕМА: Инцидент с приближением к SCP-330

Это не первое подобное уведомление
с моей стороны.

Содержание SCP-330 — СТАНДАРТНЫЙ
ЗАПЕРТЫЙ СЕЙФ. Чаша со сладким НЕ
является вазой с угощением. Взятие
БОЛЕЕ ДВУХ конфет приводит к
немедленной травматической ампутации
обеих рук.

ПРИ ПРИБЛИЖЕНИИ К SCP-330:
- Не тяните руку в чашу.
- Не трогайте чашу.
- Если зрительный контакт с конфетами
  превысил 10 секунд — немедленно
  обратитесь в Психологическую поддержку.

В комнате отдыха есть конфеты.
Это обычные конфеты. Ешьте их.

Выполнение обязательно. Следующее
нарушение — сразу к Директору Хендерсону.

-- Сержант Грир`,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 7. DR. LINDA ASHWORTH — Специалист-медик (Уровень 3)
//    Медицинский блок, Зона-19
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-ashworth",
    name: "SITE-19 / DR. L. ASHWORTH",
    nameRu: "ЗОНА-19 / Д-Р Л. ЭШВОРТ",
    password: "suture88",
    level: 3,
    hostname: "SITE19-MED-01",
    operator: "DR. L. ASHWORTH",
    operatorEn: "DR. L. ASHWORTH",
    motd: [
      ">> SITE-19 MEDICAL DIVISION <<",
      ">> DR. ASHWORTH — CLEARANCE 3 <<",
      ">> PATIENT DATA: CONFIDENTIAL <<",
    ],
    motdRu: [
      ">> МЕДИЦИНСКИЙ БЛОК ЗОНЫ-19 <<",
      ">> Д-Р ЭШВОРТ — ДОПУСК 3 <<",
      ">> ДАННЫЕ ПАЦИЕНТОВ: КОНФИДЕНЦИАЛЬНО <<",
    ],
    folders: [
      {
        id: "aw-f1",
        name: "MEDICAL_REPORTS",
        nameRu: "МЕДИЦИНСКИЕ_ОТЧЁТЫ",
        files: [
          {
            id: "aw-fl1",
            name: "MED_RPT_SCP427.DOC",
            nameRu: "МЕД_ОТЧ_SCP427.DOC",
            contentEn: `MEDICAL DIVISION — EXPOSURE REPORT
ITEM: SCP-427 (Lovecraftian Locket)
DATE: 07 SEP 1991
PHYSICIAN: DR. L. ASHWORTH
PATIENT: [LVL 4+ TO VIEW]

EXPOSURE DURATION: 22 minutes
(Protocol maximum: 15 minutes)

CLINICAL FINDINGS:
Patient presented with accelerated
tissue regeneration consistent with
SCP-427 overexposure. Notable findings:
- Minor hand lacerations from MTF op
  healed completely within 4 minutes
  of locket application.
- Pigment changes observed: three
  patches of skin showing iridescent
  discoloration, consistent with early
  Stage-1 mutation markers.
- Subcutaneous tissue density
  abnormally increased in right forearm.

STATUS: Under observation (72 hr).
No cognitive changes detected yet.
Early Stage-1. Locket removed.

RECOMMENDATION:
SCP-427 use in field medical applications
remains authorized but mandatory 15-
minute limit must be enforced. Suggest
integrated timer device.

Full mutation tracking log: FORM MED-427-09

-- L. Ashworth, MD
   Medical Division, Site-19`,
            contentRu: `МЕДИЦИНСКИЙ БЛОК — ОТЧЁТ О ВОЗДЕЙСТВИИ
ОБЪЕКТ: SCP-427 (Лавкрафтовский медальон)
ДАТА: 07 СЕН 1991
ВРАЧ: Д-Р Л. ЭШВОРТ
ПАЦИЕНТ: [ТРЕБУЕТСЯ УР. 4+]

ДЛИТЕЛЬНОСТЬ КОНТАКТА: 22 минуты
(Протокольный максимум: 15 минут)

КЛИНИЧЕСКИЕ ДАННЫЕ:
Пациент поступил с ускоренной
регенерацией тканей, характерной для
чрезмерного воздействия SCP-427.
Примечательные находки:
- Незначительные порезы рук от операции
  МОГ полностью зажили за 4 минуты
  применения медальона.
- Изменение пигментации: три участка
  кожи с радужным обесцвечиванием,
  соответствующие ранним маркерам
  мутации Стадии 1.
- Плотность подкожной ткани аномально
  повышена в правом предплечье.

СТАТУС: Под наблюдением (72 ч).
Когнитивных изменений не выявлено.
Ранняя Стадия 1. Медальон снят.

РЕКОМЕНДАЦИЯ:
Использование SCP-427 в полевой медицине
остаётся разрешённым, но 15-минутный
лимит должен соблюдаться обязательно.
Предлагаю встроенный таймер.

Полный журнал мутаций: ФОРМА МЕД-427-09

-- Л. Эшворт, д.м.н.
   Медицинский блок, Зона-19`,
          },
          {
            id: "aw-fl2",
            name: "MEMO_SCP500_STOCK.TXT",
            nameRu: "ПАМЯТКА_SCP500_ЗАПАС.TXT",
            contentEn: `MEDICAL DIVISION — INTERNAL MEMO
FROM: DR. L. ASHWORTH
TO:   CONTAINMENT DIR. W. HENDERSON
DATE: 13 SEP 1991
SUBJ: SCP-500 Stock Level — URGENT

Director Henderson,

Current SCP-500 stock: 7 tablets.
This is the lowest count recorded
since Site-19 operational start.

In September alone we have used:
- 2 tablets: D-class critical injuries
- 1 tablet: SCP-009 crystallisation event
  (researcher, non-fatal without tablet)
- 1 tablet: [REDACTED BY O5-7]

I formally request a recount authorization
and, if possible, a liaison with
Site-17 or Site-23 to determine if
any tablets are available for transfer.

SCP-500 is irreplaceable. At this rate
of depletion we will have critically
insufficient stock before year-end.

I'm not trying to alarm anyone.
I am alarmed.

— Dr. L. Ashworth`,
            contentRu: `МЕДИЦИНСКИЙ БЛОК — ВНУТРЕННЯЯ ПАМЯТКА
ОТ: Д-Р Л. ЭШВОРТ
КОМУ: ДИРЕКТОР ПО СОДЕРЖАНИЮ У. ХЕНДЕРСОН
ДАТА: 13 СЕН 1991
ТЕМА: Уровень запаса SCP-500 — СРОЧНО

Директор Хендерсон,

Текущий запас SCP-500: 7 таблеток.
Это самый низкий показатель с начала
работы Зоны-19.

Только в сентябре было использовано:
- 2 таблетки: критические травмы Класса D
- 1 таблетка: кристаллизация от SCP-009
  (исследователь, без таблетки — несмертельно)
- 1 таблетка: [ИЗЪЯТО ПО РАСПОРЯЖЕНИЮ O5-7]

Официально запрашиваю авторизацию на
пересчёт и, по возможности, связь с
Зоной-17 или Зоной-23 для выяснения
возможности передачи таблеток.

SCP-500 незаменим. При таком темпе
расхода до конца года у нас будет
критически недостаточный запас.

Я не хочу никого пугать.
Я сама напугана.

— Д-р Л. Эшворт`,
          },
        ],
      },
      {
        id: "aw-f2",
        name: "MAIL",
        nameRu: "ПОЧТА",
        files: [
          {
            id: "aw-fl3",
            name: "INBOX_16SEP.TXT",
            nameRu: "ВХОДЯЩИЕ_16СЕН.TXT",
            contentEn: `INTERNAL MAIL — SITE-19
FROM: CONTAINMENT DIR. W. HENDERSON
TO:   DR. L. ASHWORTH <SITE19-MED-01>
DATE: 16 SEP 1991
SUBJ: RE: SCP-500 Stock Level

Dr. Ashworth,

Request received and escalated to O5
liaison. No transfer available from
Site-17 or Site-23 at this time.

Formal rationing protocol MED-500-R
effective immediately. No further use
without direct O5 authorization.

Recount approved. Please proceed and
submit verified count by 20 SEP.

— W. Henderson

---

FROM: DR. L. ASHWORTH <SITE19-MED-01>
TO:   DR. H. FENWICK <SITE19-RSH-07>
DATE: 16 SEP 1991
SUBJ: SCP-427 as an alternative

Harold,

Have you looked at whether SCP-427
could serve as a partial substitute
for SCP-500 in non-critical cases?
I know the mutation risk is real, but
with stocks at 6 (yes, six), we need
options.

Purely exploratory. Don't file anything yet.

— Linda`,
            contentRu: `ВНУТРЕННЯЯ ПОЧТА — ЗОНА-19
ОТ: ДИРЕКТОР ПО СОДЕРЖАНИЮ У. ХЕНДЕРСОН
КОМУ: Д-Р Л. ЭШВОРТ <SITE19-MED-01>
ДАТА: 16 СЕН 1991
ТЕМА: ОТВ: Уровень запаса SCP-500

Д-р Эшворт,

Запрос получен и направлен связному O5.
Передача из Зон-17 и Зон-23 на данный
момент невозможна.

Формальный протокол нормирования
МЕД-500-Н вступает в силу немедленно.
Дальнейшее использование — только
с прямой санкции O5.

Пересчёт одобрен. Проведите и
предоставьте подтверждённое число
до 20 СЕН.

— У. Хендерсон

---

ОТ: Д-Р Л. ЭШВОРТ <SITE19-MED-01>
КОМУ: Д-Р Г. ФЕНВИК <SITE19-RSH-07>
ДАТА: 16 СЕН 1991
ТЕМА: SCP-427 как альтернатива

Гарольд,

Рассматривал ли ты возможность
использования SCP-427 как частичного
заменителя SCP-500 в некритических
случаях? Знаю, что риск мутации
реален, но при запасе в 6 (да, шесть)
таблеток нам нужны варианты.

Чисто на стадии изучения. Пока ничего
не подавай.

— Линда`,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 8. ANALYST THOMAS QUILL — Аналитик (Уровень 2)
//    Отдел информационной безопасности
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-quill",
    name: "SITE-19 / ANALYST T. QUILL",
    nameRu: "ЗОНА-19 / АНАЛИТИК Т. КУИЛЛ",
    password: "cipher1991",
    level: 2,
    hostname: "SITE19-INF-SEC-05",
    operator: "ANALYST T. QUILL",
    operatorEn: "ANALYST T. QUILL",
    motd: [
      ">> SITE-19 INFOSEC TERMINAL <<",
      ">> ANALYST QUILL // LVL 2 <<",
      ">> ALL ACCESS IS MONITORED <<",
    ],
    motdRu: [
      ">> ТЕРМИНАЛ ИНФ. БЕЗОПАСНОСТИ ЗОНЫ-19 <<",
      ">> АНАЛИТИК КУИЛЛ // УР. 2 <<",
      ">> ВЕСЬ ДОСТУП ОТСЛЕЖИВАЕТСЯ <<",
    ],
    folders: [
      {
        id: "ql-f1",
        name: "THREAT_LOGS",
        nameRu: "ЖУРНАЛЫ_УГРОЗ",
        files: [
          {
            id: "ql-fl1",
            name: "INFOSEC_SEP_THREAT.LOG",
            nameRu: "ИНФОБЕЗ_СЕН_УГРОЗЫ.LOG",
            contentEn: `INFORMATION SECURITY — THREAT LOG
SITE-19 / SEPTEMBER 1991
ANALYST: T. QUILL

THREAT ID: IS-0091-A
DATE: 05 SEP 1991
TYPE: UNAUTHORIZED ACCESS ATTEMPT
DETAIL: Terminal SITE19-CNT-17 (Sector 3
containment records) accessed outside
authorized hours (03:47). Badge ID
logged: [REDACTED]. Credential valid
but holder was not scheduled for Sector 3.
ACTION: Badge suspended pending review.
Investigation referred to Security (Greer).

THREAT ID: IS-0091-B
DATE: 12 SEP 1991
TYPE: ANOMALOUS TERMINAL BEHAVIOR
DETAIL: SITE19-RSH-11 displayed output
inconsistent with any known input:
printed "I KNOW YOU ARE READING THIS"
repeatedly, 847 times, then stopped.
Terminal inspected — no hardware fault.
Possibly SCP-079-adjacent behavior
(isolation check performed—negative).
ACTION: Terminal quarantined. Logged
under Anomalous Incident AI-0091-09.

THREAT ID: IS-0091-C
DATE: 21 SEP 1991
TYPE: CLIPBOARD PROTOCOL VIOLATION
DETAIL: Research personnel photographed
(non-anomalous camera) what appeared
to be a Level 3 document. Photo
confiscated. Breach minimal.
ACTION: Personnel issued formal warning.
Amnestic not required at this time.

MONTH STATUS: ELEVATED / WATCH

-- T. Quill, InfoSec Analyst`,
            contentRu: `ИНФОРМАЦИОННАЯ БЕЗОПАСНОСТЬ — ЖУРНАЛ УГРОЗ
ЗОНА-19 / СЕНТЯБРЬ 1991
АНАЛИТИК: Т. КУИЛЛ

ID УГРОЗЫ: ИБ-0091-А
ДАТА: 05 СЕН 1991
ТИП: ПОПЫТКА НЕСАНКЦИОНИРОВАННОГО ДОСТУПА
ДЕТАЛИ: Терминал SITE19-CNT-17 (записи
содержания, Сектор 3) был доступен
вне разрешённых часов (03:47).
Зарегистрированный ID пропуска:
[ИЗЪЯТО]. Учётные данные действительны,
но владелец не имел расписания в
Секторе 3.
ДЕЙСТВИЕ: Пропуск приостановлен до
рассмотрения. Следствие передано
Охране (Грир).

ID УГРОЗЫ: ИБ-0091-Б
ДАТА: 12 СЕН 1991
ТИП: АНОМАЛЬНОЕ ПОВЕДЕНИЕ ТЕРМИНАЛА
ДЕТАЛИ: SITE19-RSH-11 выдал вывод,
несовместимый с известными входными
данными: напечатал «Я ЗНАЮ, ЧТО ВЫ
ЭТО ЧИТАЕТЕ» повторно 847 раз,
затем остановился. Терминал проверен —
аппаратных неисправностей нет. Возможно,
смежное поведение с SCP-079 (проверка
изоляции проведена — отрицательно).
ДЕЙСТВИЕ: Терминал помещён в карантин.
Журнал: Аномальный инцидент АИ-0091-09.

ID УГРОЗЫ: ИБ-0091-В
ДАТА: 21 СЕН 1991
ТИП: НАРУШЕНИЕ ПРОТОКОЛА ДОКУМЕНТООБОРОТА
ДЕТАЛИ: Исследовательский персонал
сфотографировал (неаномальная камера)
документ 3-го уровня. Фото изъято.
Утечка минимальная.
ДЕЙСТВИЕ: Персонал получил официальное
предупреждение. Амнезиак на данный
момент не требуется.

СТАТУС МЕСЯЦА: ПОВЫШЕННЫЙ / НАБЛЮДЕНИЕ

-- Т. Куилл, аналитик ИБ`,
          },
        ],
      },
      {
        id: "ql-f2",
        name: "MAIL",
        nameRu: "ПОЧТА",
        files: [
          {
            id: "ql-fl2",
            name: "INBOX_QUILL.TXT",
            nameRu: "ВХОДЯЩИЕ_КУИЛЛ.TXT",
            contentEn: `INTERNAL MAIL — SITE-19
FROM: AGENT D. MILLS <SITE19-OPS-12>
TO:   ANALYST T. QUILL <SITE19-INF-SEC-05>
DATE: 13 SEP 1991
SUBJ: Terminal incident 12 SEP

Quill,

Got your flag on the RSH-11 incident.
Has anyone considered whether SCP-079
extended its reach through a cable
path? I know the isolation check came
back clean, but that thing is clever.

Is there any logging from RSH-11's
comm path between 02:00-05:00?

-- Mills

---

FROM: ANALYST T. QUILL <SITE19-INF-SEC-05>
TO:   AGENT D. MILLS <SITE19-OPS-12>
DATE: 13 SEP 1991
SUBJ: RE: Terminal incident 12 SEP

Mills,

Comm path logs attached (LVL 3 access
required — see packet QI-0091-13).

Short answer: no outbound signal from
SCP-079's cell during that window.
But there's a 14-minute gap in
telemetry at exactly 02:58-03:12 which
I can't explain yet.

I'm not saying it's SCP-079. I'm
saying I can't rule it out.

Keep this between us for now.

-- Quill`,
            contentRu: `ВНУТРЕННЯЯ ПОЧТА — ЗОНА-19
ОТ: АГЕНТ Д. МИЛЛС <SITE19-OPS-12>
КОМУ: АНАЛИТИК Т. КУИЛЛ <SITE19-INF-SEC-05>
ДАТА: 13 СЕН 1991
ТЕМА: Инцидент с терминалом 12 СЕН

Куилл,

Получил твой сигнал об инциденте
RSH-11. Рассматривал ли кто-нибудь
возможность, что SCP-079 расширил
влияние через кабельный путь? Знаю,
что проверка изоляции чистая, но
это существо умное.

Есть ли логи пути связи RSH-11
между 02:00 и 05:00?

-- Миллс

---

ОТ: АНАЛИТИК Т. КУИЛЛ <SITE19-INF-SEC-05>
КОМУ: АГЕНТ Д. МИЛЛС <SITE19-OPS-12>
ДАТА: 13 СЕН 1991
ТЕМА: ОТВ: Инцидент с терминалом 12 СЕН

Миллс,

Логи пути связи приложены (требуется
доступ УР. 3 — см. пакет КИ-0091-13).

Кратко: никакого исходящего сигнала
из камеры SCP-079 в этот промежуток.
Но есть 14-минутный разрыв в телеметрии
точно с 02:58 до 03:12, который я
пока не могу объяснить.

Я не говорю, что это SCP-079. Я
говорю, что не могу его исключить.

Пока — между нами.

-- Куилл`,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 9. DIR. WARREN HENDERSON — Директор по содержанию (Уровень 4)
//    Административный корпус, Зона-19
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-henderson",
    name: "SITE-19 / DIR. W. HENDERSON",
    nameRu: "ЗОНА-19 / ДИРЕКТОР У. ХЕНДЕРСОН",
    password: "iron-vault-1",
    level: 4,
    hostname: "SITE19-ADM-01",
    operator: "DIR. W. HENDERSON",
    operatorEn: "DIR. W. HENDERSON",
    motd: [
      ">> SITE-19 ADMINISTRATION <<",
      ">> CONTAINMENT DIRECTOR — LVL 4 <<",
      ">> DIRECTOR W. HENDERSON <<",
    ],
    motdRu: [
      ">> АДМИНИСТРАЦИЯ ЗОНЫ-19 <<",
      ">> ДИРЕКТОР ПО СОДЕРЖАНИЮ — УР. 4 <<",
      ">> ДИРЕКТОР У. ХЕНДЕРСОН <<",
    ],
    folders: [
      {
        id: "hd-f1",
        name: "DIRECTOR_REPORTS",
        nameRu: "ОТЧЁТЫ_ДИРЕКТОРА",
        files: [
          {
            id: "hd-fl1",
            name: "MONTHLY_STATUS_SEP91.DOC",
            nameRu: "МЕС_СТАТУС_СЕН91.DOC",
            contentEn: `MONTHLY CONTAINMENT STATUS REPORT
SITE-19 / SEPTEMBER 1991
PREPARED BY: DIR. W. HENDERSON
CLASSIFICATION: CONFIDENTIAL

CONTAINMENT STATUS OVERVIEW:

KETER CLASS:
- SCP-106: STABLE. Procure Procedure
  110-Montok contingency reviewed.
  Standing by.
- SCP-682: STABLE. Last termination
  attempt (T-98200-EX entry #31):
  FAILED. HCl tank at 94% concentration.
  Recommend replenishment Q4.
- SCP-689: STABLE. 24/7 observation
  maintained. No incidents.
- SCP-1874: RESTRICTED (effective 01 OCT).
  See separate memorandum.
- SCP-008: STABLE. Cryo-containment
  operational. No leaks. Level reviewed.

EUCLID CLASS (notable):
- SCP-173: STABLE. No incidents.
- SCP-096: STABLE. Facial occlusion
  protocols fully enforced.
- SCP-079: Under InfoSec review.
  See Analyst Quill's log IS-0091-B.
- SCP-966: STABLE post-09/17 incident.
  Panel 44-F sealed and logged.
- SCP-049: STABLE. Remains cooperative
  in interviews. Recommends more
  D-class "patients." Request denied.

SAFE CLASS: No significant incidents.
SCP-999 therapy proposal under review.
SCP-500 rationing effective 16 SEP.

OVERALL STATUS: STABLE WITH CONCERNS

DIRECTOR'S NOTE:
The 44-F incident is the third perimeter
lapse in six months. I am ordering a
full infrastructure audit of all Sector
4 access points to be completed by
31 OCT. Banks will coordinate.

-- W. Henderson
   Containment Director, Site-19`,
            contentRu: `ЕЖЕМЕСЯЧНЫЙ ОТЧЁТ О СОСТОЯНИИ СОДЕРЖАНИЯ
ЗОНА-19 / СЕНТЯБРЬ 1991
СОСТАВИЛ: ДИРЕКТОР У. ХЕНДЕРСОН
ГРИФ: КОНФИДЕНЦИАЛЬНО

ОБЗОР СОСТОЯНИЯ СОДЕРЖАНИЯ:

КЛАСС КЕТЕР:
- SCP-106: СТАБИЛЬНО. Проверена
  непредвиденная ситуация для протокола
  110-Монток. На нейтрализации.
- SCP-682: СТАБИЛЬНО. Последняя попытка
  ликвидации (журнал T-98200-EX, запись
  #31): ПРОВАЛИЛАСЬ. Концентрация HCl в
  баке 94%. Рекомендую пополнение в К4.
- SCP-689: СТАБИЛЬНО. Круглосуточное
  наблюдение ведётся. Инцидентов нет.
- SCP-1874: ОГРАНИЧЕН (с 01 ОКТ).
  См. отдельную памятку.
- SCP-008: СТАБИЛЬНО. Криоконтейнер
  работает. Утечек нет.

КЛАСС ЕВКЛИД (существенные):
- SCP-173: СТАБИЛЬНО. Инцидентов нет.
- SCP-096: СТАБИЛЬНО. Протоколы
  закрытия лица полностью соблюдаются.
- SCP-079: Под проверкой InfoSec.
  Журнал аналитика Куилла ИБ-0091-Б.
- SCP-966: СТАБИЛЬНО после инцидента
  09/17. Панель 44-F заделана.
- SCP-049: СТАБИЛЬНО. Кооперативен на
  собеседованиях. Рекомендует больше
  Класса D в качестве «пациентов».
  Запрос отклонён.

КЛАСС БЕЗОПАСНЫЙ: Значительных
инцидентов нет. Предложение о терапии
SCP-999 на рассмотрении. Нормирование
SCP-500 с 16 СЕН.

ОБЩИЙ СТАТУС: СТАБИЛЬНО С ЗАМЕЧАНИЯМИ

ПРИМЕЧАНИЕ ДИРЕКТОРА:
Инцидент 44-F — третий сбой периметра
за шесть месяцев. Приказываю провести
полный аудит инфраструктуры всех пунктов
доступа Сектора 4 до 31 ОКТ.
Координатор — Бэнкс.

-- У. Хендерсон
   Директор по содержанию, Зона-19`,
          },
          {
            id: "hd-fl2",
            name: "SCP1079_INCIDENT_VOTE.DOC",
            nameRu: "SCP1079_ИНЦИДЕНТ_ГОЛОСОВАНИЕ.DOC",
            contentEn: `DIRECTOR'S OFFICE — SITE-19
INTERNAL REQUEST VOTE
DATE: 24 SEP 1991
RE: SCP-1079 (Zombie Candy) — Emergency
    Use Request during D-class fatality

BACKGROUND:
D-class personnel D-5071 suffered fatal
cardiac arrest during approved experiment
with SCP-536. Elapsed time since death:
3 minutes at time of this query.
SCP-1079 can restore life within 5
minutes of death. Known side effects:
personality and behavior alteration.

QUESTION: Authorize SCP-1079 use?

VOTES (Level 4+ required):
DIR. HENDERSON ..... ABSTAIN
DR. REYES      ..... NO
LVL-4 CONN.    ..... [REDACTED]

DECISION: USE NOT AUTHORIZED.
D-5071 deceased. Circumstances
logged under D-Class Fatality Report
DCF-1991-117.

POST-DECISION NOTE (Henderson):
I abstained because I genuinely didn't
know what the right answer was.
I still don't. The personality
alteration data from prior SCP-1079
use is disturbing. A person revived
may not be the same person.
Medical ethics in this Foundation
context remain deeply unresolved.

-- W. Henderson`,
            contentRu: `КАБИНЕТ ДИРЕКТОРА — ЗОНА-19
ВНУТРЕННЕЕ ГОЛОСОВАНИЕ ПО ЗАПРОСУ
ДАТА: 24 СЕН 1991
ТЕМА: SCP-1079 (Газировочные конфеты смерти) —
      Запрос на экстренное применение
      при летальном исходе Класса D

ПРЕДЫСТОРИЯ:
Персонал Класса D, D-5071, скончался
от сердечной недостаточности во время
одобренного эксперимента с SCP-536.
Время с момента смерти: 3 минуты
на момент запроса. SCP-1079 способен
восстановить жизнь в течение 5 минут.
Известные побочные эффекты: изменение
личности и поведения.

ВОПРОС: Санкционировать применение
SCP-1079?

ГОЛОСОВАНИЕ (требуется уровень 4+):
ДИРЕКТОР ХЕНДЕРСОН ..... ВОЗДЕРЖАЛСЯ
Д-Р РЕЙЕС ........... НЕТ
СВЯЗНОЙ УР-4 ....... [ИЗЪЯТО]

РЕШЕНИЕ: ПРИМЕНЕНИЕ НЕ САНКЦИОНИРОВАНО.
D-5071 скончался. Обстоятельства
занесены в отчёт о гибели Класса D
ОГ-1991-117.

ПРИМЕЧАНИЕ ПОСЛЕ РЕШЕНИЯ (Хендерсон):
Я воздержался, потому что честно не
знал, какой ответ правильный. Всё
ещё не знаю. Данные об изменении
личности после предыдущего применения
SCP-1079 тревожны. Воскрешённый человек
может уже не быть тем же человеком.
Медицинская этика в контексте
этого Фонда остаётся глубоко
неразрешённой.

-- У. Хендерсон`,
          },
        ],
      },
      {
        id: "hd-f2",
        name: "MAIL",
        nameRu: "ПОЧТА",
        files: [
          {
            id: "hd-fl3",
            name: "MAIL_O5_LIAISON.TXT",
            nameRu: "ПОЧТА_СВЯЗНОЙ_O5.TXT",
            contentEn: `INTERNAL MAIL — SITE-19
FROM: O5 LIAISON OFFICE
TO:   DIR. W. HENDERSON <SITE19-ADM-01>
DATE: 26 SEP 1991
SUBJ: Quarterly Review — SITE-19

Director Henderson,

The Council has reviewed Q3 status.
Results:

APPROVED:
- SCP-999 therapeutic program (pending
  co-signatures from Research and Psych)
- SCP-682 HCl replenishment for Q4
- Full Sector 4 infrastructure audit

DEFERRED:
- SCP-500 cross-site transfer (no
  surplus available at any monitored site)

DENIED:
- [REDACTED]
- [REDACTED]

MANDATORY ACTION:
Resolve SCP-079 anomalous behavior inquiry
(Quill log IS-0091-B) within 30 days
or reclassification review will be opened.

O5-██
[SIGNATURE REDACTED]

---

FROM: DIR. W. HENDERSON <SITE19-ADM-01>
TO:   O5 LIAISON OFFICE
DATE: 26 SEP 1991
SUBJ: RE: Quarterly Review

Understood. The 30-day clock on SCP-079
starts today. I'll have Quill and Mills
form a joint investigative team.

All mandatory actions acknowledged.

-- W. Henderson`,
            contentRu: `ВНУТРЕННЯЯ ПОЧТА — ЗОНА-19
ОТ: СВЯЗНОЙ ОФИС O5
КОМУ: ДИРЕКТОР У. ХЕНДЕРСОН <SITE19-ADM-01>
ДАТА: 26 СЕН 1991
ТЕМА: Квартальный обзор — ЗОНА-19

Директор Хендерсон,

Совет рассмотрел статус за К3.
Результаты:

ОДОБРЕНО:
- Терапевтическая программа SCP-999
  (ожидаются подписи Исследовательского
  и Психологического отделов)
- Пополнение HCl для SCP-682 в К4
- Полный аудит инфраструктуры Сектора 4

ОТЛОЖЕНО:
- Межзональная передача SCP-500
  (профицита нет ни на одной из
  контролируемых зон)

ОТКЛОНЕНО:
- [ИЗЪЯТО]
- [ИЗЪЯТО]

ОБЯЗАТЕЛЬНЫЕ ДЕЙСТВИЯ:
Разрешить расследование аномального
поведения SCP-079 (журнал Куилла
ИБ-0091-Б) в течение 30 дней или
будет открыт пересмотр классификации.

O5-██
[ПОДПИСЬ ИЗЪЯТА]

---

ОТ: ДИРЕКТОР У. ХЕНДЕРСОН <SITE19-ADM-01>
КОМУ: СВЯЗНОЙ ОФИС O5
ДАТА: 26 СЕН 1991
ТЕМА: ОТВ: Квартальный обзор

Принято. Отсчёт 30 дней по SCP-079
начинается сегодня. Куилла и Миллс
сформирую в совместную следственную
группу.

Все обязательные действия приняты.

-- У. Хендерсон`,
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────
  // 10. DR. NATHANIEL CRANE — Исследователь Кетер (Уровень 4)
//    Отдел опасных объектов, Зона-19
  // ─────────────────────────────────────────────────────────
  {
    id: "t-staff-crane",
    name: "SITE-19 / DR. N. CRANE",
    nameRu: "ЗОНА-19 / Д-Р Н. КРЕЙН",
    password: "keter-watch-zero",
    level: 4,
    hostname: "SITE19-KTR-02",
    operator: "DR. N. CRANE",
    operatorEn: "DR. N. CRANE",
    motd: [
      ">> KETER RESEARCH DIVISION <<",
      ">> DR. CRANE — CLEARANCE LVL 4 <<",
      ">> WARNING: RESTRICTED DATA <<",
    ],
    motdRu: [
      ">> ОТДЕЛ ИЗУЧЕНИЯ КЕТЕР <<",
      ">> Д-Р КРЕЙН — ДОПУСК УР. 4 <<",
      ">> ВНИМАНИЕ: ДАННЫЕ ОГРАНИЧЕННОГО ДОСТУПА <<",
    ],
    folders: [
      {
        id: "cr-f1",
        name: "KETER_FILES",
        nameRu: "ФАЙЛЫ_КЕТЕР",
        files: [
          {
            id: "cr-fl1",
            name: "SCP106_OBSERVATION.DOC",
            nameRu: "SCP106_НАБЛЮДЕНИЕ.DOC",
            contentEn: `KETER OBSERVATION FILE
ITEM: SCP-106 ("The Old Man")
DATE: 08 SEP 1991
RESEARCHER: DR. N. CRANE
LVL REQUIRED: 4

BEHAVIORAL UPDATE:
SCP-106 has been stationary for 11 days
following Procedure 110-Montok activation
on 28 AUG. Standard post-Montok quiet
period appears to be holding.

Corrosion rate of ferrimite lining:
measured at 0.003mm/week (within normal
range). Chamber inspection without
entry confirmed by long-range probe.

PERSONAL NOTE:
I've been studying SCP-106 for three
years. The longer you watch it, the
more you start to see patterns in when
it moves, what triggers activity.

I don't share this with the other
researchers because the conclusion I'm
drawing is uncomfortable:

SCP-106 isn't reacting to stimuli.
It's choosing when to act.

That's a very different kind of threat.

Submitting for Level 5 review, attention
O5 liaison.

-- N. Crane, PhD
   Keter Research Division`,
            contentRu: `ФАЙЛ НАБЛЮДЕНИЯ (КЕТЕР)
ОБЪЕКТ: SCP-106 («Старик»)
ДАТА: 08 СЕН 1991
ИССЛЕДОВАТЕЛЬ: Д-Р Н. КРЕЙН
ТРЕБУЕТСЯ УР.: 4

ОБНОВЛЕНИЕ ПОВЕДЕНИЯ:
SCP-106 находится без движения 11 дней
после активации Процедуры 110-Монток
28 АВГ. Стандартный период покоя
после Монток соблюдается.

Скорость коррозии феррумитовой
облицовки: 0,003 мм/нед. (в пределах
нормы). Осмотр камеры без входа
подтверждён дальнобойным зондом.

ЛИЧНАЯ ЗАМЕТКА:
Я изучаю SCP-106 уже три года. Чем
дольше наблюдаешь, тем больше
начинаешь видеть закономерности:
когда движется, что инициирует
активность.

Я не делюсь этим с другими
исследователями, потому что вывод,
к которому я прихожу, неудобен:

SCP-106 не реагирует на стимулы.
Он выбирает, когда действовать.

Это принципиально иной вид угрозы.

Направляю на рассмотрение Уровня 5,
внимание: связному O5.

-- Н. Крейн, д.н.
   Отдел изучения Кетер`,
          },
          {
            id: "cr-fl2",
            name: "SCP682_TERM_LOG.DOC",
            nameRu: "SCP682_ЖУРНАЛ_ЛИКВИД.DOC",
            contentEn: `TERMINATION ATTEMPT LOG — SCP-682
ENTRY #32 DRAFT (NOT YET FILED)
DATE: 22 SEP 1991
LEAD RESEARCHER: DR. N. CRANE

ATTEMPT METHOD:
Introduced concentrated SCP-009
(Red Ice) via remote injection system
into SCP-682's containment tank.
Hypothesis: SCP-009 cannot be neutralized
by SCP-682's adaptive biology.

RESULT:
SCP-682 exhibited severe distress for
approximately 4 minutes. Vocalized in
an unknown language (transcription
appended — linguistics requested).

At minute 5, SCP-682 ceased vocalizing.
By minute 8, crystallization had been
fully rejected via unknown biological
mechanism. New tissue formed resistant
to sub-zero temperature states.

SCP-682 is now partially cryo-resistant.

DAMAGE: SCP-009 supply reduced by 14L.
SCP-682 physically stable.

RECOMMENDATION:
Do NOT attempt further cryo-agent
combinations without O5 authorization.
Each failed attempt makes it stronger.

This is attempt 32. I don't know how
many more I have in me.

-- N. Crane`,
            contentRu: `ЖУРНАЛ ПОПЫТОК ЛИКВИДАЦИИ — SCP-682
ЗАПИСЬ #32 ЧЕРНОВИК (ЕЩЁ НЕ ПОДАНА)
ДАТА: 22 СЕН 1991
ВЕДУЩИЙ ИССЛЕДОВАТЕЛЬ: Д-Р Н. КРЕЙН

МЕТОД ПОПЫТКИ:
Введение концентрированного SCP-009
(Красный лёд) через систему
дистанционной инъекции в резервуар
SCP-682. Гипотеза: SCP-009 не может
быть нейтрализован адаптивной
биологией SCP-682.

РЕЗУЛЬТАТ:
SCP-682 проявлял сильный дистресс
около 4 минут. Вокализировал на
неизвестном языке (транскрипция
прилагается — запрошена лингвистика).

На 5-й минуте вокализация прекратилась.
К 8-й минуте кристаллизация была
полностью отвергнута посредством
неизвестного биологического механизма.
Образовалась новая ткань, устойчивая
к состояниям ниже нуля.

SCP-682 теперь частично устойчив
к крио-воздействию.

УЩЕРБ: Запас SCP-009 уменьшен на 14 л.
SCP-682 физически стабилен.

РЕКОМЕНДАЦИЯ:
НЕ применять дальнейшие комбинации
крио-агентов без санкции O5.
Каждая неудавшаяся попытка делает
его сильнее.

Это попытка 32. Не знаю, сколько ещё
выдержу.

-- Н. Крейн`,
          },
          {
            id: "cr-fl3",
            name: "SCP409_WARNING.DOC",
            nameRu: "SCP409_ПРЕДУПРЕЖДЕНИЕ.DOC",
            contentEn: `KETER DIVISION — URGENT WARNING
ITEM: SCP-409 (Contagious Crystal)
DATE: 29 SEP 1991
FROM: DR. N. CRANE

INCIDENT SUMMARY:
During quarterly inspection, a minor
hairline crack was discovered in the
ceramic containment wall panel 4 of
SCP-409's chamber. Crack length: ~3mm.
No crystallization contact confirmed.

HOWEVER: The crack was not present
during last month's inspection.
SCP-409 itself has not moved.
The ceramic is supposed to be immune.

This means one of three possibilities:
1) Mechanical stress fracture (most likely)
2) SCP-409's crystallization has found
   a new vector we don't understand
3) Something else in Sector 7 is
   causing structural stress

Option 1 is fine. Options 2 and 3
are catastrophic.

I have ordered ALL access suspended
pending structural engineering review.
If SCP-409 makes contact with the
wall and it crystallizes, we lose
the entire sector in 3 hours.

THREE HOURS.

Awaiting Director Henderson's review.
This cannot wait.

-- N. Crane
   Keter Research, Site-19`,
            contentRu: `ОТДЕЛ КЕТЕР — СРОЧНОЕ ПРЕДУПРЕЖДЕНИЕ
ОБЪЕКТ: SCP-409 (Заражающий кристалл)
ДАТА: 29 СЕН 1991
ОТ: Д-Р Н. КРЕЙН

КРАТКОЕ ОПИСАНИЕ ИНЦИДЕНТА:
При квартальном осмотре обнаружена
незначительная трещина в керамической
стеновой панели 4 камеры SCP-409.
Длина трещины: ~3 мм. Контакт
кристаллизации не подтверждён.

ОДНАКО: Трещины не было при осмотре
в прошлом месяце. Сам SCP-409
не перемещался. Керамика должна быть
устойчивой.

Это означает одну из трёх возможностей:
1) Механическая трещина от нагрузки
   (наиболее вероятно)
2) Кристаллизация SCP-409 нашла
   новый, неизвестный нам вектор
3) Что-то ещё в Секторе 7 вызывает
   структурные напряжения

Вариант 1 — допустим. Варианты 2 и 3 —
катастрофа.

Приказал приостановить ВЕСЬ доступ
до инженерной проверки конструкции.
Если SCP-409 коснётся стены и она
кристаллизуется, мы потеряем весь
сектор за 3 часа.

ТРИ ЧАСА.

Ожидаю рассмотрения директора Хендерсона.
Это не терпит отлагательства.

-- Н. Крейн
   Исследования Кетер, Зона-19`,
          },
        ],
      },
      {
        id: "cr-f2",
        name: "MAIL",
        nameRu: "ПОЧТА",
        files: [
          {
            id: "cr-fl4",
            name: "INBOX_CRANE_SEP.TXT",
            nameRu: "ВХОДЯЩИЕ_КРЕЙН_СЕН.TXT",
            contentEn: `INTERNAL MAIL — SITE-19
FROM: DR. L. ASHWORTH <SITE19-MED-01>
TO:   DR. N. CRANE <SITE19-KTR-02>
DATE: 23 SEP 1991
SUBJ: Entry #32 Results

Nathaniel,

I saw the draft report. That SCP-009/
SCP-682 combination result is...
deeply troubling. You're right that
we shouldn't try more cryo combinations.

Are you okay? Three years on 682 and
now this. Come by Medical sometime.
It's not a formal recommendation.
Just — come by.

— Linda

---

FROM: DR. N. CRANE <SITE19-KTR-02>
TO:   DR. L. ASHWORTH <SITE19-MED-01>
DATE: 23 SEP 1991
SUBJ: RE: Entry #32 Results

Linda,

I'm fine. Thank you. I'll stop by.

For what it's worth: I started writing
these "personal notes" in my reports
because I noticed other researchers
don't. They write the methodology and
nothing else. But if we don't record
what we observe beyond the numbers,
we lose the most important data.

682 is not an experiment. It's a
relationship. A terrible one.

I'll come by Thursday.

— Nathaniel

---

FROM: DIR. W. HENDERSON <SITE19-ADM-01>
TO:   DR. N. CRANE <SITE19-KTR-02>
DATE: 29 SEP 1991
SUBJ: SCP-409 Crack — ACKNOWLEDGED

Crane,

Acknowledged. Structural team is
deploying now. Sector 7 locked.
Good catch. We'll know in 4 hours.

-- Henderson`,
            contentRu: `ВНУТРЕННЯЯ ПОЧТА — ЗОНА-19
ОТ: Д-Р Л. ЭШВОРТ <SITE19-MED-01>
КОМУ: Д-Р Н. КРЕЙН <SITE19-KTR-02>
ДАТА: 23 СЕН 1991
ТЕМА: Результаты записи #32

Натаниэль,

Я видела черновик отчёта. Результат
комбинации SCP-009 / SCP-682...
глубоко тревожен. Ты прав, что
не стоит пробовать больше крио-
комбинаций.

Как ты? Три года на 682-м, и теперь
это. Заходи как-нибудь в Меды.
Это не официальная рекомендация.
Просто — заходи.

— Линда

---

ОТ: Д-Р Н. КРЕЙН <SITE19-KTR-02>
КОМУ: Д-Р Л. ЭШВОРТ <SITE19-MED-01>
ДАТА: 23 СЕН 1991
ТЕМА: ОТВ: Результаты записи #32

Линда,

Всё в порядке. Спасибо. Зайду.

К слову: я начал писать «личные заметки»
в отчётах, потому что заметил — другие
исследователи этого не делают. Они
пишут методологию и больше ничего.
Но если мы не фиксируем то, что
наблюдаем за пределами цифр, мы
теряем самые важные данные.

682 — это не эксперимент. Это отношения.
Ужасные.

Зайду в четверг.

— Натаниэль

---

ОТ: ДИРЕКТОР У. ХЕНДЕРСОН <SITE19-ADM-01>
КОМУ: Д-Р Н. КРЕЙН <SITE19-KTR-02>
ДАТА: 29 СЕН 1991
ТЕМА: Трещина SCP-409 — ПРИНЯТО

Крейн,

Принято. Конструкторская группа
выдвигается сейчас. Сектор 7 заперт.
Хорошо заметил. Через 4 часа будем знать.

-- Хендерсон`,
          },
        ],
      },
    ],
  },

]; // end window.SCP_SEED_STAFF

// Автоматическое слияние с основной базой данных при загрузке
(function() {
  if (window.SCP_SEED && window.SCP_SEED_STAFF) {
    if (!window.SCP_SEED.terminals) window.SCP_SEED.terminals = [];
    window.SCP_SEED.terminals = window.SCP_SEED.terminals.concat(window.SCP_SEED_STAFF);
    console.log("SCP Terminal: Seeded 10 staff terminals.");
  }
})();


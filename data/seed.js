// Seed-данные терминалов SCP Foundation
// Это стартовые терминалы-примеры. Мастер может создавать свои через админ-панель.
// Формат экспорта/импорта через JSON — идентичен этой структуре.

window.SCP_SEED = {
  version: 1,
  meta: {
    org: "SCP FOUNDATION",
    subsystem: "SECURE / CONTAIN / PROTECT",
    build: "SCP-OS v4.17.3",
    year: 1991,
  },
  // Мастер-пароль для админ-панели. Можно изменить в админке.
  masterPassword: "overlord-13",
  // Доступность взлома — включается мастером когда игроки находят "вирус-дискету"
  virusDiskReady: false,
  // Список терминалов. Каждый терминал — отдельный "компьютер" с уникальным паролем.
  terminals: [
    {
      id: "t-site19-recep",
      name: "SITE-19 / RECEPTION TERMINAL",
      nameRu: "ЗОНА-19 / ТЕРМИНАЛ ПРИЁМНОЙ",
      password: "valkyrie",
      level: 1,
      hostname: "SITE19-RCP-01",
      operator: "А. СОКОЛОВА",
      operatorEn: "A. SOKOLOVA",
      motd: [
        ">> CONNECTION ESTABLISHED <<",
        ">> SITE-19 INTERNAL NETWORK <<",
        ">> CLEARANCE LEVEL 1 ACCESS <<",
      ],
      motdRu: [
        ">> СОЕДИНЕНИЕ УСТАНОВЛЕНО <<",
        ">> ВНУТРЕННЯЯ СЕТЬ ЗОНЫ-19 <<",
        ">> ДОСТУП УРОВНЯ 1 <<",
      ],
      folders: [
        {
          id: "f1",
          name: "ROSTER",
          nameRu: "ПЕРСОНАЛ",
          files: [
            {
              id: "fl1",
              name: "SHIFT_ROTATION.TXT",
              nameRu: "ГРАФИК_СМЕН.TXT",
              contentEn: `SITE-19 SHIFT ROTATION — WEEK 47\n============================\n\nMON  06:00 — Dr. Bright (LVL 4)\nTUE  06:00 — Dr. Clef  (LVL 4)\nWED  06:00 — Dr. Glass (LVL 3)\nTHU  06:00 — Dr. Gears (LVL 5)\nFRI  06:00 — Dr. Kondraki (LVL 4)\nSAT  OFF\nSUN  EMERGENCY ROTATION\n\nNOTE: D-class transfer from Site-17\npending approval. See memo #4471.\n\n-- Adm. Assistant\n   A. SOKOLOVA`,
              contentRu: `ГРАФИК СМЕН ЗОНЫ-19 — НЕДЕЛЯ 47\n==================================\n\nПН  06:00 — д-р Брайт   (УР 4)\nВТ  06:00 — д-р Клеф    (УР 4)\nСР  06:00 — д-р Гласс   (УР 3)\nЧТ  06:00 — д-р Гирс    (УР 5)\nПТ  06:00 — д-р Кондраки (УР 4)\nСБ  ВЫХОДНОЙ\nВС  ЭКСТРЕННАЯ РОТАЦИЯ\n\nПРИМЕЧАНИЕ: перевод Класса D из\nЗоны-17 ожидает утверждения.\nСм. памятку #4471.\n\n-- Ассистент администрации\n   А. СОКОЛОВА`,
            },
            {
              id: "fl2",
              name: "VISITOR_LOG.TXT",
              nameRu: "ЖУРНАЛ_ПОСЕТИТЕЛЕЙ.TXT",
              contentEn: `VISITOR LOG — 14 NOV 1991\n==========================\n\n08:12  O5-██ (verified)\n09:45  Dr. ████ (LVL 4)\n10:03  MTF Epsilon-11 "9-Tailed Fox"\n         — 6 personnel, 2 vehicles\n11:27  [RECORD REDACTED BY O5]\n14:50  Supply delivery, dock B\n17:08  Dr. Gears (late entry)\n\nEND OF LOG.`,
              contentRu: `ЖУРНАЛ ПОСЕТИТЕЛЕЙ — 14 НОЯБ 1991\n===================================\n\n08:12  O5-██ (подтверждено)\n09:45  д-р ████ (УР 4)\n10:03  МОГ Эпсилон-11 "Девятихвостый Лис"\n         — 6 человек, 2 машины\n11:27  [ЗАПИСЬ ИЗЪЯТА ПО РАСПОРЯЖ. O5]\n14:50  Поставка, док B\n17:08  д-р Гирс (поздний вход)\n\nКОНЕЦ ЖУРНАЛА.`,
            },
          ],
        },
        {
          id: "f2",
          name: "MEMOS",
          nameRu: "ПАМЯТКИ",
          files: [
            {
              id: "fl3",
              name: "WELCOME.TXT",
              nameRu: "ДОБРО_ПОЖАЛОВАТЬ.TXT",
              contentEn: `WELCOME TO SITE-19\n\nYou have successfully logged into the\nSCP Foundation reception terminal.\n\nFor access to containment logs, please\ncontact your department supervisor for\na Level 2+ credential.\n\nReminder: This terminal is monitored.\nAny attempt to bypass security will\nresult in immediate amnestic treatment.\n\n— Site Director`,
              contentRu: `ДОБРО ПОЖАЛОВАТЬ В ЗОНУ-19\n\nВы успешно вошли в терминал приёмной\nФонда SCP.\n\nДля доступа к журналам содержания\nобратитесь к супервайзеру отдела за\nучётными данными Уровня 2 и выше.\n\nНапоминание: терминал под наблюдением.\nЛюбая попытка обойти защиту приведёт\nк немедленной амнезиакальной обработке.\n\n— Директор Зоны`,
            },
          ],
        },
      ],
    },

    {
      id: "t-site19-containment",
      name: "SITE-19 / CONTAINMENT ARCHIVE",
      nameRu: "ЗОНА-19 / АРХИВ СОДЕРЖАНИЯ",
      password: "keter-rising",
      level: 3,
      hostname: "SITE19-CNT-03",
      operator: "DR. T. BRIGHT",
      operatorEn: "DR. T. BRIGHT",
      motd: [
        ">> CONNECTION ESTABLISHED <<",
        ">> CONTAINMENT ARCHIVE // LVL 3 <<",
        ">> WARNING: INFOHAZARDOUS CONTENT <<",
      ],
      motdRu: [
        ">> СОЕДИНЕНИЕ УСТАНОВЛЕНО <<",
        ">> АРХИВ СОДЕРЖАНИЯ // УР 3 <<",
        ">> ВНИМАНИЕ: ИНФООПАСНЫЙ КОНТЕНТ <<",
      ],
      folders: [
        {
          id: "f1",
          name: "SAFE_CLASS",
          nameRu: "КЛАСС_БЕЗОПАСНЫЙ",
          files: [
            {
              id: "fl1",
              name: "SCP-005.DOC",
              nameRu: "SCP-005.DOC",
              contentEn: `ITEM #: SCP-005\nOBJECT CLASS: SAFE\n\nSPECIAL CONTAINMENT PROCEDURES:\nSCP-005 is to be kept in a display\ncase in the office of Dr. ██████ at\nSite-19. Due to its seemingly harmless\nnature, further containment is not\ndeemed necessary.\n\nDESCRIPTION:\nSCP-005 is an ornate key dated from\nthe early 20th century. Testing has\nrevealed that SCP-005 can unlock\nany mechanical or electronic lock.\n\nThe exact mechanism by which SCP-005\ninteracts with locking mechanisms\nis unknown.\n\n-- END OF DOCUMENT --`,
              contentRu: `ОБЪЕКТ №: SCP-005\nКЛАСС: БЕЗОПАСНЫЙ\n\nОСОБЫЕ УСЛОВИЯ СОДЕРЖАНИЯ:\nSCP-005 содержится в витрине в\nкабинете д-ра ██████ на Зоне-19.\nВвиду безобидной природы объекта,\nдополнительные меры содержания не\nтребуются.\n\nОПИСАНИЕ:\nSCP-005 — декоративный ключ начала\nXX века. Тесты показали, что\nSCP-005 способен открыть любой\nмеханический или электронный замок.\n\nТочный механизм взаимодействия\nSCP-005 с запорными устройствами\nне установлен.\n\n-- КОНЕЦ ДОКУМЕНТА --`,
            },
          ],
        },
        {
          id: "f2",
          name: "EUCLID_CLASS",
          nameRu: "КЛАСС_ЕВКЛИД",
          files: [
            {
              id: "fl2",
              name: "SCP-173.DOC",
              nameRu: "SCP-173.DOC",
              contentEn: `ITEM #: SCP-173\nOBJECT CLASS: EUCLID\n\nSPECIAL CONTAINMENT PROCEDURES:\nItem SCP-173 is to be kept in a locked\ncontainer at all times. When personnel\nmust enter SCP-173's container, no\nfewer than 3 may enter at any time and\nthe door is to be relocked behind them.\nAt all times, two persons must maintain\ndirect eye contact with SCP-173 until\nall personnel have vacated.\n\nDESCRIPTION:\nMoved to Site-19 1993. Origin is\nas of yet unknown. It is constructed\nfrom concrete and rebar with traces\nof Krylon brand spray paint.\n\nSCP-173 is animate and extremely\nhostile. The object cannot move while\nwithin a direct line of sight.\n\nDO NOT BLINK.\n\n-- END OF DOCUMENT --`,
              contentRu: `ОБЪЕКТ №: SCP-173\nКЛАСС: ЕВКЛИД\n\nОСОБЫЕ УСЛОВИЯ СОДЕРЖАНИЯ:\nОбъект SCP-173 должен постоянно\nнаходиться в запертом контейнере.\nПри необходимости входа в контейнер\nдолжны присутствовать не менее трёх\nсотрудников, дверь запирается за ними.\nДва человека обязаны постоянно\nнаблюдать за SCP-173 прямым взглядом\nдо полной эвакуации персонала.\n\nОПИСАНИЕ:\nПеревезён в Зону-19 в 1993 г.\nПроисхождение неизвестно. Состоит\nиз бетона и арматуры со следами\nаэрозольной краски марки Krylon.\n\nSCP-173 одушевлён и крайне враждебен.\nОбъект не может двигаться, находясь\nв прямой видимости наблюдателя.\n\nНЕ МОРГАЙТЕ.\n\n-- КОНЕЦ ДОКУМЕНТА --`,
            },
            {
              id: "fl3",
              name: "SCP-096.DOC",
              nameRu: "SCP-096.DOC",
              contentEn: `ITEM #: SCP-096\nOBJECT CLASS: EUCLID\n\nSPECIAL CONTAINMENT PROCEDURES:\nSCP-096 is to be contained in its\nchamber, a sealed steel cube measuring\n5m × 5m × 5m. Under no circumstances\nshall anyone view SCP-096's face,\nwhether in person, via video, or via\nphotograph.\n\nDESCRIPTION:\nSCP-096 is a humanoid creature measuring\napproximately 2.38m in height. When\nsomeone views SCP-096's face, it will\nenter a stage of considerable emotional\ndistress. After 1-2 minutes, it will\nbegin to run toward the observer.\n\nNothing has been shown to stop SCP-096\nfrom reaching its target.\n\n-- END OF DOCUMENT --`,
              contentRu: `ОБЪЕКТ №: SCP-096\nКЛАСС: ЕВКЛИД\n\nОСОБЫЕ УСЛОВИЯ СОДЕРЖАНИЯ:\nSCP-096 содержится в камере,\nпредставляющей собой запечатанный\nстальной куб 5×5×5 м. Ни при каких\nобстоятельствах запрещается смотреть\nна лицо SCP-096 — лично, на видео\nили на фотографиях.\n\nОПИСАНИЕ:\nSCP-096 — гуманоидное существо ростом\nпримерно 2,38 м. Когда кто-либо видит\nего лицо, объект впадает в состояние\nсильного эмоционального стресса.\nСпустя 1-2 минуты он начинает бежать\nв сторону наблюдателя.\n\nНикакие методы на данный момент не\nспособны остановить SCP-096 до того,\nкак он достигнет цели.\n\n-- КОНЕЦ ДОКУМЕНТА --`,
            },
          ],
        },
        {
          id: "f3",
          name: "INCIDENTS",
          nameRu: "ИНЦИДЕНТЫ",
          files: [
            {
              id: "fl4",
              name: "INC_096-A.LOG",
              nameRu: "ИНЦ_096-А.LOG",
              corrupted: true,
              contentEn: `INCIDENT REPORT 096-A\n=======================\n\nDATE: ██/██/1991\nLOCATION: CONTAINMENT CHAMBER 17B\n\nAT ██:██ HOURS, D-CLASS PERSONNEL\nD-████ WAS ORDERED TO ENTER THE\nCHAMBER OF SCP-096 AND—\n\n[DATA EXPUNGED]\n\n—SUBSEQUENT EVENTS RESULTED IN\nTHE DEATH OF ██ FOUNDATION STAFF\nAND ██ D-CLASS.\n\nSCP-096 WAS RE-CONTAINED AT ██:██\nHOURS BY MTF EPSILON-11.\n\n[RECORD CONTINUES ▓▓▓▓▓▓▓▓▓▓]\n\n██████████████████████████\n██ █ ██ █████ ██████ █ ███\n████ ██ █████████ ██ █████\n\n-- CORRUPTED --`,
              contentRu: `ОТЧЁТ ОБ ИНЦИДЕНТЕ 096-А\n==========================\n\nДАТА: ██/██/1991\nМЕСТО: КАМЕРА СОДЕРЖАНИЯ 17B\n\nВ ██:██ ПЕРСОНАЛУ КЛАССА D, D-████,\nБЫЛО ПРИКАЗАНО ВОЙТИ В КАМЕРУ\nSCP-096 И—\n\n[ДАННЫЕ УДАЛЕНЫ]\n\n—ПОСЛЕДУЮЩИЕ СОБЫТИЯ ПРИВЕЛИ К\nГИБЕЛИ ██ СОТРУДНИКОВ ФОНДА И\n██ КЛАССА D.\n\nSCP-096 БЫЛ ПОВТОРНО СОДЕРЖАН В ██:██\nСИЛАМИ МОГ ЭПСИЛОН-11.\n\n[ЗАПИСЬ ПРОДОЛЖАЕТСЯ ▓▓▓▓▓▓▓▓▓▓]\n\n██████████████████████████\n██ █ ██ █████ ██████ █ ███\n████ ██ █████████ ██ █████\n\n-- ПОВРЕЖДЕНО --`,
            },
          ],
        },
      ],
    },

    {
      id: "t-o5-command",
      name: "O5 COMMAND // CLASSIFIED",
      nameRu: "КОМАНДОВАНИЕ O5 // СЕКРЕТНО",
      password: "oracle-five",
      level: 5,
      hostname: "O5-NET-00",
      operator: "O5-█",
      operatorEn: "O5-█",
      motd: [
        ">> O5 COMMAND NETWORK <<",
        ">> TOP SECRET // CODEWORD <<",
        ">> ALL ACTIONS ARE LOGGED <<",
      ],
      motdRu: [
        ">> СЕТЬ КОМАНДОВАНИЯ O5 <<",
        ">> СОВ. СЕКРЕТНО // КОДОВОЕ <<",
        ">> ВСЕ ДЕЙСТВИЯ ЖУРНАЛИРУЮТСЯ <<",
      ],
      folders: [
        {
          id: "f1",
          name: "KETER_PROTOCOLS",
          nameRu: "ПРОТОКОЛЫ_КЕТЕР",
          files: [
            {
              id: "fl1",
              name: "SCP-682_KILL.DOC",
              nameRu: "SCP-682_ЛИКВИДАЦИЯ.DOC",
              contentEn: `ITEM #: SCP-682\nOBJECT CLASS: KETER\n\nDESTRUCTION AUTHORIZATION: ACTIVE\nSTANDING ORDER: TERMINATE ON SIGHT\n\nSCP-682 must be destroyed as soon as\npossible. Any means necessary to\npermanently terminate the subject\nare to be authorized immediately.\n\nTo date, all attempts at termination\nhave failed. Experiments logged under\nTermination Attempt Log T-98200-EX.\n\n-- O5 COUNCIL UNANIMOUS VOTE --\n-- STANDING ORDER: INDEFINITE --`,
              contentRu: `ОБЪЕКТ №: SCP-682\nКЛАСС: КЕТЕР\n\nСАНКЦИЯ НА УНИЧТОЖЕНИЕ: АКТИВНА\nПОСТОЯННЫЙ ПРИКАЗ: УБИТЬ ПРИ ВСТРЕЧЕ\n\nSCP-682 должен быть уничтожен при\nпервой возможности. Все средства,\nнеобходимые для окончательной\nликвидации, санкционируются немедленно.\n\nНа данный момент все попытки\nликвидации провалились. Эксперименты\nзарегистрированы в журнале T-98200-EX.\n\n-- ЕДИНОГЛАСНОЕ ГОЛОСОВАНИЕ СОВЕТА O5 --\n-- ПРИКАЗ БЕССРОЧНЫЙ --`,
            },
            {
              id: "fl2",
              name: "PROTOCOL_CRIMSON.DOC",
              nameRu: "ПРОТОКОЛ_БАГРОВЫЙ.DOC",
              corrupted: true,
              contentEn: `PROTOCOL CRIMSON — XK EVENT\n============================\n\nIN THE EVENT OF AN XK-CLASS\nEND-OF-THE-WORLD SCENARIO:\n\n1. [DATA EXPUNGED]\n2. [DATA EXPUNGED]\n3. RELEASE OF SCP-████ AUTHORIZED\n4. [DATA EXPUNGED]\n5. ██████████████████████████\n\n▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n\nACCESS BEYOND THIS POINT REQUIRES\nBIOMETRIC AUTHORIZATION FROM\nAT LEAST THREE (3) O5 MEMBERS.\n\n-- SECURE, CONTAIN, PROTECT --`,
              contentRu: `ПРОТОКОЛ БАГРОВЫЙ — СОБЫТИЕ XK\n================================\n\nВ СЛУЧАЕ СЦЕНАРИЯ КЛАССА XK\n(КОНЕЦ СВЕТА):\n\n1. [ДАННЫЕ УДАЛЕНЫ]\n2. [ДАННЫЕ УДАЛЕНЫ]\n3. ОСВОБОЖДЕНИЕ SCP-████ САНКЦИОН.\n4. [ДАННЫЕ УДАЛЕНЫ]\n5. ██████████████████████████\n\n▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓\n\nДОСТУП ЗА ПРЕДЕЛЫ ЭТОЙ ТОЧКИ ТРЕБУЕТ\nБИОМЕТРИЧЕСКОЙ АВТОРИЗАЦИИ ОТ НЕ\nМЕНЕЕ ЧЕМ ТРЁХ (3) ЧЛЕНОВ СОВЕТА O5.\n\n-- SECURE, CONTAIN, PROTECT --`,
            },
          ],
        },
        {
          id: "f2",
          name: "COUNCIL_LOG",
          nameRu: "ЖУРНАЛ_СОВЕТА",
          files: [
            {
              id: "fl3",
              name: "VOTE_4471.TXT",
              nameRu: "ГОЛОСОВАНИЕ_4471.TXT",
              contentEn: `O5 COUNCIL VOTE #4471\n======================\nDATE: 14 NOV 1991\nRE: RECLASSIFICATION OF SCP-████\n\nO5-1  ..... YEA\nO5-2  ..... YEA\nO5-3  ..... NAY\nO5-4  ..... ABSTAIN\nO5-5  ..... YEA\nO5-6  ..... YEA\nO5-7  ..... NAY\nO5-8  ..... YEA\nO5-9  ..... ABSENT\nO5-10 ..... YEA\nO5-11 ..... YEA\nO5-12 ..... YEA\nO5-13 ..... [REDACTED]\n\nRESULT: MOTION PASSES.\nSCP-████ RECLASSIFIED AS KETER.`,
              contentRu: `ГОЛОСОВАНИЕ СОВЕТА O5 #4471\n=============================\nДАТА: 14 НОЯБ 1991\nТЕМА: ПЕРЕКЛАССИФИКАЦИЯ SCP-████\n\nO5-1  ..... ЗА\nO5-2  ..... ЗА\nO5-3  ..... ПРОТИВ\nO5-4  ..... ВОЗДЕРЖ.\nO5-5  ..... ЗА\nO5-6  ..... ЗА\nO5-7  ..... ПРОТИВ\nO5-8  ..... ЗА\nO5-9  ..... ОТСУТСТВ.\nO5-10 ..... ЗА\nO5-11 ..... ЗА\nO5-12 ..... ЗА\nO5-13 ..... [ИЗЪЯТО]\n\nРЕЗУЛЬТАТ: ПРИНЯТО.\nSCP-████ ПЕРЕКЛАССИФИЦИРОВАН КАК КЕТЕР.`,
            },
          ],
        },
      ],
    },
  ],
  loginLog: [],
};

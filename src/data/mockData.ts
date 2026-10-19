import { Meeting, Space, Recipe } from '../types';

export const INITIAL_SPACES: Space[] = [
  {
    id: 'my-notes',
    name: 'My notes',
    isPrivate: true,
    folders: [
      { id: 'f-1on1', spaceId: 'my-notes', name: '1-on-1s', meetingCount: 3 },
      { id: 'f-drafts', spaceId: 'my-notes', name: 'Personal Drafts', meetingCount: 2 },
      { id: 'f-ideas', spaceId: 'my-notes', name: 'Product Ideas', meetingCount: 1 },
      { id: 'f-reviews', spaceId: 'my-notes', name: 'Quarterly Reviews', meetingCount: 1 },
    ],
  },
  {
    id: '1-on-1s',
    name: '1-on-1s',
    isPrivate: false,
    folders: [
      { id: 'f-team-1', spaceId: '1-on-1s', name: 'Alena Syncs', meetingCount: 4 },
      { id: 'f-team-2', spaceId: '1-on-1s', name: 'Dima Syncs', meetingCount: 2 },
    ],
  },
  {
    id: 'cross-department',
    name: 'Cross-Department ...',
    isPrivate: false,
    folders: [],
  },
  {
    id: 'it-core',
    name: 'IT Core',
    isPrivate: false,
    folders: [
      { id: 'f-infra', spaceId: 'it-core', name: 'Infrastructure', meetingCount: 5 },
      { id: 'f-deploy', spaceId: 'it-core', name: 'Releases & CI/CD', meetingCount: 3 },
    ],
  },
  {
    id: 'tech-team-syncs',
    name: 'Tech Team Syncs',
    isPrivate: false,
    folders: [
      { id: 'f-arch', spaceId: 'tech-team-syncs', name: 'Architecture Syncs', meetingCount: 6 },
      { id: 'f-sprint', spaceId: 'tech-team-syncs', name: 'Sprint Planning', meetingCount: 8 },
    ],
  },
  {
    id: 'malcoms-hq',
    name: "Malcom's HQ",
    isPrivate: false,
    folders: [],
  },
];

export const INITIAL_RECIPES: Recipe[] = [
  { id: 'todos', title: 'List recent todos', prompt: 'List all action items and todos assigned during the meeting with deadlines and owners.' },
  { id: 'coach', title: 'Coach me Matt', prompt: 'Analyze my communication tone and effectiveness during the meeting and give constructive coaching advice.' },
  { id: 'calendar', title: 'Streamline my calendar', prompt: 'Suggest upcoming meetings based on commitments and follow-ups discussed.' },
  { id: 'recap', title: 'Write weekly recap', prompt: 'Synthesize the key progress points and blockers into an executive weekly recap email.' },
  { id: 'prd', title: 'Write PRD', prompt: 'Structure the discussion into a comprehensive Product Requirements Document with user stories and acceptance criteria.' },
];

export const PROOF_DATA_BY_BULLET: Record<string, any> = {
  'seo-bot': {
    summary: 'Задача появилась после того, как выяснилось, что SEO-инфраструктуру уже подняли, но не хватало понятного объяснения, как ей пользоваться, и Дима стал подстраивать её под рабочий процесс Альберта через сервисного бота.',
    quotes: [
      {
        speaker: 'Someone else',
        timestamp: '04:48',
        startMs: 288000,
        text: 'Плюс, вот сегодня у нас с утра подсветился момент, что инфраструктуру по SEO-то мы две недели назад подняли, но это, конечно, моя недоработка, что вот какого-то внятного объяснения, видимо, как с этим работать и взаимодействовать, я не прописал, не дал, замешкался, конечно, в куче задач.'
      },
      {
        speaker: 'Someone else',
        timestamp: '06:17',
        startMs: 377000,
        text: 'Сегодня с Альбертом ещё 20 доменов добавили в тестовом режиме.'
      }
    ],
    conclusion: 'В конце синка уточнили ближайший шаг: вынести для него отдельный инструмент и отдельный мониторинг, чтобы он мог быстрее добавлять домены.'
  },
  'discord-bot': {
    summary: 'Обсуждали необходимость автономной записи звонков в Discord без подключения виртуальных ботов-участников. Решили протестировать локальное решение.',
    quotes: [
      {
        speaker: 'Дима',
        timestamp: '02:15',
        startMs: 135000,
        text: 'Задача по self-hosted записи уже была, но не ушла в работу; Юля поднимет контекст по предыдущим тестам.'
      }
    ],
    conclusion: 'Дима и Максим созвонятся завтра отдельно для технического тестирования.'
  }
};

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'seo-infrastructure-sync',
    title: 'Синхронизация по SEO-боту и инфраструктуре',
    spaceId: 'tech-team-syncs',
    folderId: 'f-arch',
    folderName: 'Architecture Syncs',
    ownerName: 'Дима & Максим',
    createdAt: '15:10',
    durationSeconds: 420,
    participants: ['Дима', 'Максим', 'Юля', 'Марк', 'Альберт'],
    rawUserNotes: `• Discord: поиск self-hosted решения для записи звонков и составления саммари
  ◦ Задача уже была, не ушла в работу; Юля вытащит контекст
  ◦ Дима и Максим созвонятся отдельно (перенесли на завтра)
• Arbi Flow доступы: Марк создаст отдельного юзера с ролью «техспециалист» для Максима

# Следующие шаги
• Дописать SEO-бота и документацию для Альберта (Дима)
  Выдать инструмент для создания доменов с отдельным аккаунтом
• Перехватить управление инфраструктурой и DNS
• Запросить у финотдела формат отчётности в конце месяца
• Организовать тестовую группу для нового RDP (Юля)
• Уточнить на кого завязаны аутсорс команды
• Создать колл-центр в аккаунт-менеджере и выгрузить таблицу (Максим)`,
    enhancedNotes: `• Discord: поиск self-hosted решения для записи звонков и составления саммари
  ◦ Задача уже была, не ушла в работу; Юля вытащит контекст
  ◦ Дима и Максим созвонятся отдельно (перенесли на завтра)
• Arbi Flow доступы: Марк создаст отдельного юзера с ролью «техспециалист» для Максима

# Следующие шаги
• Дописать SEO-бота и документацию для Альберта (Дима)
  Выдать инструмент для создания доменов с отдельным аккаунтом
• Перехватить управление инфраструктурой и DNS
• Запросить у финотдела формат отчётности в конце месяца
• Организовать тестовую группу для нового RDP (Юля)
• Уточнить на кого завязаны аутсорс команды
• Создать колл-центр в аккаунт-менеджере и выгрузить таблицу (Максим)`,
    isEnhanced: true,
    transcript: [
      {
        id: 'c101',
        speaker: 'Someone else',
        channel: 1,
        startMs: 288000,
        endMs: 302000,
        text: 'Плюс, вот сегодня у нас с утра подсветился момент, что инфраструктуру по SEO-то мы две недели назад подняли, но это, конечно, моя недоработка, что вот какого-то внятного объяснения, видимо, как с этим работать и взаимодействовать, я не прописал, не дал, замешкался, конечно, в куче задач.'
      },
      {
        id: 'c102',
        speaker: 'Someone else',
        channel: 1,
        startMs: 377000,
        endMs: 389000,
        text: 'Сегодня с Альбертом ещё 20 доменов добавили в тестовом режиме.'
      }
    ]
  },
  {
    id: 'demo-meeting',
    title: 'Demo meeting',
    spaceId: 'my-notes',
    ownerName: 'Sam Stephenson',
    createdAt: '10:52',
    durationSeconds: 185,
    participants: ['Sam Stephenson', 'Malcom Southwell'],
    rawUserNotes: `# What Granola Is\n- AI meeting notes tool combining transcript capture with manual notes\n- Produces "enhanced notes" automatically at meeting end\n\n# Key UI Elements\n- Granola notepad: on the right of the screen, works like a standard text editor\n- Transcript view: opened via the green dancing bars at the bottom of the screen\n- Shows live incoming audio/speech in real time\n\n# How It Works\n- During the meeting: type notes in the notepad alongside the live transcript\n- At meeting end: Granola auto-detects and generates enhanced notes\n- Notes blend transcript content with anything typed in the notepad\n- Result is shareable, polished notes with minimal effort\n\n# Manual Demo Steps Covered\n1. Open transcript via green dancing bars\n2. Write a line or two in the notepad\n3. Click the stop button at the bottom of the screen\n4. Click the enhanced notes button (bright green) to generate notes`,
    enhancedNotes: `# What Granola Is\n- **AI meeting notes workspace** combining non-intrusive local audio transcript capture with manual user notes\n- Produces high-fidelity **enhanced notes** automatically at meeting end, mapping every statement back to source audio timestamps\n\n# Key UI Elements\n- **Ovsyanka notepad**: Clean, distraction-free markdown/WYSIWYG editor with keyboard shortcuts and two-layer diff highlighting\n- **Transcript drawer**: Opened via the green dancing sound wave bars at the bottom of the screen\n- Shows live incoming audio and dual-channel speech separation in real time\n\n# How It Works\n- **During the meeting**: Type anchor notes in the notepad alongside the real-time transcript\n- **At meeting end**: AI auto-synthesizes and enhances your notes without altering your original thoughts\n- Blends transcript facts (dates, technical terms, assignees) with typed bullets\n- Result is polished, executive-ready documentation in seconds\n\n# Manual Demo Steps Covered\n1. Open transcript via green dancing bars\n2. Write anchor bullets in the notepad\n3. Click the stop button at the bottom of the screen\n4. Click the enhanced notes button to generate citations and full action items`,
    isEnhanced: true,
    transcript: [
      {
        id: 'c1',
        speaker: 'Sam Stephenson',
        channel: 1,
        startMs: 2400,
        endMs: 8200,
        text: "Granola is an AI meeting notes tool combining transcript capture with manual notes. It produces enhanced notes automatically at meeting end.",
      },
      {
        id: 'c2',
        speaker: 'Malcom Southwell',
        channel: 0,
        startMs: 8500,
        endMs: 14100,
        text: "Let's look at the key UI elements: the notepad works like a standard text editor, while the transcript view is opened via the green dancing bars at the bottom of the screen.",
      },
      {
        id: 'c3',
        speaker: 'Sam Stephenson',
        channel: 1,
        startMs: 14500,
        endMs: 21300,
        text: "Exactly. During the meeting you just type brief notes, and at meeting end it auto-detects and blends transcript content with anything typed in the notepad.",
      },
      {
        id: 'c4',
        speaker: 'Malcom Southwell',
        channel: 0,
        startMs: 21800,
        endMs: 29000,
        text: "To demo this: open transcript via green dancing bars, write a line or two in the notepad, click the stop button and click the enhanced notes button.",
      },
    ],
  },
  {
    id: 'it-sync',
    title: 'IT-отдел: еженедельный синк с обновлениями по задачам',
    spaceId: 'it-core',
    folderId: 'f-infra',
    folderName: 'Infrastructure',
    ownerName: 'Me',
    createdAt: '14:28',
    durationSeconds: 1540,
    participants: ['Me', 'Alex (DevOps)', 'Dmitry (Backend)'],
    rawUserNotes: `- Миграция БД на PostgreSQL 16 завершена\n- Тестирование pgvector для семантического поиска\n- Redis кластер обновлен до v7.2\n- Дедлайн релиза v1.0 запланирован на следующую среду`,
    enhancedNotes: `- **Миграция базы данных**: Успешно завершен перевод кластера на PostgreSQL 16 с расширением pgvector для семантического RAG-поиска\n- **Кэширование**: Кластер Redis обновлен до версии 7.2, задержка pub/sub снизилась до <2мс\n- **График релизов**: Финальная сборка v1.0 назначена на следующую среду 12:00 UTC`,
    isEnhanced: true,
    transcript: [],
  },
  {
    id: 'verstka-sync',
    title: 'Перенос верстки в IT-отдел и оптимизация структуры с Алёной',
    spaceId: 'tech-team-syncs',
    folderId: 'f-arch',
    folderName: 'Architecture Syncs',
    ownerName: 'Me',
    createdAt: '11:58',
    durationSeconds: 980,
    participants: ['Me', 'Алёна (Lead Designer)'],
    rawUserNotes: `- Согласовали цветовую палитру (warm cream #FAF9F6)\n- Шрифтовой стек: системный sans для UI + serif для заголовков\n- Шторка транскрипта должна анимироваться плавно снизу`,
    enhancedNotes: `- **Дизайн-система**: Утвержден базовый фон рабочей области (#FAF9F6) и акцентные бейджи\n- **Типографика**: Использование Georgia/Serif для заголовков заметок и системного sans для контроллеров и сайдбара\n- **Интерактивные виджеты**: Плавная анимация всплытия нижней панели транскрипции с сохранением фокуса в редакторе`,
    isEnhanced: true,
    transcript: [],
  },
];

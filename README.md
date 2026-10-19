# Ovsyanka (Овсянка) — No-Bot Meeting AI Workspace

> Нативный AI-ассистент для заметок и транскрибации встреч с архитектурой **No-Bot** (аналог Granola.ai). Запись аудио осуществляется локально через ScreenCaptureKit и микрофон без подключения ботов к конференциям Zoom, Google Meet, Teams, Discord, Slack.

---

## 🚀 Текущий статус разработки: Фазы 1, 2 и 3 завершены

### 1. Фаза 1 (MVP)
- **UI / UX (Granola-like)**: Сайдбар со Spaces, виджет **Coming up** с календарем, список встреч **Today**, нижний омнибар «Ask anything».
- **Интерактивный блокнот (TipTap WYSIWYG Markdown)**: переключатель режимов `Raw Notes` / `Enhanced`, двухслойное отображение, автосохранение.
- **Шторка Live Transcript**: зеленые танцующие полосы (`|||`), аудиовизуализатор, поток стенограммы с таймкодами, Pause/Resume, выбор языка (`Multi`).
- **No-Bot Audio Layer**: модуль `ScreenAudioCapture.swift` (Ch 0: Микрофон через `AVAudioEngine`, Ch 1: Системный звук через `ScreenCaptureKit`).

### 2. Фаза 2 (Workspace & Backend)
- **Схема данных (PostgreSQL + pgvector)**: таблицы `users`, `spaces`, `folders`, `meetings`, `meeting_embeddings`.
- **FastAPI Backend**: JWT-аутентификация, RBAC, CRUD для пространств и заметок.
- **Pre-Meeting Intelligence (Подготовка брифа)**: анализ контекста прошлых встреч с теми же участниками перед звонком.
- **Zero Audio Storage**: автоудаление сырых аудиофайлов после транскрипции (политика конфиденциальности NDA).
- **Docker Compose**: PostgreSQL 16 `pgvector`, Redis 7.2, MinIO S3 и FastAPI Backend.

### 3. Фаза 3 (Advanced AI, Diarization & Recipes)
- **Диаризация (Speaker Diarization)**:
  - Аппаратное разделение пользователя от удаленных участников (по каналам L/R).
  - Кластеризация и определение спикеров в системном аудиоканале (`Remote Speaker 1`, `Remote Speaker 2`).
- **Синхронизация Source Zoom-In**:
  - Интерактивный плеер `AudioPlayerBar` с таймкодами `[start_ms, end_ms]`.
  - Клик по любому тезису или таймкоду в тексте заметок перематывает плеер на точную аудио-цитату спикера.
- **Система шаблонов (Recipes & Custom Prompts)**:
  - Стандартные рецепты: *Executive Summary*, *Engineering Sync*, *1-on-1 Framework*, *Action Items Extraction*.
  - Конструктор шаблонов (*Prompt Builder*): переменные `{{transcript}}`, `{{user_notes}}`, `{{participants}}`, `{{meeting_title}}`, `{{folder_context}}`.
  - Слеш-команды: `/jira-ticket` — мгновенное форматирование Action Items в тикет Jira.
- **Hybrid STT Engine**:
  - Локальный движок Whisper (Metal на Apple Silicon / CUDA на RTX) + фоллбек на Groq / Deepgram API.

---

## 🛠 Запуск в локальном окружении

### 1. Запуск десктопного фронтенда:
```bash
npm run dev
# Доступен по адресу: http://127.0.0.1:5173
```

### 2. Запуск Backend API:
```bash
./backend/.venv/bin/uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
# API доступно по адресу: http://127.0.0.1:8000
# Интерактивная Swagger документация: http://127.0.0.1:8000/docs
```

### 3. Запуск тестов:
```bash
PYTHONPATH=. ./backend/.venv/bin/pytest backend/tests/test_api.py -v
```

---

## 🗺 Следующий этап: Фаза 4 (Enterprise, Integrations & Global RAG)
- Интеграции: Webhooks в **Slack**, **Notion**, **Linear**, **Jira**, **Salesforce**.
- Глобальный RAG с синтезом ответов по всей компании с фильтрами по датам и участникам.
- Корпоративный RBAC, SSO (SAML/Okta) и аудит-логи безопасности.

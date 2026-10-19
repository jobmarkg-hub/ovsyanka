from typing import List, Dict, Any, Optional
import re

STANDARD_TEMPLATES = [
    {
        "id": "executive-summary",
        "title": "Executive Summary",
        "description": "Контекст, ключевые договоренности, развилки решений, блокеры.",
        "icon": "Briefcase",
        "category": "standard",
        "prompt_template": """# Executive Summary: {{meeting_title}}
**Участники:** {{participants}}

### 1. Контекст встречи
{{user_notes}}

### 2. Ключевые договоренности
- Зафиксировано на основе стенограммы и заметок.

### 3. Развилки решений и альтернативы
- Рассмотренные подходы и выбранное решение.

### 4. Блокеры и риски
- Критические зависимости и риски сроков.
"""
    },
    {
        "id": "engineering-sync",
        "title": "Engineering Sync",
        "description": "Статус сервисов, технический долг, архитектурные изменения, ревью задач.",
        "icon": "Cpu",
        "category": "standard",
        "prompt_template": """# Engineering Sync: {{meeting_title}}
**Инженерная команда:** {{participants}}

### 🛠 Статус сервисов и релизов
- Текущие пайплайны и мониторинг.

### 🏛 Архитектурные изменения
{{user_notes}}

### ⚠️ Технический долг
- Выявленные узкие места в архитектуре.

### 📋 Ревью задач
- Распределение задач спринта и code review.
"""
    },
    {
        "id": "one-on-one",
        "title": "1-on-1 Framework",
        "description": "Эмоциональное состояние, успехи, сложности в коммуникации, взаимные коммитменты (Lead ↔ Report).",
        "icon": "UserCheck",
        "category": "standard",
        "prompt_template": """# 1-on-1 Framework: {{meeting_title}}
**Участники:** {{participants}}

### 1. Эмоциональное состояние и мотивация
- Уровень нагрузки, выгорание, атмосфера в команде.

### 2. Успехи и достижения за период
{{user_notes}}

### 3. Сложности и точки роста
- Зоны для развития и блокеры в коммуникации.

### 4. Взаимные коммитменты (Lead ↔ Report)
- [ ] Обязательства руководителя:
- [ ] Обязательства сотрудника:
"""
    },
    {
        "id": "action-items",
        "title": "Action Items Extraction",
        "description": "Таблица: Задача | Ответственный | Срок | Критерий готовности.",
        "icon": "CheckSquare",
        "category": "standard",
        "prompt_template": """# Action Items: {{meeting_title}}

| Задача | Ответственный | Срок | Критерий готовности |
| :--- | :--- | :--- | :--- |
| Миграция БД на PostgreSQL 16 | DevOps / Me | Пятница | pgvector активирован, тесты зеленые |
| Интеграция аудиозахвата ScreenCaptureKit | IT Core | Среда | Двухканальный буфер протестирован |
| Согласование бюджета инфраструктуры | Lead | 25 октября | Бюджет $10k утвержден финансовым отделом |

### Исходные тезисы
{{user_notes}}
"""
    }
]

class TemplateService:
    @staticmethod
    def get_all_templates() -> List[Dict[str, Any]]:
        return STANDARD_TEMPLATES

    @staticmethod
    def render_template(
        template_id: str,
        context: Dict[str, Any]
    ) -> str:
        """
        Renders template with variables:
        {{transcript}}, {{user_notes}}, {{participants}}, {{meeting_title}}, {{folder_context}}
        """
        tmpl = next((t for t in STANDARD_TEMPLATES if t["id"] == template_id), STANDARD_TEMPLATES[0])
        rendered = tmpl["prompt_template"]

        transcript_text = "\n".join(
            f"[{c.get('speaker', 'Speaker')}]: {c.get('text', '')}"
            for c in context.get("transcript", [])
        )

        participants_str = ", ".join(context.get("participants", ["Me"]))
        user_notes_str = context.get("user_notes", "") or "- (Заметки не были введены вручную)"
        meeting_title_str = context.get("meeting_title", "Meeting")
        folder_str = context.get("folder_context") or "General"

        rendered = rendered.replace("{{transcript}}", transcript_text)
        rendered = rendered.replace("{{user_notes}}", user_notes_str)
        rendered = rendered.replace("{{participants}}", participants_str)
        rendered = rendered.replace("{{meeting_title}}", meeting_title_str)
        rendered = rendered.replace("{{folder_context}}", folder_str)

        return rendered

    @staticmethod
    def process_slash_command(command: str, selected_text: str) -> str:
        """
        Processes slash commands (e.g. /jira-ticket, /linear-issue)
        """
        if command.lower() in ["/jira-ticket", "/jira"]:
            lines = [l.strip() for l in selected_text.split("\n") if l.strip()]
            summary = lines[0].lstrip("-*# ") if lines else "Task"
            description = "\n".join(lines[1:]) if len(lines) > 1 else selected_text
            return f"""**Jira Issue Created:**
* **Summary:** {summary}
* **Issue Type:** Task
* **Priority:** Medium
* **Description:**
{description}
* **Status:** To Do
"""
        return selected_text

template_service = TemplateService()

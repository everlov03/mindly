"""Заполнение справочников: настроения и категории активностей с базовыми элементами."""
from app.core.db import SessionLocal
from app.models.mood import Mood
from app.models.activity import ActivityCategory, ActivityItem

MOODS = [
    {"id": 1, "label": "Отличное", "emoji": "😄", "color": "#FFD93D", "sort_order": 1},
    {"id": 2, "label": "Хорошее",  "emoji": "🙂", "color": "#6BCB77", "sort_order": 2},
    {"id": 3, "label": "Нейтральное", "emoji": "😐", "color": "#4D96FF", "sort_order": 3},
    {"id": 4, "label": "Плохое",   "emoji": "😔", "color": "#FF922B", "sort_order": 4},
    {"id": 5, "label": "Ужасное",  "emoji": "😣", "color": "#FF6B6B", "sort_order": 5},
]

CATEGORIES = [
    {
        "name": "Эмоции",
        "items": [
            ("Радость",     "😊"),
            ("Тревога",     "😰"),
            ("Злость",      "😠"),
            ("Грусть",      "😢"),
            ("Спокойствие", "😌"),
        ],
    },
    {
        "name": "Сон",
        "items": [
            ("Хороший сон",  "😴"),
            ("Плохой сон",   "🥱"),
            ("Бессонница",   "🌙"),
        ],
    },
    {
        "name": "Здоровье",
        "items": [
            ("Болею",       "🤒"),
            ("Всё хорошо",  "💪"),
            ("Головная боль", "🤕"),
            ("Устал",       "😩"),
        ],
    },
    {
        "name": "Хобби",
        "items": [
            ("Музыка",  "🎵"),
            ("Чтение",  "📚"),
            ("Игры",    "🎮"),
            ("Спорт",   "🏃"),
            ("Рисование","🎨"),
        ],
    },
    {
        "name": "Еда",
        "items": [
            ("Готовил",       "🍳"),
            ("Ел вкусно",     "😋"),
            ("Диета",         "🥗"),
            ("Фастфуд",       "🍔"),
        ],
    },
    {
        "name": "Работа по дому",
        "items": [
            ("Уборка",   "🧹"),
            ("Стирка",   "🧺"),
            ("Покупки",  "🛒"),
        ],
    },
    {
        "name": "Погода",
        "items": [
            ("Солнечно", "☀️"),
            ("Дождь",    "🌧️"),
            ("Облачно",  "☁️"),
            ("Снег",     "❄️"),
        ],
    },
    {
        "name": "Красота",
        "items": [
            ("Уход за собой", "💅"),
            ("Тренировка",    "🏋️"),
            ("Медитация",     "🧘"),
        ],
    },
    {
        "name": "Обучение",
        "items": [
            ("Курсы",    "💻"),
            ("Книга",    "📖"),
            ("Подкаст",  "🎧"),
        ],
    },
]


def seed():
    db = SessionLocal()
    try:
        # Настроения
        if not db.query(Mood).first():
            db.add_all([Mood(**m) for m in MOODS])
            db.commit()
            print(f"[OK] Добавлено {len(MOODS)} настроений")
        else:
            print("[--] Настроения уже есть, пропускаем")

        # Категории и элементы активностей
        if not db.query(ActivityCategory).first():
            for cat_data in CATEGORIES:
                cat = ActivityCategory(name=cat_data["name"])
                db.add(cat)
                db.flush()
                for label, emoji in cat_data["items"]:
                    db.add(ActivityItem(category_id=cat.id, user_id=None, label=label, emoji=emoji))
            db.commit()
            print(f"[OK] Добавлено {len(CATEGORIES)} категорий активностей")
        else:
            print("[--] Категории уже есть, пропускаем")

    finally:
        db.close()


if __name__ == "__main__":
    seed()

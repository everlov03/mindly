# Mindly 🧠

Дневник настроения и самонаблюдения — веб-сайт для ежедневного трекинга настроения, активностей, здоровья и личного дневника.

## Стек

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Python + FastAPI
- **БД:** PostgreSQL + SQLAlchemy + Alembic
- **Аутентификация:** JWT (python-jose)

## Быстрый старт

### Требования
- Node.js 18+, npm 9+
- Python 3.11+
- PostgreSQL 15+

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python -m app.seed
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Открыть: http://localhost:3000  
Swagger UI: http://localhost:8000/docs

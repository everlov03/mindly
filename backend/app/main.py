from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api import auth, users, moods, entries, activities, goals, stats
from app.core.config import settings

app = FastAPI(title="Mindly API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/v1")
app.include_router(users.router, prefix="/v1")
app.include_router(moods.router, prefix="/v1")
app.include_router(entries.router, prefix="/v1")
app.include_router(activities.router, prefix="/v1")
app.include_router(goals.router, prefix="/v1")
app.include_router(stats.router, prefix="/v1")

app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

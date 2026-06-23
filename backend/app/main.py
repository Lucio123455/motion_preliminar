from fastapi import FastAPI
from app.database import Base, engine
import app.models  # noqa: F401 — registers models with SQLAlchemy metadata
from app.routers import users, profile, routines, exercises, progress, body_measurements

app = FastAPI(title="GymTracker API", version="0.1.0")

app.include_router(users.router)
app.include_router(profile.router)
app.include_router(routines.router)
app.include_router(exercises.router)
app.include_router(progress.router)
app.include_router(body_measurements.router)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok"}

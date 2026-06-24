from app.database import SessionLocal, engine, Base
import app.models  # noqa: F401 — registra todos los modelos
from app.models.exercise import Exercise

EXERCISES = [
    ("Press de banca", "Pecho"),
    ("Sentadilla", "Piernas"),
    ("Peso muerto", "Espalda baja"),
    ("Dominadas", "Espalda"),
    ("Press militar", "Hombros"),
    ("Remo con barra", "Espalda"),
    ("Curl de bíceps", "Bíceps"),
    ("Extensión de tríceps", "Tríceps"),
    ("Zancadas", "Piernas"),
    ("Plancha", "Core"),
]

Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    if db.query(Exercise).count() == 0:
        for name, muscle in EXERCISES:
            db.add(Exercise(name=name, muscle_group=muscle))
        db.commit()
        print(f"Cargados {len(EXERCISES)} ejercicios.")
    else:
        print("La tabla ya tiene ejercicios, no se insertó nada.")
finally:
    db.close()

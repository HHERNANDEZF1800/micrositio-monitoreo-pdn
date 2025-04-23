from fastapi import FastAPI
from app.api.v1.endpoints import registros
from app.database import engine
from app.models.registro import RegistroEjecucion

RegistroEjecucion.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(registros.router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Bienvenido al API de Monitoreo PDN"}
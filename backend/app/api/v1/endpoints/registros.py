from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.models.registro import RegistroEjecucion
from app.schemas.registro import Registro, RegistroCreate
from app.database import SessionLocal

router = APIRouter()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/registros/", response_model=Registro)
def create_registro(registro: RegistroCreate, db: Session = Depends(get_db)):
    db_registro = RegistroEjecucion(**registro.model_dump())
    db.add(db_registro)
    db.commit()
    db.refresh(db_registro)
    return db_registro

@router.get("/registros/", response_model=List[Registro])
def read_registros(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    registros = db.query(RegistroEjecucion).offset(skip).limit(limit).all()
    return registros

@router.get("/registros/{registro_id}", response_model=Registro)
def read_registro(registro_id: int, db: Session = Depends(get_db)):
    registro = db.query(RegistroEjecucion).filter(RegistroEjecucion.id == registro_id).first()
    if registro is None:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return registro
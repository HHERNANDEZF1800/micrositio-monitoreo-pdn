from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from datetime import date

from app import crud
from app.api import deps
from app.schemas.schemas import (
    SistemaInDB, 
    SistemaCreate, 
    SistemaUpdate
)

router = APIRouter()

@router.get("/", response_model=List[SistemaInDB])
def read_sistemas(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100
) -> Any:
    """
    Recupera todos los sistemas.
    """
    sistemas = crud.sistema.get_multi(db, skip=skip, limit=limit)
    return sistemas

@router.post("/", response_model=SistemaInDB)
def create_sistema(
    *,
    db: Session = Depends(deps.get_db),
    sistema_in: SistemaCreate
) -> Any:
    """
    Crea un nuevo sistema.
    """
    sistema = crud.sistema.get_by_codigo(db, codigo=sistema_in.codigo)
    if sistema:
        raise HTTPException(
            status_code=400,
            detail=f"El sistema con código {sistema_in.codigo} ya existe en el sistema."
        )
    sistema = crud.sistema.create_with_id(db=db, obj_in=sistema_in)
    return sistema

@router.get("/{id}", response_model=SistemaInDB)
def read_sistema(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="ID del sistema a obtener")
) -> Any:
    """
    Obtiene un sistema por ID.
    """
    sistema = crud.sistema.get(db=db, id=id)
    if not sistema:
        raise HTTPException(
            status_code=404,
            detail="Sistema no encontrado"
        )
    return sistema

@router.put("/{id}", response_model=SistemaInDB)
def update_sistema(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="ID del sistema a actualizar"),
    sistema_in: SistemaUpdate
) -> Any:
    """
    Actualiza un sistema.
    """
    sistema = crud.sistema.get(db=db, id=id)
    if not sistema:
        raise HTTPException(
            status_code=404,
            detail="Sistema no encontrado"
        )
    
    # Si se está actualizando el código, verificar que no exista otro con ese código
    if sistema_in.codigo and sistema_in.codigo != sistema.codigo:
        existing = crud.sistema.get_by_codigo(db, codigo=sistema_in.codigo)
        if existing and existing.id != id:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe un sistema con el código {sistema_in.codigo}"
            )
    
    sistema = crud.sistema.update(db=db, db_obj=sistema, obj_in=sistema_in)
    return sistema

@router.delete("/{id}", response_model=SistemaInDB)
def delete_sistema(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="ID del sistema a eliminar")
) -> Any:
    """
    Elimina un sistema.
    """
    sistema = crud.sistema.get(db=db, id=id)
    if not sistema:
        raise HTTPException(
            status_code=404,
            detail="Sistema no encontrado"
        )
    
    try:
        sistema = crud.sistema.remove(db=db, id=id)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede eliminar el sistema porque tiene registros asociados"
        )
    
    return sistema

@router.get("/codigo/{codigo}", response_model=SistemaInDB)
def read_sistema_by_codigo(
    *,
    db: Session = Depends(deps.get_db),
    codigo: str = Path(..., title="Código del sistema a obtener")
) -> Any:
    """
    Obtiene un sistema por código.
    """
    sistema = crud.sistema.get_by_codigo(db=db, codigo=codigo)
    if not sistema:
        raise HTTPException(
            status_code=404,
            detail="Sistema no encontrado"
        )
    return sistema
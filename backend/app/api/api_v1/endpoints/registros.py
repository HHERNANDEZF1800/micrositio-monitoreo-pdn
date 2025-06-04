from typing import Any, List, Optional
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session

from app import crud
from app.api import deps
from app.schemas.schemas import (
    RegistroCreate,
    RegistroUpdate,
    RegistroInDB,
    PaginatedRegistros,
    RegistroWithSistema
)

router = APIRouter()

@router.get("/", response_model=PaginatedRegistros)
def read_registros(
    db: Session = Depends(deps.get_db),
    fecha_inicio: Optional[date] = Query(None, description="Fecha de inicio para filtrar (formato YYYY-MM-DD)"),
    fecha_fin: Optional[date] = Query(None, description="Fecha de fin para filtrar (formato YYYY-MM-DD)"),
    ente: Optional[str] = Query(None, description="Filtrar por nombre de ente"),
    sistema_origen: Optional[str] = Query(None, description="Filtrar por código de sistema"),
    estatus: Optional[str] = Query(None, description="Filtrar por estatus"),
    page: int = Query(1, ge=1, description="Número de página"),
    page_size: int = Query(10, ge=1, le=100, description="Tamaño de página")
) -> Any:
    """
    Recupera los registros de ejecución con paginación y filtros opcionales.
    """
    skip = (page - 1) * page_size
    
    registros, total = crud.registro.get_multi_paginated(
        db=db, 
        skip=skip, 
        limit=page_size,
        fecha_inicio=fecha_inicio,
        fecha_fin=fecha_fin,
        ente=ente,
        sistema_origen=sistema_origen,
        estatus=estatus
    )
    
    total_pages = (total + page_size - 1) // page_size  # Redondeo hacia arriba
    
    return {
        "total": total,
        "items": registros,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.post("/", response_model=RegistroInDB)
def create_registro(
    *,
    db: Session = Depends(deps.get_db),
    registro_in: RegistroCreate
) -> Any:
    """
    Crea un nuevo registro de ejecución.
    """
    # Verificar que exista el sistema
    sistema = crud.sistema.get_by_codigo(db, codigo=registro_in.sistema_origen)
    if not sistema:
        raise HTTPException(
            status_code=400,
            detail=f"El sistema con código {registro_in.sistema_origen} no existe"
        )
    
    registro = crud.registro.create(db=db, obj_in=registro_in)
    return registro

@router.get("/{id}", response_model=RegistroWithSistema)
def read_registro(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="ID del registro a obtener")
) -> Any:
    """
    Obtiene un registro por ID con información del sistema.
    """
    registro = crud.registro.get(db=db, id=id)
    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Registro no encontrado"
        )
    return registro

@router.put("/{id}", response_model=RegistroInDB)
def update_registro(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="ID del registro a actualizar"),
    registro_in: RegistroUpdate
) -> Any:
    """
    Actualiza un registro de ejecución.
    """
    registro = crud.registro.get(db=db, id=id)
    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Registro no encontrado"
        )
    
    # Si se está actualizando el sistema_origen, verificar que exista
    if registro_in.sistema_origen and registro_in.sistema_origen != registro.sistema_origen:
        sistema = crud.sistema.get_by_codigo(db, codigo=registro_in.sistema_origen)
        if not sistema:
            raise HTTPException(
                status_code=400,
                detail=f"El sistema con código {registro_in.sistema_origen} no existe"
            )
    
    registro = crud.registro.update(db=db, db_obj=registro, obj_in=registro_in)
    return registro

@router.delete("/{id}", response_model=RegistroInDB)
def delete_registro(
    *,
    db: Session = Depends(deps.get_db),
    id: int = Path(..., title="ID del registro a eliminar")
) -> Any:
    """
    Elimina un registro de ejecución.
    """
    registro = crud.registro.get(db=db, id=id)
    if not registro:
        raise HTTPException(
            status_code=404,
            detail="Registro no encontrado"
        )
    registro = crud.registro.remove(db=db, id=id)
    return registro

@router.get("/entes/", response_model=List[str])
def read_entes(
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Obtiene la lista de entes únicos en los registros.
    """
    return crud.registro.get_entes(db=db)

@router.get("/estatus/", response_model=List[str])
def read_estatus(
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Obtiene la lista de estatus únicos en los registros.
    """
    return crud.registro.get_estatus(db=db)

@router.get("/ultimos-por-sistema/", response_model=List[RegistroInDB])
def read_ultimos_por_sistema(
    db: Session = Depends(deps.get_db),
    limit: int = Query(5, ge=1, le=20, description="Número máximo de registros a retornar")
) -> Any:
    """
    Obtiene los últimos registros por sistema.
    """
    return crud.registro.get_ultimos_registros_por_sistema(db=db, limit=limit)
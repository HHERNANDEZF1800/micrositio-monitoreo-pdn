from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.schemas.schemas import (
    APIDistribucion, DisponibilidadAPI, ActualizacionRegistros, 
    EnteRanking, AlertaCritica, DashboardData
)
from app.crud import operations

# Crear el router para los endpoints del dashboard
router = APIRouter()


@router.get("/resumen", response_model=Dict[str, int])
async def obtener_resumen(db: AsyncSession = Depends(get_db)):
    """
    Obtiene los datos de resumen para las tarjetas iniciales del dashboard:
    - Entes conectados
    - APIs conectadas
    - Porcentaje de alta disponibilidad
    - Número de alertas críticas
    """
    try:
        entes_conectados = await operations.get_entes_conectados(db)
        apis_conectadas = await operations.get_apis_conectadas(db)
        alertas = await operations.obtener_alertas_criticas(db)
        alta_disponibilidad = await operations.calcular_porcentaje_alta_disponibilidad(db)
        
        return {
            "entes_conectados": entes_conectados,
            "apis_conectadas": apis_conectadas,
            "alta_disponibilidad": alta_disponibilidad,
            "alertas_criticas": len([a for a in alertas if a["nivel"] == "alta"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener datos de resumen: {str(e)}")


@router.get("/distribucion-apis", response_model=List[APIDistribucion])
async def obtener_distribucion_apis(db: AsyncSession = Depends(get_db)):
    """
    Obtiene la distribución de APIs por sistema para la gráfica de barras.
    """
    try:
        return await operations.get_distribucion_apis_por_sistema(db)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener distribución de APIs: {str(e)}"
        )


@router.get("/disponibilidad-apis", response_model=List[DisponibilidadAPI])
async def obtener_disponibilidad_apis(db: AsyncSession = Depends(get_db)):
    """
    Obtiene la disponibilidad de APIs para la gráfica de pastel.
    """
    try:
        return await operations.calcular_disponibilidad_apis(db)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener disponibilidad de APIs: {str(e)}"
        )


@router.get("/actualizacion-registros", response_model=List[ActualizacionRegistros])
async def obtener_actualizacion_registros(db: AsyncSession = Depends(get_db)):
    """
    Obtiene la actualización de registros para la gráfica de pastel.
    """
    try:
        return await operations.calcular_actualizacion_registros(db)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener actualización de registros: {str(e)}"
        )


@router.get("/ranking-entes", response_model=List[EnteRanking])
async def obtener_ranking_entes(
    limit: int = Query(8, description="Número máximo de entes a devolver"),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene el ranking de entes por desempeño.
    
    Args:
        limit: Número máximo de entes a devolver
    """
    try:
        return await operations.obtener_ranking_entes(db, limit)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener ranking de entes: {str(e)}"
        )


@router.get("/alertas-criticas", response_model=List[AlertaCritica])
async def obtener_alertas_criticas(db: AsyncSession = Depends(get_db)):
    """
    Obtiene las alertas críticas del sistema.
    """
    try:
        return await operations.obtener_alertas_criticas(db)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener alertas críticas: {str(e)}"
        )


@router.get("/dashboard-completo", response_model=DashboardData)
async def obtener_dashboard_completo(db: AsyncSession = Depends(get_db)):
    """
    Obtiene todos los datos necesarios para el dashboard en una sola llamada.
    Esto reduce el número de peticiones necesarias desde el frontend.
    """
    try:
        return await operations.obtener_datos_dashboard_completo(db)
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Error al obtener datos del dashboard: {str(e)}"
        )
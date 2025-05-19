from typing import List, Optional, Dict, Any
from datetime import date, time
from pydantic import BaseModel, Field


# Esquemas para CatalogoSistema
class SistemaBase(BaseModel):
    """Esquema base para sistema"""
    codigo: str
    nombre: str


class SistemaCreate(SistemaBase):
    """Esquema para crear un sistema"""
    id: int


class Sistema(SistemaBase):
    """Esquema para leer un sistema"""
    id: int
    
    class Config:
        orm_mode = True


# Esquemas para RegistroEjecucion
class RegistroEjecucionBase(BaseModel):
    """Esquema base para registro de ejecución"""
    fecha_ejecucion: date
    hora_ejecucion: time
    ente: str
    total_registros: str
    estatus: str
    sistema_origen: str


class RegistroEjecucionCreate(RegistroEjecucionBase):
    """Esquema para crear un registro de ejecución"""
    pass


class RegistroEjecucion(RegistroEjecucionBase):
    """Esquema para leer un registro de ejecución"""
    id: int
    
    class Config:
        orm_mode = True


# Esquemas para las respuestas de la API

class APIDistribucion(BaseModel):
    """Esquema para la distribución de APIs por sistema"""
    name: str
    value: int
    color: str


class DisponibilidadAPI(BaseModel):
    """Esquema para la disponibilidad de APIs"""
    name: str
    value: int
    color: str


class ActualizacionRegistros(BaseModel):
    """Esquema para la actualización de registros"""
    name: str
    value: int
    color: str


class EnteRanking(BaseModel):
    """Esquema para el ranking de entes"""
    name: str
    sistemas: int
    disponibilidad: float
    actualizacion: float


class AlertaCritica(BaseModel):
    """Esquema para las alertas críticas"""
    ente: str
    sistema: str
    alerta: str
    nivel: str


class DashboardData(BaseModel):
    """Esquema para todos los datos del dashboard"""
    entes_conectados: int = Field(..., description="Total de entes conectados")
    apis_conectadas: int = Field(..., description="Total de APIs conectadas")
    alta_disponibilidad: float = Field(..., description="Porcentaje de alta disponibilidad")
    alertas_criticas: int = Field(..., description="Número de alertas críticas")
    distribucion_apis: List[APIDistribucion] = Field(..., description="Distribución de APIs por sistema")
    disponibilidad_apis: List[DisponibilidadAPI] = Field(..., description="Disponibilidad de APIs")
    actualizacion_registros: List[ActualizacionRegistros] = Field(..., description="Actualización de registros")
    ranking_entes: List[EnteRanking] = Field(..., description="Ranking de entes por desempeño")
    alertas: List[AlertaCritica] = Field(..., description="Listado de alertas críticas")
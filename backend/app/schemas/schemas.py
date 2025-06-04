from datetime import date, time
from typing import Optional, List
from pydantic import BaseModel, Field

# Esquemas para Catálogo de Sistemas
class SistemaBase(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=30)
    nombre: str = Field(..., min_length=1, max_length=255)

class SistemaCreate(SistemaBase):
    id: int

class SistemaUpdate(SistemaBase):
    codigo: Optional[str] = Field(None, min_length=1, max_length=30)
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)

class SistemaInDB(SistemaBase):
    id: int
    
    class Config:
        from_attributes = True

# Esquemas para Registros de Ejecución
class RegistroBase(BaseModel):
    fecha_ejecucion: date
    hora_ejecucion: time
    ente: str = Field(..., min_length=1, max_length=100)
    total_registros: str = Field(..., min_length=1, max_length=30)
    estatus: str = Field(..., min_length=1, max_length=100)
    sistema_origen: str = Field(..., min_length=1, max_length=30)

class RegistroCreate(RegistroBase):
    pass

class RegistroUpdate(BaseModel):
    fecha_ejecucion: Optional[date] = None
    hora_ejecucion: Optional[time] = None
    ente: Optional[str] = Field(None, min_length=1, max_length=100)
    total_registros: Optional[str] = Field(None, min_length=1, max_length=30)
    estatus: Optional[str] = Field(None, min_length=1, max_length=100)
    sistema_origen: Optional[str] = Field(None, min_length=1, max_length=30)

class RegistroInDB(RegistroBase):
    id: int
    
    class Config:
        from_attributes = True

class RegistroWithSistema(RegistroInDB):
    sistema: SistemaInDB
    
    class Config:
        from_attributes = True

# Esquema para paginación
class PaginatedRegistros(BaseModel):
    total: int
    items: List[RegistroInDB]
    page: int
    page_size: int
    total_pages: int
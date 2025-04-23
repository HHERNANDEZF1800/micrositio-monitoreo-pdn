from datetime import date, time, datetime
from pydantic import BaseModel

class RegistroBase(BaseModel):
    sistema_origen: str
    fecha_ejecucion: date
    hora_ejecucion: time
    ente: str
    total_registros: int
    estatus: str

class RegistroCreate(RegistroBase):
    pass

class Registro(RegistroBase):
    id: int
    fecha_importacion: datetime

    class Config:
        from_attributes = True
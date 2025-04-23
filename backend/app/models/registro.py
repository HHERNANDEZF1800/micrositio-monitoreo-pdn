from sqlalchemy import Column, Integer, String, Date, Time, TIMESTAMP
from app.database import Base

class RegistroEjecucion(Base):
    __tablename__ = "registros_ejecucion"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    sistema_origen = Column(String(50), nullable=False)
    fecha_ejecucion = Column(Date, nullable=False)
    hora_ejecucion = Column(Time, nullable=False)
    ente = Column(String(100), nullable=False)
    total_registros = Column(Integer, nullable=False)
    estatus = Column(String(50), nullable=False)
    fecha_importacion = Column(TIMESTAMP, server_default='CURRENT_TIMESTAMP')
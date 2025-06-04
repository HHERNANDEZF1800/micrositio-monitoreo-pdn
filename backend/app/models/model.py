from sqlalchemy import Column, Integer, String, ForeignKey, Date, Time, Index
from sqlalchemy.orm import relationship

from app.db.database import Base

class CatalogoSistemas(Base):
    __tablename__ = "catalogo_sistemas"
    
    id = Column(Integer, primary_key=True)
    codigo = Column(String(30), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    
    # Relación con registros_ejecucion
    registros = relationship("RegistrosEjecucion", back_populates="sistema")

class RegistrosEjecucion(Base):
    __tablename__ = "registros_ejecucion"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha_ejecucion = Column(Date, nullable=False, index=True)
    hora_ejecucion = Column(Time, nullable=False)
    ente = Column(String(100), nullable=False, index=True)
    total_registros = Column(String(30), nullable=False)
    estatus = Column(String(100), nullable=False)
    sistema_origen = Column(String(30), ForeignKey("catalogo_sistemas.codigo", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False, index=True)
    
    # Relación con catalogo_sistemas
    sistema = relationship("CatalogoSistemas", back_populates="registros")
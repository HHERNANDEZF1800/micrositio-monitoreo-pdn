from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base

class CatalogoSistema(Base):
    """
    Modelo para la tabla catalogo_sistemas.
    Contiene la información de los sistemas de la PDN.
    """
    __tablename__ = "catalogo_sistemas"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(30), unique=True, nullable=False, index=True)
    nombre = Column(String(255), nullable=False)
    
    # Relación con registros_ejecucion
    registros = relationship("RegistroEjecucion", back_populates="sistema")
    
    def __repr__(self):
        return f"<Sistema {self.codigo}: {self.nombre}>"


class RegistroEjecucion(Base):
    """
    Modelo para la tabla registros_ejecucion.
    Contiene los registros de ejecución de los sistemas.
    """
    __tablename__ = "registros_ejecucion"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    fecha_ejecucion = Column(Date, nullable=False, index=True)
    hora_ejecucion = Column(Time, nullable=False)
    ente = Column(String(100), nullable=False, index=True)
    total_registros = Column(String(30), nullable=False)
    estatus = Column(String(100), nullable=False)
    sistema_origen = Column(String(30), ForeignKey("catalogo_sistemas.codigo"), nullable=False, index=True)
    
    # Definir relación con CatalogoSistema
    sistema = relationship("CatalogoSistema", back_populates="registros")
    
    # Índices adicionales (aunque ya se definieron en la tabla)
    __table_args__ = (
        Index('idx_fecha', fecha_ejecucion),
        Index('idx_ente', ente),
        Index('idx_sistema_origen', sistema_origen),
    )
    
    def __repr__(self):
        return f"<RegistroEjecucion {self.id}: {self.ente}, {self.sistema_origen}, {self.fecha_ejecucion}>"
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import settings

# URL de la base de datos (convertir a versión async si es necesario)
# Para SQLAlchemy 2.0+ con soporte async
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL.replace('mysql+pymysql', 'mysql+aiomysql')

# Motor de base de datos asíncrono
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True,  # Útil para depuración, pero mejor desactivarlo en producción
    pool_pre_ping=True  # Verificar conexión antes de usar
)

# Sesión asíncrona
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession
)

# Clase base para los modelos
Base = declarative_base()

# Función para obtener una sesión de la base de datos
async def get_db():
    """
    Dependencia para obtener una sesión de la base de datos.
    Se usa como dependencia en los endpoints de la API.
    """
    db = SessionLocal()
    try:
        yield db
        await db.commit()
    except Exception:
        await db.rollback()
        raise
    finally:
        await db.close()
from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

# Aquí puedes agregar dependencias comunes para los endpoints
# Por ejemplo, para verificar autenticación, permisos, etc.

# Ejemplo de una función de dependencia para verificar que un usuario esté autenticado
# (Para cuando implementes autenticación en el futuro)
async def get_current_user():
    """
    Dependencia para obtener el usuario actual.
    Esta es una implementación básica que se debe ampliar con un sistema real de autenticación.
    """
    # Implementar lógica de autenticación real aquí
    return {"username": "usuario_ejemplo"}

# Dependencia para obtener una sesión de base de datos
# (Ya se definió en database.py, pero podría extenderse aquí)
async def get_db_session() -> Generator[AsyncSession, None, None]:
    """
    Obtiene una sesión de base de datos para las operaciones.
    """
    async for db in get_db():
        yield db
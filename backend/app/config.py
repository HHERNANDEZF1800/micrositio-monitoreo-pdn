import os
from typing import List, Optional
from pydantic import AnyHttpUrl, BaseSettings
from dotenv import load_dotenv

# Cargar variables de entorno desde el archivo .env
load_dotenv()

class Settings(BaseSettings):
    """
    Configuraciones de la aplicación cargadas desde variables de entorno o valores predeterminados.
    """
    # Configuración de la API
    API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "Monitor PDN API")
    
    # Configuración de CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",  # React frontend por defecto
        "http://localhost:8080",  # Alternativa frontend
        "http://localhost:8000",  # Mismo servidor que el backend
    ]
    
    # Configuración de la base de datos
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "3306")
    DB_USER: str = os.getenv("DB_USER", "registros_user")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password_segura")
    DB_NAME: str = os.getenv("DB_NAME", "monitoreo_pdn")
    
    # Construir la URL de conexión a la base de datos
    DATABASE_URL: str = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    class Config:
        case_sensitive = True


# Instancia de configuración para usar en toda la aplicación
settings = Settings()
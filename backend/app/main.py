import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.api import api_router
from app.config import settings

# Crear la aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API para el Monitor de Conectividad y Actualización de la Plataforma Digital Nacional",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configurar CORS
allowed_origins = [str(origin) for origin in settings.BACKEND_CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir los routers de la API v1
app.include_router(api_router, prefix=settings.API_V1_STR)


# Middleware para medir el tiempo de respuesta
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Middleware para medir el tiempo de procesamiento de cada solicitud.
    Añade una cabecera X-Process-Time con el tiempo en segundos.
    """
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Manejador de excepciones global
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Manejador global de excepciones para proporcionar respuestas de error consistentes.
    """
    return JSONResponse(
        status_code=500,
        content={"message": f"Error interno del servidor: {str(exc)}"},
    )


# Ruta de inicio
@app.get("/", tags=["status"])
async def root():
    """
    Ruta principal para verificar que la API está funcionando.
    """
    return {
        "message": "API del Monitor de Conectividad y Actualización de la PDN",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


# Ruta de estado de salud (health check)
@app.get("/health", tags=["status"])
async def health_check():
    """
    Endpoint para verificar el estado de salud de la API.
    Útil para monitoreo y comprobaciones de disponibilidad.
    """
    return {
        "status": "healthy",
        "timestamp": time.time(),
    }


if __name__ == "__main__":
    # Para ejecutar con uvicorn directamente desde este archivo
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
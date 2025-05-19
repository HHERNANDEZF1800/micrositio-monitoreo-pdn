from fastapi import APIRouter

from app.api.v1.endpoints import dashboard

# Crear el router principal para la API v1
api_router = APIRouter()

# Incluir los routers de los diferentes endpoints
api_router.include_router(
    dashboard.router, 
    prefix="/dashboard", 
    tags=["dashboard"]
)

# Aquí puedes agregar más routers para otros endpoints
# Ejemplo:
# api_router.include_router(
#     sistemas.router,
#     prefix="/sistemas",
#     tags=["sistemas"]
# )
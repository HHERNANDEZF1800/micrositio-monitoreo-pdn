from fastapi import APIRouter

from app.api.api_v1.endpoints import registros, sistemas

api_router = APIRouter()
api_router.include_router(registros.router, prefix="/registros", tags=["registros"])
api_router.include_router(sistemas.router, prefix="/sistemas", tags=["sistemas"])
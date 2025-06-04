from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, and_, or_

from app.crud.crud_base import CRUDBase
from app.models.models import CatalogoSistemas
from app.schemas.schemas import SistemaCreate, SistemaUpdate

class CRUDSistema(CRUDBase[CatalogoSistemas, SistemaCreate, SistemaUpdate]):
    def get_by_codigo(self, db: Session, codigo: str) -> Optional[CatalogoSistemas]:
        return db.query(CatalogoSistemas).filter(CatalogoSistemas.codigo == codigo).first()

    def create_with_id(self, db: Session, *, obj_in: SistemaCreate) -> CatalogoSistemas:
        db_obj = CatalogoSistemas(
            id=obj_in.id,
            codigo=obj_in.codigo,
            nombre=obj_in.nombre
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

sistema = CRUDSistema(CatalogoSistemas)
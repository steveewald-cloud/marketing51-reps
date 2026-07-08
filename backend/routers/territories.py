from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from backend.database import get_db
from backend import models

router = APIRouter()


class TerritoryCreate(BaseModel):
    name: str
    region: Optional[str] = None
    state: Optional[str] = None
    zip_codes: Optional[List[str]] = []


class AssignRep(BaseModel):
    rep_id: int


@router.get("/")
def list_territories(db: Session = Depends(get_db)):
    return db.query(models.Territory).all()


@router.get("/{territory_id}")
def get_territory(territory_id: int, db: Session = Depends(get_db)):
    t = db.query(models.Territory).filter(models.Territory.id == territory_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Territory not found")
    return t


@router.post("/")
def create_territory(territory: TerritoryCreate, db: Session = Depends(get_db)):
    db_t = models.Territory(**territory.model_dump())
    db.add(db_t)
    db.commit()
    db.refresh(db_t)
    return db_t


@router.post("/{territory_id}/assign")
def assign_rep(territory_id: int, body: AssignRep, db: Session = Depends(get_db)):
    assignment = models.RepTerritory(rep_id=body.rep_id, territory_id=territory_id)
    db.add(assignment)
    db.commit()
    return {"ok": True}


@router.delete("/{territory_id}")
def delete_territory(territory_id: int, db: Session = Depends(get_db)):
    t = db.query(models.Territory).filter(models.Territory.id == territory_id).first()
    if not t:
        raise HTTPException(status_code=404, detail="Territory not found")
    db.delete(t)
    db.commit()
    return {"ok": True}

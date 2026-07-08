from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from backend.database import get_db
from backend import models

router = APIRouter()


class RepCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    role: str = "rep"
    status: str = "active"
    hired_date: Optional[date] = None


class RepUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    hired_date: Optional[date] = None


@router.get("/")
def list_reps(db: Session = Depends(get_db)):
    return db.query(models.Rep).all()


@router.get("/{rep_id}")
def get_rep(rep_id: int, db: Session = Depends(get_db)):
    rep = db.query(models.Rep).filter(models.Rep.id == rep_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Rep not found")
    return rep


@router.post("/")
def create_rep(rep: RepCreate, db: Session = Depends(get_db)):
    db_rep = models.Rep(**rep.model_dump())
    db.add(db_rep)
    db.commit()
    db.refresh(db_rep)
    return db_rep


@router.patch("/{rep_id}")
def update_rep(rep_id: int, rep: RepUpdate, db: Session = Depends(get_db)):
    db_rep = db.query(models.Rep).filter(models.Rep.id == rep_id).first()
    if not db_rep:
        raise HTTPException(status_code=404, detail="Rep not found")
    for field, value in rep.model_dump(exclude_unset=True).items():
        setattr(db_rep, field, value)
    db.commit()
    db.refresh(db_rep)
    return db_rep


@router.delete("/{rep_id}")
def delete_rep(rep_id: int, db: Session = Depends(get_db)):
    db_rep = db.query(models.Rep).filter(models.Rep.id == rep_id).first()
    if not db_rep:
        raise HTTPException(status_code=404, detail="Rep not found")
    db.delete(db_rep)
    db.commit()
    return {"ok": True}

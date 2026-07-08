from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal
from backend.database import get_db
from backend import models

router = APIRouter()


class PeriodCreate(BaseModel):
    label: str
    start_date: date
    end_date: date


class QuotaCreate(BaseModel):
    rep_id: int
    period_id: int
    quota_amount: Decimal


@router.get("/periods")
def list_periods(db: Session = Depends(get_db)):
    return db.query(models.QuotaPeriod).all()


@router.post("/periods")
def create_period(period: PeriodCreate, db: Session = Depends(get_db)):
    db_p = models.QuotaPeriod(**period.model_dump())
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p


@router.get("/")
def list_quotas(db: Session = Depends(get_db)):
    return db.query(models.Quota).all()


@router.post("/")
def create_quota(quota: QuotaCreate, db: Session = Depends(get_db)):
    db_q = models.Quota(**quota.model_dump())
    db.add(db_q)
    db.commit()
    db.refresh(db_q)
    return db_q


@router.delete("/{quota_id}")
def delete_quota(quota_id: int, db: Session = Depends(get_db)):
    q = db.query(models.Quota).filter(models.Quota.id == quota_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quota not found")
    db.delete(q)
    db.commit()
    return {"ok": True}

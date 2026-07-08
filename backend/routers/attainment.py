from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from decimal import Decimal
from backend.database import get_db
from backend import models

router = APIRouter()


class AttainmentCreate(BaseModel):
    rep_id: int
    period_id: int
    amount: Decimal


@router.get("/")
def list_attainment(db: Session = Depends(get_db)):
    return db.query(models.Attainment).all()


@router.post("/")
def log_attainment(entry: AttainmentCreate, db: Session = Depends(get_db)):
    db_a = models.Attainment(**entry.model_dump())
    db.add(db_a)
    db.commit()
    db.refresh(db_a)
    return db_a


@router.get("/summary/{period_id}")
def attainment_summary(period_id: int, db: Session = Depends(get_db)):
    results = []
    reps = db.query(models.Rep).filter(models.Rep.status == "active").all()
    for rep in reps:
        quota = db.query(models.Quota).filter(
            models.Quota.rep_id == rep.id,
            models.Quota.period_id == period_id
        ).first()

        total_attainment = db.query(func.sum(models.Attainment.amount)).filter(
            models.Attainment.rep_id == rep.id,
            models.Attainment.period_id == period_id
        ).scalar() or Decimal("0")

        quota_amount = quota.quota_amount if quota else Decimal("0")
        attainment_pct = (
            float(total_attainment) / float(quota_amount) * 100
            if quota_amount > 0 else 0
        )

        # Calculate payout
        payout = Decimal("0")
        rep_plan = db.query(models.RepCompPlan).filter(
            models.RepCompPlan.rep_id == rep.id
        ).first()
        if rep_plan and quota_amount > 0:
            plan = rep_plan.comp_plan
            if float(total_attainment) / float(quota_amount) >= float(plan.accelerator_threshold):
                payout = total_attainment * plan.accelerator_rate
            else:
                payout = total_attainment * plan.base_rate

        results.append({
            "rep_id": rep.id,
            "rep_name": rep.name,
            "quota": float(quota_amount),
            "attainment": float(total_attainment),
            "attainment_pct": round(attainment_pct, 1),
            "payout": float(payout),
        })
    return results

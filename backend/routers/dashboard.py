from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from backend.database import get_db
from backend import models

router = APIRouter()


@router.get("/summary")
def dashboard_summary(db: Session = Depends(get_db)):
    total_reps = db.query(func.count(models.Rep.id)).filter(models.Rep.status == "active").scalar()
    total_territories = db.query(func.count(models.Territory.id)).scalar()
    total_periods = db.query(func.count(models.QuotaPeriod.id)).scalar()

    total_quota = db.query(func.sum(models.Quota.quota_amount)).scalar() or Decimal("0")
    total_attainment = db.query(func.sum(models.Attainment.amount)).scalar() or Decimal("0")

    attainment_pct = (
        float(total_attainment) / float(total_quota) * 100
        if total_quota > 0 else 0
    )

    return {
        "active_reps": total_reps,
        "total_territories": total_territories,
        "quota_periods": total_periods,
        "total_quota": float(total_quota),
        "total_attainment": float(total_attainment),
        "overall_attainment_pct": round(attainment_pct, 1),
    }

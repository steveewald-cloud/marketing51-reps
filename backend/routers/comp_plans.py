from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal
from backend.database import get_db
from backend import models

router = APIRouter()


class CompPlanCreate(BaseModel):
    name: str
    description: Optional[str] = None
    base_rate: Decimal
    accelerator_threshold: Decimal = Decimal("1.0")
    accelerator_rate: Decimal = Decimal("0.08")


class AssignPlan(BaseModel):
    rep_id: int
    comp_plan_id: int


@router.get("/")
def list_plans(db: Session = Depends(get_db)):
    return db.query(models.CompPlan).all()


@router.post("/")
def create_plan(plan: CompPlanCreate, db: Session = Depends(get_db)):
    db_p = models.CompPlan(**plan.model_dump())
    db.add(db_p)
    db.commit()
    db.refresh(db_p)
    return db_p


@router.post("/assign")
def assign_plan(body: AssignPlan, db: Session = Depends(get_db)):
    assignment = models.RepCompPlan(rep_id=body.rep_id, comp_plan_id=body.comp_plan_id)
    db.add(assignment)
    db.commit()
    return {"ok": True}


@router.delete("/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    p = db.query(models.CompPlan).filter(models.CompPlan.id == plan_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(p)
    db.commit()
    return {"ok": True}

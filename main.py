"""
main.py
Marketing51 Rep Commission Engine — FastAPI entrypoint
GLORi Technologies — g to G
"""

from contextlib import asynccontextmanager
from decimal import Decimal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

import db
from commission_engine import calc_commission, calc_payout_batch, get_tier


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.init_db()
    yield


app = FastAPI(
    title="Marketing51 Commission Engine",
    description="GLORi Technologies — Rep commission tracking and payout engine.",
    version="1.0.0",
    lifespan=lifespan,
)


# ── Schemas ──────────────────────────────────────────────────────────────────

class RepIn(BaseModel):
    rep_id: str
    name: str
    email: Optional[str] = None
    upline_id: Optional[str] = None


class SaleIn(BaseModel):
    rep_id: str
    sale_amount: float = Field(gt=0)
    override_on: Optional[float] = Field(default=None, gt=0)


class BatchSaleIn(BaseModel):
    records: list[SaleIn]


class MarkPaidIn(BaseModel):
    commission_ids: list[int]


# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "marketing51-commission-engine"}


@app.post("/reps", status_code=201)
def create_rep(body: RepIn):
    row_id = db.upsert_rep(body.rep_id, body.name, body.email, body.upline_id)
    return {"id": row_id, "rep_id": body.rep_id}


@app.get("/reps/{rep_id}")
def rep_summary(rep_id: str):
    data = db.get_rep_summary(rep_id)
    if not data:
        raise HTTPException(404, detail=f"Rep {rep_id!r} not found")
    data["current_tier"] = get_tier(Decimal(str(data["ytd_sales"])))
    return data


@app.post("/commissions/calculate")
def calculate(body: SaleIn):
    summary = db.get_rep_summary(body.rep_id)
    if not summary:
        raise HTTPException(404, detail=f"Rep {body.rep_id!r} not found")
    result = calc_commission(
        sale_amount=Decimal(str(body.sale_amount)),
        ytd_sales=Decimal(str(summary["ytd_sales"])),
        override_on=Decimal(str(body.override_on)) if body.override_on else None,
    )
    result["rep_id"] = body.rep_id
    commission_id = db.record_commission(result)
    result["commission_id"] = commission_id
    return result


@app.post("/commissions/batch")
def batch_calculate(body: BatchSaleIn):
    results = []
    for sale in body.records:
        summary = db.get_rep_summary(sale.rep_id)
        if not summary:
            results.append({"rep_id": sale.rep_id, "error": "not found"})
            continue
        result = calc_commission(
            sale_amount=Decimal(str(sale.sale_amount)),
            ytd_sales=Decimal(str(summary["ytd_sales"])),
            override_on=Decimal(str(sale.override_on)) if sale.override_on else None,
        )
        result["rep_id"] = sale.rep_id
        result["commission_id"] = db.record_commission(result)
        results.append(result)
    return {"results": results}


@app.get("/commissions/unpaid")
def unpaid_all():
    return {"commissions": db.list_unpaid()}


@app.get("/commissions/unpaid/{rep_id}")
def unpaid_rep(rep_id: str):
    return {"commissions": db.list_unpaid(rep_id)}


@app.post("/commissions/mark-paid")
def mark_paid(body: MarkPaidIn):
    db.mark_paid(body.commission_ids)
    return {"marked_paid": len(body.commission_ids)}

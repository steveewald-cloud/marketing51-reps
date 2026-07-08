"""
commission_engine.py
Marketing51 Rep Commission Engine
GLORi Technologies — g to G
"""

from decimal import Decimal, ROUND_HALF_UP
from datetime import date
from typing import Optional


TIER_RATES = {
    "bronze": Decimal("0.05"),
    "silver": Decimal("0.08"),
    "gold":   Decimal("0.12"),
    "elite":  Decimal("0.15"),
}

OVERRIDE_RATE = Decimal("0.02")   # upline override on downline sales


def get_tier(ytd_sales: Decimal) -> str:
    if ytd_sales >= Decimal("250000"):
        return "elite"
    if ytd_sales >= Decimal("100000"):
        return "gold"
    if ytd_sales >= Decimal("40000"):
        return "silver"
    return "bronze"


def calc_commission(
    sale_amount: Decimal,
    ytd_sales: Decimal,
    override_on: Optional[Decimal] = None,
) -> dict:
    """
    Returns commission breakdown for a single sale.
    override_on: downline sale amount this rep earns an override on (optional).
    """
    tier = get_tier(ytd_sales)
    rate = TIER_RATES[tier]
    personal = (sale_amount * rate).quantize(Decimal("0.01"), ROUND_HALF_UP)

    override = Decimal("0.00")
    if override_on is not None:
        override = (override_on * OVERRIDE_RATE).quantize(Decimal("0.01"), ROUND_HALF_UP)

    return {
        "tier": tier,
        "rate": float(rate),
        "sale_amount": float(sale_amount),
        "personal_commission": float(personal),
        "override_commission": float(override),
        "total_commission": float(personal + override),
        "calculated_on": date.today().isoformat(),
    }


def calc_payout_batch(sales_records: list[dict]) -> list[dict]:
    """
    Process a batch of sales records.
    Each record: {rep_id, sale_amount, ytd_sales, override_on (optional)}
    """
    results = []
    for rec in sales_records:
        result = calc_commission(
            sale_amount=Decimal(str(rec["sale_amount"])),
            ytd_sales=Decimal(str(rec["ytd_sales"])),
            override_on=Decimal(str(rec["override_on"])) if rec.get("override_on") else None,
        )
        result["rep_id"] = rec["rep_id"]
        results.append(result)
    return results

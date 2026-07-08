"""
db.py
Neon PostgreSQL persistence layer
Marketing51 Rep Commission Engine — GLORi Technologies
"""

import os
import psycopg2
import psycopg2.extras
from contextlib import contextmanager

DATABASE_URL = os.environ["DATABASE_URL"]


@contextmanager
def get_conn():
    conn = psycopg2.connect(DATABASE_URL, sslmode="require")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS reps (
                    id          SERIAL PRIMARY KEY,
                    rep_id      TEXT UNIQUE NOT NULL,
                    name        TEXT NOT NULL,
                    email       TEXT,
                    upline_id   TEXT REFERENCES reps(rep_id),
                    ytd_sales   NUMERIC(14,2) DEFAULT 0,
                    created_at  TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS commissions (
                    id                  SERIAL PRIMARY KEY,
                    rep_id              TEXT NOT NULL REFERENCES reps(rep_id),
                    sale_amount         NUMERIC(14,2) NOT NULL,
                    tier                TEXT NOT NULL,
                    rate                NUMERIC(6,4) NOT NULL,
                    personal_commission NUMERIC(14,2) NOT NULL,
                    override_commission NUMERIC(14,2) DEFAULT 0,
                    total_commission    NUMERIC(14,2) NOT NULL,
                    calculated_on       DATE NOT NULL,
                    paid                BOOLEAN DEFAULT FALSE,
                    created_at          TIMESTAMPTZ DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS idx_commissions_rep_id
                    ON commissions(rep_id);
                CREATE INDEX IF NOT EXISTS idx_commissions_paid
                    ON commissions(paid);
            """)


def upsert_rep(rep_id: str, name: str, email: str = None, upline_id: str = None):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO reps (rep_id, name, email, upline_id)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (rep_id) DO UPDATE
                    SET name = EXCLUDED.name,
                        email = EXCLUDED.email,
                        upline_id = EXCLUDED.upline_id
                RETURNING id
            """, (rep_id, name, email, upline_id))
            return cur.fetchone()[0]


def record_commission(result: dict):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO commissions
                    (rep_id, sale_amount, tier, rate,
                     personal_commission, override_commission,
                     total_commission, calculated_on)
                VALUES (%(rep_id)s, %(sale_amount)s, %(tier)s, %(rate)s,
                        %(personal_commission)s, %(override_commission)s,
                        %(total_commission)s, %(calculated_on)s)
                RETURNING id
            """, result)
            row_id = cur.fetchone()[0]

            cur.execute("""
                UPDATE reps SET ytd_sales = ytd_sales + %s
                WHERE rep_id = %s
            """, (result["sale_amount"], result["rep_id"]))

            return row_id


def get_rep_summary(rep_id: str) -> dict:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute("""
                SELECT r.rep_id, r.name, r.email, r.upline_id, r.ytd_sales,
                       COALESCE(SUM(c.total_commission), 0) AS total_earned,
                       COALESCE(SUM(c.total_commission) FILTER (WHERE NOT c.paid), 0) AS unpaid
                FROM reps r
                LEFT JOIN commissions c ON c.rep_id = r.rep_id
                WHERE r.rep_id = %s
                GROUP BY r.rep_id, r.name, r.email, r.upline_id, r.ytd_sales
            """, (rep_id,))
            row = cur.fetchone()
            return dict(row) if row else {}


def list_unpaid(rep_id: str = None) -> list:
    with get_conn() as conn:
        with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            if rep_id:
                cur.execute("""
                    SELECT * FROM commissions
                    WHERE paid = FALSE AND rep_id = %s
                    ORDER BY created_at
                """, (rep_id,))
            else:
                cur.execute("""
                    SELECT * FROM commissions
                    WHERE paid = FALSE
                    ORDER BY rep_id, created_at
                """)
            return [dict(r) for r in cur.fetchall()]


def mark_paid(commission_ids: list[int]):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE commissions SET paid = TRUE
                WHERE id = ANY(%s)
            """, (commission_ids,))

from sqlalchemy import Column, Integer, String, Numeric, Date, DateTime, ForeignKey, ARRAY, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.database import Base


class Rep(Base):
    __tablename__ = "reps"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    role = Column(String, default="rep")
    status = Column(String, default="active")
    hired_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    territories = relationship("RepTerritory", back_populates="rep")
    quotas = relationship("Quota", back_populates="rep")
    attainments = relationship("Attainment", back_populates="rep")
    comp_plans = relationship("RepCompPlan", back_populates="rep")


class Territory(Base):
    __tablename__ = "territories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    region = Column(String)
    state = Column(String)
    zip_codes = Column(ARRAY(Text))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reps = relationship("RepTerritory", back_populates="territory")


class RepTerritory(Base):
    __tablename__ = "rep_territories"
    id = Column(Integer, primary_key=True, index=True)
    rep_id = Column(Integer, ForeignKey("reps.id", ondelete="CASCADE"))
    territory_id = Column(Integer, ForeignKey("territories.id", ondelete="CASCADE"))
    assigned_date = Column(Date, server_default=func.current_date())

    rep = relationship("Rep", back_populates="territories")
    territory = relationship("Territory", back_populates="reps")


class QuotaPeriod(Base):
    __tablename__ = "quota_periods"
    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)

    quotas = relationship("Quota", back_populates="period")
    attainments = relationship("Attainment", back_populates="period")


class Quota(Base):
    __tablename__ = "quotas"
    id = Column(Integer, primary_key=True, index=True)
    rep_id = Column(Integer, ForeignKey("reps.id", ondelete="CASCADE"))
    period_id = Column(Integer, ForeignKey("quota_periods.id", ondelete="CASCADE"))
    quota_amount = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    rep = relationship("Rep", back_populates="quotas")
    period = relationship("QuotaPeriod", back_populates="quotas")


class Attainment(Base):
    __tablename__ = "attainment"
    id = Column(Integer, primary_key=True, index=True)
    rep_id = Column(Integer, ForeignKey("reps.id", ondelete="CASCADE"))
    period_id = Column(Integer, ForeignKey("quota_periods.id", ondelete="CASCADE"))
    amount = Column(Numeric(12, 2), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())

    rep = relationship("Rep", back_populates="attainments")
    period = relationship("QuotaPeriod", back_populates="attainments")


class CompPlan(Base):
    __tablename__ = "comp_plans"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    base_rate = Column(Numeric(5, 4), nullable=False)
    accelerator_threshold = Column(Numeric(5, 4), default=1.0)
    accelerator_rate = Column(Numeric(5, 4), default=0.08)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reps = relationship("RepCompPlan", back_populates="comp_plan")


class RepCompPlan(Base):
    __tablename__ = "rep_comp_plans"
    id = Column(Integer, primary_key=True, index=True)
    rep_id = Column(Integer, ForeignKey("reps.id", ondelete="CASCADE"))
    comp_plan_id = Column(Integer, ForeignKey("comp_plans.id", ondelete="CASCADE"))
    effective_date = Column(Date, server_default=func.current_date())

    rep = relationship("Rep", back_populates="comp_plans")
    comp_plan = relationship("CompPlan", back_populates="reps")

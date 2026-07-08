-- Reps
CREATE TABLE IF NOT EXISTS reps (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'rep', -- rep | leader
    status TEXT NOT NULL DEFAULT 'active', -- active | inactive
    hired_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Territories / Geographies
CREATE TABLE IF NOT EXISTS territories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    region TEXT,
    state TEXT,
    zip_codes TEXT[], -- array of zip codes
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rep Territory Assignments
CREATE TABLE IF NOT EXISTS rep_territories (
    id SERIAL PRIMARY KEY,
    rep_id INT REFERENCES reps(id) ON DELETE CASCADE,
    territory_id INT REFERENCES territories(id) ON DELETE CASCADE,
    assigned_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(rep_id, territory_id)
);

-- Quota Periods
CREATE TABLE IF NOT EXISTS quota_periods (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- Quota Assignments
CREATE TABLE IF NOT EXISTS quotas (
    id SERIAL PRIMARY KEY,
    rep_id INT REFERENCES reps(id) ON DELETE CASCADE,
    period_id INT REFERENCES quota_periods(id) ON DELETE CASCADE,
    quota_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rep_id, period_id)
);

-- Attainment (actual sales/revenue logged)
CREATE TABLE IF NOT EXISTS attainment (
    id SERIAL PRIMARY KEY,
    rep_id INT REFERENCES reps(id) ON DELETE CASCADE,
    period_id INT REFERENCES quota_periods(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compensation Plans
CREATE TABLE IF NOT EXISTS comp_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    base_rate NUMERIC(5,4) NOT NULL,
    accelerator_threshold NUMERIC(5,4) DEFAULT 1.0,
    accelerator_rate NUMERIC(5,4) DEFAULT 0.08,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rep Comp Plan Assignments
CREATE TABLE IF NOT EXISTS rep_comp_plans (
    id SERIAL PRIMARY KEY,
    rep_id INT REFERENCES reps(id) ON DELETE CASCADE,
    comp_plan_id INT REFERENCES comp_plans(id) ON DELETE CASCADE,
    effective_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(rep_id, comp_plan_id)
);

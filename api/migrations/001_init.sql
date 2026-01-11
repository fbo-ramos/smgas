-- Schema for SMGAS indicators

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS directorates (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS kpis (
  id SERIAL PRIMARY KEY,
  directorate_id INT NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  unit TEXT NOT NULL,
  polarity TEXT NOT NULL,
  suggested BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS targets (
  id SERIAL PRIMARY KEY,
  kpi_id INT NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  year INT NOT NULL,
  annual_target NUMERIC NOT NULL DEFAULT 0,
  monthly_targets NUMERIC[] DEFAULT ARRAY[]::NUMERIC[]
);

CREATE UNIQUE INDEX IF NOT EXISTS targets_kpi_year_idx ON targets(kpi_id, year);

CREATE TABLE IF NOT EXISTS period_entries (
  id SERIAL PRIMARY KEY,
  kpi_id INT NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,
  year INT NOT NULL,
  month INT NOT NULL,
  value NUMERIC NOT NULL,
  notes TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (kpi_id, year, month)
);

CREATE TABLE IF NOT EXISTS user_directorates (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  directorate_id INT NOT NULL REFERENCES directorates(id) ON DELETE CASCADE,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, directorate_id)
);

CREATE TABLE IF NOT EXISTS user_refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_period_entries_kpi_year_month ON period_entries(kpi_id, year, month);

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";

create table if not exists users (
    id SERIAL PRIMARY KEY,
    email text unique not null,
    password_hash text NOT NULL,
    name text,
    roles text[] default '{}',
    token_version integer DEFAULT 1,
    created_at timestamptz not null default now()
);

create table if not exists leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326),
    place_id TEXT UNIQUE,
    sector TEXT NOT NULL,
    campaign_id UUID,
    status TEXT NOT NULL DEFAULT 'pendiente' 
        CHECK (status IN ('pendiente', 'visitado', 'reprogramado', 'cancelado')),
    priority INTEGER DEFAULT 3 
        CHECK (priority BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para la tabla leads
CREATE INDEX IF NOT EXISTS idx_leads_location ON leads USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_leads_sector ON leads (sector);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_campaign_id ON leads (campaign_id);

-- Función y trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

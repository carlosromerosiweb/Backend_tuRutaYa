-- Crear la tabla visit_checkins
CREATE TABLE IF NOT EXISTS visit_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    route_id UUID REFERENCES assigned_routes(id) ON DELETE SET NULL,
    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL CHECK (status IN ('realizada', 'cancelada', 'no estaba')),
    notes TEXT,
    lat FLOAT,
    lng FLOAT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON visit_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_lead_id ON visit_checkins(lead_id);
CREATE INDEX IF NOT EXISTS idx_checkins_route_id ON visit_checkins(route_id);
CREATE INDEX IF NOT EXISTS idx_checkins_checked_in_at ON visit_checkins(checked_in_at DESC);

-- Configurar RLS (Row Level Security)
ALTER TABLE visit_checkins ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Allow authenticated users to read checkins"
    ON visit_checkins
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow users to create their own checkins"
    ON visit_checkins
    FOR INSERT
    TO authenticated
    WITH CHECK ((auth.uid())::text::integer = user_id);

CREATE POLICY "Allow users to update their own checkins"
    ON visit_checkins
    FOR UPDATE
    TO authenticated
    USING ((auth.uid())::text::integer = user_id); 
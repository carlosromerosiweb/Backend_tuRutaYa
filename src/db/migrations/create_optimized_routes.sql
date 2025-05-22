-- Crear la tabla optimized_routes
CREATE TABLE IF NOT EXISTS optimized_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    transport_mode TEXT NOT NULL CHECK (transport_mode IN ('driving', 'walking')),
    total_distance_km DECIMAL(10,2) NOT NULL,
    total_duration_min INTEGER NOT NULL,
    waypoint_order INTEGER[] NOT NULL,
    ordered_leads JSONB NOT NULL,
    segments JSONB NOT NULL,
    polyline TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_optimized_routes_team_id ON optimized_routes(team_id);
CREATE INDEX IF NOT EXISTS idx_optimized_routes_created_at ON optimized_routes(created_at);

-- Crear función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_optimized_routes_updated_at
    BEFORE UPDATE ON optimized_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
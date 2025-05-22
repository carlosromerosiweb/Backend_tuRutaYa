-- Crear la función para actualizar updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear la tabla assigned_routes
CREATE TABLE IF NOT EXISTS assigned_routes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL,
    leads JSONB NOT NULL,
    total_duration_min INTEGER NOT NULL,
    total_distance_km DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_assigned_routes_user_id ON assigned_routes(user_id);
CREATE INDEX IF NOT EXISTS idx_assigned_routes_team_id ON assigned_routes(team_id);
CREATE INDEX IF NOT EXISTS idx_assigned_routes_assigned_date ON assigned_routes(assigned_date);

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_assigned_routes_updated_at ON assigned_routes;
CREATE TRIGGER update_assigned_routes_updated_at
    BEFORE UPDATE ON assigned_routes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 
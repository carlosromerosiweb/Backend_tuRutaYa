-- Función para crear la tabla users
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Crear la tabla users
    CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        name TEXT,
        roles TEXT[] DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Crear un índice para búsquedas por email
    CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

    -- Configurar RLS (Row Level Security)
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;

    -- Crear una política que permita acceso de lectura a todos los usuarios autenticados
    CREATE POLICY IF NOT EXISTS "Allow authenticated users to read users"
        ON users
        FOR SELECT
        TO authenticated
        USING (true);

    -- Crear una política que permita a los usuarios modificar solo sus propios registros
    CREATE POLICY IF NOT EXISTS "Users can update their own records"
        ON users
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = id);
END;
$$; 
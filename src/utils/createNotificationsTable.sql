-- Crear la tabla notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_notification_target CHECK (
        (user_id IS NOT NULL AND team_id IS NULL) OR
        (user_id IS NULL AND team_id IS NOT NULL)
    )
);

-- Crear índices para optimizar las consultas
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_team_id ON notifications(team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Configurar RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Allow users to read their own notifications"
    ON notifications
    FOR SELECT
    TO authenticated
    USING (
        (auth.uid())::text::integer = user_id OR
        team_id IN (
            SELECT team_id 
            FROM team_members 
            WHERE user_id = (auth.uid())::text::integer
        )
    );

CREATE POLICY "Allow system to create notifications"
    ON notifications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow users to update their own notifications"
    ON notifications
    FOR UPDATE
    TO authenticated
    USING (
        (auth.uid())::text::integer = user_id OR
        team_id IN (
            SELECT team_id 
            FROM team_members 
            WHERE user_id = (auth.uid())::text::integer
        )
    ); 
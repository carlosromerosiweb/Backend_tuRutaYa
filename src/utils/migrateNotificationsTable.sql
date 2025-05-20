-- Agregar columna team_id a la tabla notifications
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES teams(id) ON DELETE CASCADE;

-- Crear índice para team_id
CREATE INDEX IF NOT EXISTS idx_notifications_team_id ON notifications(team_id);

-- Agregar restricción CHECK
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS check_notification_target;

ALTER TABLE notifications 
ADD CONSTRAINT check_notification_target CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR
    (user_id IS NULL AND team_id IS NOT NULL)
);

-- Actualizar políticas de seguridad
DROP POLICY IF EXISTS "Allow users to read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow users to update their own notifications" ON notifications;

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
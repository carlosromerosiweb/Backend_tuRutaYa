-- Modificar la columna user_id para permitir NULL
ALTER TABLE notifications 
ALTER COLUMN user_id DROP NOT NULL;

-- Asegurarnos de que la restricción CHECK esté correctamente configurada
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS check_notification_target;

ALTER TABLE notifications 
ADD CONSTRAINT check_notification_target CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR
    (user_id IS NULL AND team_id IS NOT NULL)
); 
import { supabase } from './supabaseClient';
import fs from 'fs';
import path from 'path';

async function migrateNotificationsTable() {
  try {
    // Leer el archivo SQL
    const sqlPath = path.join(__dirname, 'migrateNotificationsTable.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar la migración
    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('Error al ejecutar la migración:', error);
      throw error;
    }

    console.log('Migración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
migrateNotificationsTable(); 
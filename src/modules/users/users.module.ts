import { Router, Request, Response } from 'express';
import { supabase } from '../../utils/supabaseClient';

const router = Router();

// Controladores
const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*');

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error al obtener los usuarios' });
  }
};

// Ruta de prueba para verificar la conexión
const testConnection = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({
      status: 'success',
      message: 'Conexión a Supabase establecida correctamente',
      data
    });
  } catch (error) {
    console.error('Error al conectar con Supabase:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error al conectar con Supabase',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
};

// Rutas
router.get('/', getAllUsers);
router.get('/test-connection', testConnection);

export const usersModule = {
  router,
  // Exportar otras funciones si son necesarias
}; 
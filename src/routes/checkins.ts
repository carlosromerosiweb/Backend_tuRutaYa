import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CheckinRequest {
  user_id: number;
  lead_id: string;
  route_id?: string;
  status: 'realizada' | 'cancelada' | 'no estaba';
  notes?: string;
  lat?: number;
  lng?: number;
}

/**
 * Registra un nuevo check-in de visita
 * @route POST /api/checkins
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, lead_id, route_id, status, notes, lat, lng }: CheckinRequest = req.body;

    // Validación de campos requeridos
    if (!user_id || !lead_id || !status) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        required: ['user_id', 'lead_id', 'status']
      });
    }

    // Validación del status
    const validStatuses = ['realizada', 'cancelada', 'no estaba'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Status inválido',
        validStatuses
      });
    }

    // Verificar que el usuario existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar que el lead existe
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('id')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      return res.status(404).json({ error: 'Lead no encontrado' });
    }

    // Si se proporciona route_id, verificar que existe
    if (route_id) {
      const { data: route, error: routeError } = await supabase
        .from('assigned_routes')
        .select('id')
        .eq('id', route_id)
        .single();

      if (routeError || !route) {
        return res.status(404).json({ error: 'Ruta no encontrada' });
      }
    }

    // Crear el check-in
    const { data: checkin, error: checkinError } = await supabase
      .from('visit_checkins')
      .insert({
        user_id,
        lead_id,
        route_id,
        status,
        notes,
        lat,
        lng,
        checked_in_at: new Date()
      })
      .select()
      .single();

    if (checkinError) {
      throw checkinError;
    }

    return res.status(201).json({
      success: true,
      checkin
    });

  } catch (error) {
    console.error('Error al crear check-in:', error);
    return res.status(500).json({
      error: 'Error al crear el check-in',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router; 
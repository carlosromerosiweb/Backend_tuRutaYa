import { Router, Request, Response } from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { ImportLeadsRequest, ImportLeadsResponse, GooglePlacesResponse, GooglePlaceDetailsResponse, ImportLeadsByZoneRequest } from '../types/places';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MAX_LIMIT = 20;

/**
 * Obtiene los detalles de un lugar, incluyendo horarios de apertura
 */
async function getPlaceDetails(placeId: string): Promise<{ openingHours: string[]; formattedAddress?: string }> {
  try {
    const response = await axios.get<GooglePlaceDetailsResponse>(
      'https://maps.googleapis.com/maps/api/place/details/json',
      {
        params: {
          place_id: placeId,
          fields: 'opening_hours,formatted_address',
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status !== 'OK') {
      console.warn(`No se pudieron obtener detalles para place_id: ${placeId}`);
      return { openingHours: [] };
    }

    return {
      openingHours: response.data.result.opening_hours?.weekday_text || [],
      formattedAddress: response.data.result.formatted_address
    };
  } catch (error) {
    console.error(`Error al obtener detalles para place_id: ${placeId}`, error);
    return { openingHours: [] };
  }
}

/**
 * Importa leads desde Google Places API usando Nearby Search
 * @route POST /api/import/google
 * @param {ImportLeadsRequest} req.body - Datos de la importación
 * @returns {ImportLeadsResponse} Estadísticas de la importación
 */
router.post('/import/google', async (req: Request, res: Response) => {
  try {
    const { sector, lat, lng, radius, limit, campaign_id }: ImportLeadsRequest = req.body;

    // Validación de campos requeridos
    if (!sector || lat === undefined || lng === undefined || !radius || !limit || !campaign_id) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        required: ['sector', 'lat', 'lng', 'radius', 'limit', 'campaign_id']
      });
    }

    // Validación de límites
    if (limit > MAX_LIMIT) {
      return res.status(400).json({
        error: `El límite no puede ser mayor a ${MAX_LIMIT}`,
        provided: limit,
        maxAllowed: MAX_LIMIT
      });
    }

    // Validación de radio
    if (radius <= 0 || radius > 50000) {
      return res.status(400).json({
        error: 'El radio debe estar entre 0 y 50000 metros',
        provided: radius
      });
    }

    const response = await axios.get<GooglePlacesResponse>(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${lat},${lng}`,
          radius,
          keyword: sector,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      return res.status(400).json({ 
        error: 'Error en la búsqueda de Google Places',
        status: response.data.status
      });
    }

    const results = response.data.results.slice(0, limit);
    const stats: ImportLeadsResponse = {
      totalProcessed: results.length,
      newLeads: 0,
      duplicateLeads: 0,
    };

    for (const place of results) {
      // Verificar si el lead ya existe
      const { data: existingLead } = await supabase
        .from('leads')
        .select('place_id')
        .eq('place_id', place.place_id)
        .single();

      if (existingLead) {
        stats.duplicateLeads++;
        continue;
      }

      // Obtener detalles adicionales del lugar
      const details = await getPlaceDetails(place.place_id);

      // Formatear la ubicación para PostGIS
      const locationPoint = `SRID=4326;POINT(${place.geometry.location.lng} ${place.geometry.location.lat})`;

      // Insertar nuevo lead
      const { error } = await supabase.from('leads').insert({
        name: place.name,
        address: details.formattedAddress || place.vicinity || place.formatted_address || '',
        location: locationPoint,
        place_id: place.place_id,
        sector,
        campaign_id,
        status: 'pendiente',
        opening_hours: details.openingHours,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (error) {
        console.error('Error al insertar lead:', error);
        continue;
      }

      stats.newLeads++;
    }

    return res.json({
      success: true,
      ...stats,
      metadata: {
        sector,
        location: { lat, lng },
        radius,
        limit,
        campaign_id
      }
    });
  } catch (error) {
    console.error('Error en import/google:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Importa leads desde Google Places API usando búsqueda por zona geográfica
 * @route POST /api/leads/import/zone
 * @param {ImportLeadsByZoneRequest} req.body - Datos de la importación
 * @returns {ImportLeadsResponse} Estadísticas de la importación
 */
router.post('/import/zone', async (req: Request, res: Response) => {
  try {
    const { sector, zone_type, zone_name, limit, campaign_id }: ImportLeadsByZoneRequest = req.body;

    // Validación de campos requeridos
    if (!sector || !zone_type || !zone_name || !limit || !campaign_id) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos',
        required: ['sector', 'zone_type', 'zone_name', 'limit', 'campaign_id']
      });
    }

    // Validación de límites
    if (limit > MAX_LIMIT) {
      return res.status(400).json({
        error: `El límite no puede ser mayor a ${MAX_LIMIT}`,
        provided: limit,
        maxAllowed: MAX_LIMIT
      });
    }

    // Construir la query de búsqueda
    const searchQuery = `${sector} in ${zone_name}`;

    const response = await axios.get<GooglePlacesResponse>(
      'https://maps.googleapis.com/maps/api/place/textsearch/json',
      {
        params: {
          query: searchQuery,
          key: process.env.GOOGLE_MAPS_API_KEY,
        },
      }
    );

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
      return res.status(400).json({ 
        error: 'Error en la búsqueda de Google Places',
        status: response.data.status
      });
    }

    const results = response.data.results.slice(0, limit);
    const stats: ImportLeadsResponse = {
      totalProcessed: results.length,
      newLeads: 0,
      duplicateLeads: 0,
    };

    for (const place of results) {
      // Verificar si el lead ya existe
      const { data: existingLead } = await supabase
        .from('leads')
        .select('place_id')
        .eq('place_id', place.place_id)
        .single();

      if (existingLead) {
        stats.duplicateLeads++;
        continue;
      }

      // Obtener detalles adicionales del lugar
      const details = await getPlaceDetails(place.place_id);

      // Formatear la ubicación para PostGIS
      const locationPoint = `SRID=4326;POINT(${place.geometry.location.lng} ${place.geometry.location.lat})`;

      // Insertar nuevo lead
      const { error } = await supabase.from('leads').insert({
        name: place.name,
        address: details.formattedAddress || place.vicinity || place.formatted_address || '',
        location: locationPoint,
        place_id: place.place_id,
        sector,
        campaign_id,
        status: 'pendiente',
        opening_hours: details.openingHours,
        created_at: new Date(),
        updated_at: new Date(),
      });

      if (error) {
        console.error('Error al insertar lead:', error);
        continue;
      }

      stats.newLeads++;
    }

    return res.json({
      success: true,
      ...stats,
      metadata: {
        sector,
        zone_type,
        zone_name,
        limit,
        campaign_id
      }
    });
  } catch (error) {
    console.error('Error en import/zone:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Lista todos los leads con filtros opcionales
 * @route GET /api/leads
 * @query {string} status - Filtro opcional por estado
 * @returns {Lead[]} Lista de leads
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: leads, error } = await query;

    if (error) throw error;

    return res.json(leads);
  } catch (error) {
    console.error('Error al listar leads:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Lista leads por equipo
 * @route GET /api/leads/team/:teamId
 * @param {string} teamId - ID del equipo
 * @query {string} status - Filtro opcional por estado
 * @returns {Lead[]} Lista de leads asignados al equipo
 */
router.get('/team/:teamId', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { status } = req.query;

    // Verificar que el equipo existe
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    let query = supabase
      .from('leads')
      .select('*')
      .eq('assigned_team_id', teamId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: leads, error } = await query;

    if (error) throw error;

    return res.json(leads);
  } catch (error) {
    console.error('Error al listar leads del equipo:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router; 
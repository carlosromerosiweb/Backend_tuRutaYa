import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabaseClient';
import axios from 'axios';
import { OptimizedRouteResponse, GoogleDirectionsResponse } from '../types/routes';
import { metersToKm, secondsToMinutes, formatWaypoint, extractCoordinates } from '../utils/routeUtils';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Listar todos los equipos
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        created_at,
        members:team_members (
          user:users (
            id,
            name,
            email
          ),
          role_in_team,
          joined_at
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return res.json({
      teams: teams.map(team => ({
        id: team.id,
        name: team.name,
        created_at: team.created_at,
        members: team.members.map(m => ({
          ...m.user,
          role_in_team: m.role_in_team,
          joined_at: m.joined_at
        }))
      }))
    });

  } catch (error) {
    console.error('Error al listar equipos:', error);
    return res.status(500).json({ 
      error: 'Error al listar equipos',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Obtener un equipo específico
router.get('/:teamId', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    const { data: team, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        created_at,
        members:team_members (
          user:users (
            id,
            name,
            email
          ),
          role_in_team,
          joined_at
        )
      `)
      .eq('id', teamId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Equipo no encontrado' });
      }
      throw error;
    }

    return res.json({
      id: team.id,
      name: team.name,
      created_at: team.created_at,
      members: team.members.map(m => ({
        ...m.user,
        role_in_team: m.role_in_team,
        joined_at: m.joined_at
      }))
    });

  } catch (error) {
    console.error('Error al obtener equipo:', error);
    return res.status(500).json({ 
      error: 'Error al obtener equipo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Crear un nuevo equipo
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, user_ids } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre del equipo es requerido' });
    }

    // Verificar que los usuarios existan
    if (user_ids && user_ids.length > 0) {
      const { data: existingUsers, error: usersError } = await supabase
        .from('users')
        .select('id')
        .in('id', user_ids);

      if (usersError) {
        throw usersError;
      }

      if (existingUsers.length !== user_ids.length) {
        return res.status(400).json({ 
          error: 'Algunos usuarios no existen',
          invalid_ids: user_ids.filter((id: number) => !existingUsers.find(u => u.id === id))
        });
      }
    }

    // Crear el equipo
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{ name }])
      .select()
      .single();

    if (teamError) {
      throw teamError;
    }

    // Asociar usuarios al equipo si se proporcionaron
    if (user_ids && user_ids.length > 0) {
      const teamMembers = user_ids.map((user_id: number) => ({
        team_id: team.id,
        user_id,
        role_in_team: 'member', // Rol por defecto
        joined_at: new Date()
      }));

      const { error: membersError } = await supabase
        .from('team_members')
        .insert(teamMembers);

      if (membersError) {
        // Si hay error al insertar miembros, eliminar el equipo creado
        await supabase
          .from('teams')
          .delete()
          .eq('id', team.id);
        throw membersError;
      }
    }

    // Obtener los usuarios asignados
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select(`
        user:users (
          id,
          name,
          email
        ),
        role_in_team,
        joined_at
      `)
      .eq('team_id', team.id);

    if (membersError) {
      throw membersError;
    }

    return res.status(201).json({
      team: {
        id: team.id,
        name: team.name,
        members: members.map(m => ({
          ...m.user,
          role_in_team: m.role_in_team,
          joined_at: m.joined_at
        }))
      }
    });

  } catch (error) {
    console.error('Error al crear equipo:', error);
    return res.status(500).json({ 
      error: 'Error al crear el equipo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Asignar usuarios a un equipo existente
router.post('/:teamId/members', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { user_ids, role_in_team = 'member' } = req.body;

    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un ID de usuario' });
    }

    // Verificar que el equipo existe
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Verificar que los usuarios existan
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .in('id', user_ids);

    if (usersError) {
      throw usersError;
    }

    if (existingUsers.length !== user_ids.length) {
      return res.status(400).json({ 
        error: 'Algunos usuarios no existen',
        invalid_ids: user_ids.filter((id: number) => !existingUsers.find(u => u.id === id))
      });
    }

    // Verificar usuarios que ya pertenecen al equipo
    const { data: existingMembers, error: membersError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .in('user_id', user_ids);

    if (membersError) {
      throw membersError;
    }

    const existingUserIds = existingMembers.map(m => m.user_id);
    const newUserIds = user_ids.filter(id => !existingUserIds.includes(id));

    if (newUserIds.length === 0) {
      return res.status(400).json({ error: 'Todos los usuarios ya pertenecen al equipo' });
    }

    // Insertar nuevos miembros
    const teamMembers = newUserIds.map((user_id: number) => ({
      team_id: teamId,
      user_id,
      role_in_team,
      joined_at: new Date()
    }));

    const { error: insertError } = await supabase
      .from('team_members')
      .insert(teamMembers);

    if (insertError) {
      throw insertError;
    }

    // Obtener todos los miembros actualizados
    const { data: updatedMembers, error: fetchError } = await supabase
      .from('team_members')
      .select(`
        user:users (
          id,
          name,
          email
        ),
        role_in_team,
        joined_at
      `)
      .eq('team_id', teamId);

    if (fetchError) {
      throw fetchError;
    }

    return res.status(200).json({
      team_id: teamId,
      members: updatedMembers.map(m => ({
        ...m.user,
        role_in_team: m.role_in_team,
        joined_at: m.joined_at
      }))
    });

  } catch (error) {
    console.error('Error al asignar usuarios al equipo:', error);
    return res.status(500).json({ 
      error: 'Error al asignar usuarios al equipo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Asignar leads a un equipo
router.post('/:teamId/leads', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { lead_ids } = req.body;

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return res.status(400).json({ error: 'Se requiere al menos un ID de lead' });
    }

    // Verificar que el equipo existe
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('id', teamId)
      .single();

    if (teamError || !team) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    // Verificar que los leads existan
    const { data: existingLeads, error: leadsError } = await supabase
      .from('leads')
      .select('id')
      .in('id', lead_ids);

    if (leadsError) {
      throw leadsError;
    }

    if (existingLeads.length !== lead_ids.length) {
      return res.status(400).json({ 
        error: 'Algunos leads no existen',
        invalid_ids: lead_ids.filter((id: string) => !existingLeads.find(l => l.id === id))
      });
    }

    // Actualizar los leads con el nuevo team_id
    const { data: updatedLeads, error: updateError } = await supabase
      .from('leads')
      .update({ assigned_team_id: teamId })
      .in('id', lead_ids)
      .select(`
        id,
        name,
        address,
        status,
        assigned_team_id,
        updated_at
      `);

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      team_id: teamId,
      leads: updatedLeads
    });

  } catch (error) {
    console.error('Error al asignar leads al equipo:', error);
    return res.status(500).json({ 
      error: 'Error al asignar leads al equipo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Obtiene la ruta optimizada para visitar todos los leads asignados a un equipo
 * @route GET /api/teams/:teamId/optimized-route
 * @param {string} teamId - ID del equipo
 * @query {string} [mode=driving] - Modo de transporte ('driving' o 'walking')
 */
router.get('/:teamId/optimized-route', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { mode = 'driving' } = req.query;

    // Validar el modo de transporte
    if (mode !== 'driving' && mode !== 'walking') {
      return res.status(400).json({
        error: 'Modo de transporte inválido. Debe ser "driving" o "walking"'
      });
    }

    console.log(`\n=== Calculando ruta optimizada para equipo ${teamId} (${mode}) ===`);

    // 1. Obtener los leads asignados al equipo con sus coordenadas
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, address, location')
      .eq('assigned_team_id', teamId)
      .not('location', 'is', null);

    if (leadsError) {
      throw leadsError;
    }

    if (!leads || leads.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron leads con ubicación asignados a este equipo'
      });
    }

    console.log(`\nLeads encontrados: ${leads.length}`);
    leads.forEach((lead, index) => {
      console.log(`${index + 1}. ${lead.name} (${lead.address})`);
    });

    // 2. Preparar los waypoints para la API de Google Directions
    const waypoints = leads.map(lead => {
      const coords = extractCoordinates(lead.location);
      console.log(`Coordenadas para ${lead.name}:`, coords);
      return formatWaypoint(coords.lat, coords.lng);
    });

    // 3. Llamar a la API de Google Directions
    const origin = 'Plaza España, Vigo, Spain';
    console.log('\nLlamando a Google Directions API:');
    console.log('Origen/Destino:', origin);
    console.log('Modo de transporte:', mode);
    console.log('Número de waypoints:', waypoints.length);

    // Construir la URL con los parámetros
    const params = new URLSearchParams({
      origin,
      destination: origin,
      waypoints: `optimize:true|${waypoints.join('|')}`,
      mode: mode as string,
      key: process.env.GOOGLE_MAPS_API_KEY || '',
    });

    console.log('URL de la API:', `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);

    const response = await axios.get<GoogleDirectionsResponse>(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params,
      }
    );

    console.log('\nRespuesta de Google Directions API:');
    console.log('Status:', response.data.status);
    if (response.data.status !== 'OK') {
      console.error('Error completo:', response.data);
      throw new Error(`Error en la API de Google Directions: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const waypointOrder = route.waypoint_order;

    // 4. Procesar la respuesta
    const orderedLeads = waypointOrder.map(index => {
      const lead = leads[index];
      const coords = extractCoordinates(lead.location);
      return {
        id: lead.id,
        name: lead.name,
        address: lead.address,
        lat: coords.lat,
        lng: coords.lng
      };
    });

    // 5. Calcular segmentos
    const segments = route.legs.map((leg, index) => {
      const fromLead = index === 0 ? 'Plaza España' : orderedLeads[index - 1].name;
      const toLead = index === route.legs.length - 1 ? 'Plaza España' : orderedLeads[index].name;

      return {
        from_lead_name: fromLead,
        to_lead_name: toLead,
        distance_km: metersToKm(leg.distance.value),
        duration_min: secondsToMinutes(leg.duration.value)
      };
    });

    // 6. Calcular totales
    const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);

    // Mostrar la ruta optimizada
    console.log('\n=== Ruta Optimizada ===');
    console.log('Modo de transporte:', mode);
    console.log('Plaza España');
    orderedLeads.forEach((lead, index) => {
      console.log(`  ↓ ${segments[index].distance_km}km (${segments[index].duration_min}min)`);
      console.log(`${lead.name}`);
    });
    console.log(`  ↓ ${segments[segments.length - 1].distance_km}km (${segments[segments.length - 1].duration_min}min)`);
    console.log('Plaza España');
    console.log(`\nDistancia total: ${metersToKm(totalDistance)}km`);
    console.log(`Duración total: ${secondsToMinutes(totalDuration)}min`);

    const result: OptimizedRouteResponse = {
      team_id: teamId,
      transport_mode: mode as 'driving' | 'walking',
      total_distance_km: metersToKm(totalDistance),
      total_duration_min: secondsToMinutes(totalDuration),
      waypoint_order: waypointOrder,
      ordered_leads: orderedLeads,
      segments,
      polyline: route.overview_polyline.points
    };

    return res.json(result);
  } catch (error) {
    console.error('\nError en optimized-route:', error);
    return res.status(500).json({
      error: 'Error al calcular la ruta optimizada',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Obtiene la ruta optimizada para visitar todos los leads asignados a un equipo a pie
 * @route GET /api/teams/:teamId/walking-route
 */
router.get('/:teamId/walking-route', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    console.log(`\n=== Calculando ruta a pie para equipo ${teamId} ===`);

    // 1. Obtener los leads asignados al equipo con sus coordenadas
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('id, name, address, location')
      .eq('assigned_team_id', teamId)
      .not('location', 'is', null);

    if (leadsError) {
      throw leadsError;
    }

    if (!leads || leads.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron leads con ubicación asignados a este equipo'
      });
    }

    console.log(`\nLeads encontrados: ${leads.length}`);
    leads.forEach((lead, index) => {
      console.log(`${index + 1}. ${lead.name} (${lead.address})`);
    });

    // 2. Preparar los waypoints para la API de Google Directions
    const waypoints = leads.map(lead => {
      const coords = extractCoordinates(lead.location);
      console.log(`Coordenadas para ${lead.name}:`, coords);
      return formatWaypoint(coords.lat, coords.lng);
    });

    // 3. Llamar a la API de Google Directions
    const origin = 'Plaza España, Vigo, Spain';
    console.log('\nLlamando a Google Directions API:');
    console.log('Origen/Destino:', origin);
    console.log('Modo: walking');
    console.log('Número de waypoints:', waypoints.length);

    // Construir la URL con los parámetros
    const params = new URLSearchParams({
      origin,
      destination: origin,
      waypoints: `optimize:true|${waypoints.join('|')}`,
      mode: 'walking',
      key: process.env.GOOGLE_MAPS_API_KEY || '',
    });

    console.log('URL de la API:', `https://maps.googleapis.com/maps/api/directions/json?${params.toString()}`);

    const response = await axios.get<GoogleDirectionsResponse>(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params,
      }
    );

    console.log('\nRespuesta de Google Directions API:');
    console.log('Status:', response.data.status);
    if (response.data.status !== 'OK') {
      console.error('Error completo:', response.data);
      throw new Error(`Error en la API de Google Directions: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    const waypointOrder = route.waypoint_order;

    // 4. Procesar la respuesta
    const orderedLeads = waypointOrder.map(index => {
      const lead = leads[index];
      const coords = extractCoordinates(lead.location);
      return {
        id: lead.id,
        name: lead.name,
        address: lead.address,
        lat: coords.lat,
        lng: coords.lng
      };
    });

    // 5. Calcular segmentos
    const segments = route.legs.map((leg, index) => {
      const fromLead = index === 0 ? 'Plaza España' : orderedLeads[index - 1].name;
      const toLead = index === route.legs.length - 1 ? 'Plaza España' : orderedLeads[index].name;

      return {
        from_lead_name: fromLead,
        to_lead_name: toLead,
        distance_km: metersToKm(leg.distance.value),
        duration_min: secondsToMinutes(leg.duration.value)
      };
    });

    // 6. Calcular totales
    const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);

    // Mostrar la ruta optimizada
    console.log('\n=== Ruta Optimizada a Pie ===');
    console.log('Plaza España');
    orderedLeads.forEach((lead, index) => {
      console.log(`  ↓ ${segments[index].distance_km}km (${segments[index].duration_min}min)`);
      console.log(`${lead.name}`);
    });
    console.log(`  ↓ ${segments[segments.length - 1].distance_km}km (${segments[segments.length - 1].duration_min}min)`);
    console.log('Plaza España');
    console.log(`\nDistancia total: ${metersToKm(totalDistance)}km`);
    console.log(`Duración total: ${secondsToMinutes(totalDuration)}min`);

    const result: OptimizedRouteResponse = {
      team_id: teamId,
      transport_mode: 'walking',
      total_distance_km: metersToKm(totalDistance),
      total_duration_min: secondsToMinutes(totalDuration),
      waypoint_order: waypointOrder,
      ordered_leads: orderedLeads,
      segments,
      polyline: route.overview_polyline.points
    };

    return res.json(result);
  } catch (error) {
    console.error('\nError en walking-route:', error);
    return res.status(500).json({
      error: 'Error al calcular la ruta a pie',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router; 
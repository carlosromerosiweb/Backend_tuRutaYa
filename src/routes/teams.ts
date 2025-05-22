import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabaseClient';
import axios from 'axios';
import { OptimizedRouteResponse, GoogleDirectionsResponse } from '../types/routes';
import { metersToKm, secondsToMinutes, formatWaypoint, extractCoordinates } from '../utils/routeUtils';
import dotenv from 'dotenv';
import { DistributeRouteRequest, DistributedRouteSegment, DistributeRouteResponse } from '../types/routes';

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
    const segments = route.legs.slice(0, -1).map((leg, index) => {
      const fromLead = index === 0 ? 'Plaza España' : orderedLeads[index - 1].name;
      const toLead = orderedLeads[index].name;

      return {
        from_lead_name: fromLead,
        to_lead_name: toLead,
        distance_km: metersToKm(leg.distance.value),
        duration_min: secondsToMinutes(leg.duration.value)
      };
    });

    // 6. Calcular totales (sin incluir el último segmento)
    const totalDistance = route.legs.slice(0, -1).reduce((sum, leg) => sum + leg.distance.value, 0);
    const totalDuration = route.legs.slice(0, -1).reduce((sum, leg) => sum + leg.duration.value, 0);

    // Mostrar la ruta optimizada
    console.log('\n=== Ruta Optimizada ===');
    console.log('Modo de transporte:', mode);
    console.log('Plaza España');
    orderedLeads.forEach((lead, index) => {
      console.log(`  ↓ ${segments[index].distance_km}km (${segments[index].duration_min}min)`);
      console.log(`${lead.name}`);
    });
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

    // 7. Eliminar rutas anteriores del equipo
    const { error: deleteError } = await supabase
      .from('optimized_routes')
      .delete()
      .eq('team_id', teamId);

    if (deleteError) {
      console.error('Error al eliminar rutas anteriores:', deleteError);
      throw new Error(`Error al eliminar rutas anteriores: ${deleteError.message}`);
    }

    // 8. Guardar la nueva ruta en la base de datos
    const { data: savedRoute, error: saveError } = await supabase
      .from('optimized_routes')
      .insert({
        team_id: teamId,
        transport_mode: mode,
        total_distance_km: metersToKm(totalDistance),
        total_duration_min: secondsToMinutes(totalDuration),
        waypoint_order: waypointOrder,
        ordered_leads: orderedLeads,
        segments,
        polyline: route.overview_polyline.points,
        created_at: new Date()
      })
      .select()
      .single();

    if (saveError || !savedRoute) {
      console.error('Error al guardar la ruta optimizada:', saveError);
      throw new Error(`Error al guardar la ruta optimizada: ${saveError?.message || 'No se pudo guardar la ruta'}`);
    }

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
    const segments = route.legs.slice(0, -1).map((leg, index) => {
      const fromLead = index === 0 ? 'Plaza España' : orderedLeads[index - 1].name;
      const toLead = orderedLeads[index].name;

      return {
        from_lead_name: fromLead,
        to_lead_name: toLead,
        distance_km: metersToKm(leg.distance.value),
        duration_min: secondsToMinutes(leg.duration.value)
      };
    });

    // 6. Calcular totales (sin incluir el último segmento)
    const totalDistance = route.legs.slice(0, -1).reduce((sum, leg) => sum + leg.distance.value, 0);
    const totalDuration = route.legs.slice(0, -1).reduce((sum, leg) => sum + leg.duration.value, 0);

    // Mostrar la ruta optimizada
    console.log('\n=== Ruta Optimizada a Pie ===');
    console.log('Plaza España');
    orderedLeads.forEach((lead, index) => {
      console.log(`  ↓ ${segments[index].distance_km}km (${segments[index].duration_min}min)`);
      console.log(`${lead.name}`);
    });
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

/**
 * Distribuye la ruta optimizada de un equipo entre varios comerciales
 * @route POST /api/teams/:teamId/distribute-route
 */
router.post('/:teamId/distribute-route', async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { user_ids, num_commercials } = req.body as DistributeRouteRequest;

    // Validar que el teamId sea un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(teamId)) {
      return res.status(400).json({
        error: 'ID de equipo inválido. Debe ser un UUID válido'
      });
    }

    // Validar que se proporcione al menos una de las dos opciones
    if (!user_ids && !num_commercials) {
      return res.status(400).json({
        error: 'Se debe proporcionar user_ids o num_commercials'
      });
    }

    // Validar que no se proporcionen ambas opciones
    if (user_ids && num_commercials) {
      return res.status(400).json({
        error: 'Solo se puede proporcionar user_ids o num_commercials, no ambos'
      });
    }

    // Obtener la ruta optimizada más reciente del equipo
    const { data: optimizedRoute, error: routeError } = await supabase
      .from('optimized_routes')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (routeError || !optimizedRoute) {
      return res.status(404).json({
        error: 'No se encontró una ruta optimizada para este equipo. Primero debes generar una ruta usando GET /api/teams/:teamId/optimized-route'
      });
    }

    // Calcular el número de comerciales
    const numRoutes = user_ids ? user_ids.length : num_commercials!;

    // Validar que hay suficientes leads para dividir
    if (optimizedRoute.ordered_leads.length < numRoutes) {
      return res.status(400).json({
        error: `No hay suficientes leads para dividir entre ${numRoutes} comerciales`,
        leads_count: optimizedRoute.ordered_leads.length,
        requested_routes: numRoutes
      });
    }

    // Si no se proporcionaron user_ids, obtener los primeros comerciales del equipo
    let commercialIds = user_ids;
    if (!commercialIds) {
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true })
        .limit(numRoutes);

      if (membersError) {
        throw membersError;
      }

      if (!teamMembers || teamMembers.length < numRoutes) {
        return res.status(400).json({
          error: `No hay suficientes comerciales en el equipo. Se requieren ${numRoutes} y solo hay ${teamMembers?.length || 0}`
        });
      }

      commercialIds = teamMembers.map(member => member.user_id);
    }

    // Excluir el último segmento (vuelta al origen) para los cálculos
    const segmentsWithoutReturn = optimizedRoute.segments.slice(0, -1);
    const totalDurationWithoutReturn = segmentsWithoutReturn.reduce((sum: number, seg: { duration_min: number }) => sum + seg.duration_min, 0);

    // Calcular el tiempo objetivo por ruta y la tolerancia
    const targetTimePerRoute = totalDurationWithoutReturn / numRoutes;
    const tolerance = targetTimePerRoute * 0.10; // 10% de tolerancia

    // Dividir la ruta en segmentos
    const distributedRoutes: DistributedRouteSegment[] = [];
    let currentRouteIndex = 0;
    let currentDuration = 0;
    let startIndex = 0;

    // Función para calcular la duración total de un rango de segmentos
    const calculateDuration = (start: number, end: number): number => {
      return segmentsWithoutReturn
        .slice(start, end)
        .reduce((sum: number, seg: { duration_min: number }) => sum + seg.duration_min, 0);
    };

    // Función para calcular la distancia total de un rango de segmentos
    const calculateDistance = (start: number, end: number): number => {
      return segmentsWithoutReturn
        .slice(start, end)
        .reduce((sum: number, seg: { distance_km: number }) => sum + seg.distance_km, 0);
    };

    // Iterar sobre cada segmento para encontrar los puntos de división óptimos
    for (let i = 0; i < segmentsWithoutReturn.length; i++) {
      currentDuration += segmentsWithoutReturn[i].duration_min;

      // Si no es el último comercial
      if (currentRouteIndex < numRoutes - 1) {
        // Calcular tiempo y comerciales restantes
        const remainingTime = totalDurationWithoutReturn - currentDuration;
        const remainingCommercials = numRoutes - currentRouteIndex - 1;
        const expectedPerRemaining = remainingTime / remainingCommercials;

        // Evaluar si este es un buen punto de división
        const timeDifference = Math.abs(currentDuration - targetTimePerRoute);
        const nextTimeDifference = Math.abs((currentDuration + (segmentsWithoutReturn[i + 1]?.duration_min || 0)) - targetTimePerRoute);

        // Decidir si cortar en este punto basado en múltiples criterios
        const shouldCut = 
          // Criterio 1: Estamos dentro de la tolerancia
          timeDifference <= tolerance ||
          // Criterio 2: Incluir el siguiente segmento empeoraría la distribución
          (timeDifference <= nextTimeDifference && expectedPerRemaining >= targetTimePerRoute - tolerance) ||
          // Criterio 3: Los comerciales restantes tendrían muy poco tiempo
          expectedPerRemaining < targetTimePerRoute - tolerance;

        if (shouldCut) {
          // Crear la subruta actual
          const routeSegments = segmentsWithoutReturn.slice(startIndex, i + 1);
          const routeLeads = optimizedRoute.ordered_leads.slice(startIndex, i + 1);

          distributedRoutes.push({
            user_id: commercialIds![currentRouteIndex],
            total_duration_min: calculateDuration(startIndex, i + 1),
            total_distance_km: calculateDistance(startIndex, i + 1),
            leads: routeLeads,
            segments: routeSegments
          });

          // Preparar para la siguiente subruta
          currentRouteIndex++;
          startIndex = i + 1;
          currentDuration = 0;
        }
      }
    }

    // Asignar los segmentos restantes al último comercial
    if (startIndex < segmentsWithoutReturn.length) {
      const routeSegments = segmentsWithoutReturn.slice(startIndex);
      const routeLeads = optimizedRoute.ordered_leads.slice(startIndex);

      distributedRoutes.push({
        user_id: commercialIds![currentRouteIndex],
        total_duration_min: calculateDuration(startIndex, segmentsWithoutReturn.length),
        total_distance_km: calculateDistance(startIndex, segmentsWithoutReturn.length),
        leads: routeLeads,
        segments: routeSegments
      });
    }

    // Guardar las rutas asignadas en la base de datos
    const assignedRoutes = distributedRoutes.map(route => ({
      user_id: route.user_id,
      team_id: teamId,
      assigned_date: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
      leads: route.leads,
      total_duration_min: route.total_duration_min,
      total_distance_km: route.total_distance_km,
      created_at: new Date()
    }));

    // Verificar que la tabla assigned_routes existe
    const { error: tableCheckError } = await supabase
      .from('assigned_routes')
      .select('id')
      .limit(1);

    if (tableCheckError) {
      console.error('Error al verificar la tabla assigned_routes:', tableCheckError);
      throw new Error(`Error al verificar la tabla assigned_routes: ${tableCheckError.message}`);
    }

    // Eliminar rutas asignadas anteriores para este equipo
    const { error: deleteError } = await supabase
      .from('assigned_routes')
      .delete()
      .eq('team_id', teamId);

    if (deleteError) {
      console.error('Error al eliminar rutas asignadas anteriores:', deleteError);
      throw new Error(`Error al eliminar rutas asignadas anteriores: ${deleteError.message}`);
    }

    // Guardar las nuevas rutas asignadas
    const { data: savedRoutes, error: saveError } = await supabase
      .from('assigned_routes')
      .insert(assignedRoutes)
      .select();

    if (saveError || !savedRoutes) {
      console.error('Error al guardar las rutas asignadas:', saveError);
      throw new Error(`Error al guardar las rutas asignadas: ${saveError?.message || 'No se pudieron guardar las rutas'}`);
    }

    const response: DistributeRouteResponse = {
      team_id: teamId,
      distributed_routes: distributedRoutes
    };

    return res.json(response);
  } catch (error) {
    console.error('Error al distribuir la ruta:', error);
    return res.status(500).json({
      error: 'Error al distribuir la ruta',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

/**
 * Obtiene las rutas asignadas de un usuario específico
 * @route GET /api/teams/assigned-routes/:userId
 */
router.get('/assigned-routes/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    // Validar que el userId sea un número
    if (isNaN(Number(userId))) {
      return res.status(400).json({
        error: 'ID de usuario inválido. Debe ser un número'
      });
    }

    // Obtener las rutas asignadas al usuario
    const { data: assignedRoutes, error: routesError } = await supabase
      .from('assigned_routes')
      .select(`
        *,
        team:teams (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('assigned_date', { ascending: false });

    if (routesError) {
      throw routesError;
    }

    if (!assignedRoutes || assignedRoutes.length === 0) {
      return res.status(404).json({
        error: 'No se encontraron rutas asignadas para este usuario'
      });
    }

    return res.json({
      user_id: Number(userId),
      assigned_routes: assignedRoutes
    });

  } catch (error) {
    console.error('Error al obtener rutas asignadas:', error);
    return res.status(500).json({
      error: 'Error al obtener rutas asignadas',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

export default router; 
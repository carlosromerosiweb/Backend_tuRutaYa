import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabaseClient';

const router = Router();

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

export default router; 
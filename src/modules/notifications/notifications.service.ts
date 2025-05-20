import { supabase } from '../../utils/supabaseClient';

export interface CreateNotificationDto {
  user_id?: number;
  team_id?: string;
  type: string;
  title: string;
  message: string;
}

export interface Notification {
  id: string;
  user_id: number | null;
  team_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export class NotificationsService {
  static async createNotification(data: CreateNotificationDto): Promise<Notification> {
    try {
      // Validar que se proporcione user_id o team_id, pero no ambos
      if ((data.user_id && data.team_id) || (!data.user_id && !data.team_id)) {
        throw new Error('Debe proporcionar user_id o team_id, pero no ambos');
      }

      // Si es una notificación de equipo, verificar que el equipo existe
      if (data.team_id) {
        const { data: team, error: teamError } = await supabase
          .from('teams')
          .select('id')
          .eq('id', data.team_id)
          .single();

        if (teamError || !team) {
          throw new Error('El equipo especificado no existe');
        }
      }

      // Si es una notificación de usuario, verificar que el usuario existe
      if (data.user_id) {
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user_id)
          .single();

        if (userError || !user) {
          throw new Error('El usuario especificado no existe');
        }
      }

      // Crear la notificación
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert([{
          ...data,
          read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error al crear la notificación:', error);
        throw new Error(`Error al crear la notificación: ${error.message}`);
      }

      return notification;
    } catch (error) {
      console.error('Error en createNotification:', error);
      throw error;
    }
  }

  static async getUserNotifications(userId: number, limit = 20, offset = 0): Promise<Notification[]> {
    try {
      // Primero obtener los IDs de los equipos del usuario
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);

      if (teamError) {
        throw new Error(`Error al obtener los equipos del usuario: ${teamError.message}`);
      }

      const teamIds = teamMembers?.map(member => member.team_id) || [];

      // Obtener las notificaciones
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .or(`user_id.eq.${userId},team_id.in.(${teamIds.join(',')})`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error al obtener las notificaciones:', error);
        throw new Error(`Error al obtener las notificaciones: ${error.message}`);
      }

      return notifications || [];
    } catch (error) {
      console.error('Error en getUserNotifications:', error);
      throw error;
    }
  }

  static async getTeamNotifications(teamId: string, limit = 20, offset = 0): Promise<Notification[]> {
    try {
      // Verificar que el equipo existe
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .select('id')
        .eq('id', teamId)
        .single();

      if (teamError || !team) {
        throw new Error('El equipo especificado no existe');
      }

      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('team_id', teamId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error al obtener las notificaciones del equipo:', error);
        throw new Error(`Error al obtener las notificaciones del equipo: ${error.message}`);
      }

      return notifications || [];
    } catch (error) {
      console.error('Error en getTeamNotifications:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error al marcar la notificación como leída:', error);
        throw new Error(`Error al marcar la notificación como leída: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en markAsRead:', error);
      throw error;
    }
  }

  static async markAllAsRead(userId: number): Promise<void> {
    try {
      // Primero obtener los IDs de los equipos del usuario
      const { data: teamMembers, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);

      if (teamError) {
        throw new Error(`Error al obtener los equipos del usuario: ${teamError.message}`);
      }

      const teamIds = teamMembers?.map(member => member.team_id) || [];

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .or(`user_id.eq.${userId},team_id.in.(${teamIds.join(',')})`)
        .eq('read', false);

      if (error) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        throw new Error(`Error al marcar todas las notificaciones como leídas: ${error.message}`);
      }
    } catch (error) {
      console.error('Error en markAllAsRead:', error);
      throw error;
    }
  }
} 
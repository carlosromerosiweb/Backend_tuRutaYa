import { Request, Response } from 'express';
import { NotificationsService, CreateNotificationDto } from './notifications.service';

export class NotificationsController {
  static async createNotification(req: Request, res: Response) {
    try {
      const notificationData: CreateNotificationDto = req.body;

      // Validar campos requeridos
      if (!notificationData.type || !notificationData.title || !notificationData.message) {
        return res.status(400).json({ 
          error: 'Faltan campos requeridos',
          required: ['type', 'title', 'message']
        });
      }

      // Validar que se proporcione user_id o team_id
      if (!notificationData.user_id && !notificationData.team_id) {
        return res.status(400).json({ 
          error: 'Debe proporcionar user_id o team_id'
        });
      }

      const notification = await NotificationsService.createNotification(notificationData);
      res.status(201).json(notification);
    } catch (error) {
      console.error('Error en createNotification controller:', error);
      if (error instanceof Error) {
        if (error.message.includes('no existe')) {
          return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Debe proporcionar')) {
          return res.status(400).json({ error: error.message });
        }
      }
      res.status(500).json({ error: 'Error al crear la notificación' });
    }
  }

  static async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const notifications = await NotificationsService.getUserNotifications(userId, limit, offset);
      res.json(notifications);
    } catch (error) {
      console.error('Error en getUserNotifications controller:', error);
      res.status(500).json({ error: 'Error al obtener las notificaciones' });
    }
  }

  static async getTeamNotifications(req: Request, res: Response) {
    try {
      const teamId = req.params.teamId;
      if (!teamId) {
        return res.status(400).json({ error: 'ID de equipo requerido' });
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const notifications = await NotificationsService.getTeamNotifications(teamId, limit, offset);
      res.json(notifications);
    } catch (error) {
      console.error('Error en getTeamNotifications controller:', error);
      if (error instanceof Error && error.message.includes('no existe')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al obtener las notificaciones del equipo' });
    }
  }

  static async markAsRead(req: Request, res: Response) {
    try {
      const notificationId = req.params.notificationId;
      if (!notificationId) {
        return res.status(400).json({ error: 'ID de notificación requerido' });
      }

      await NotificationsService.markAsRead(notificationId);
      res.status(200).json({ message: 'Notificación marcada como leída' });
    } catch (error) {
      console.error('Error en markAsRead controller:', error);
      res.status(500).json({ error: 'Error al marcar la notificación como leída' });
    }
  }

  static async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'ID de usuario inválido' });
      }

      await NotificationsService.markAllAsRead(userId);
      res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas' });
    } catch (error) {
      console.error('Error en markAllAsRead controller:', error);
      res.status(500).json({ error: 'Error al marcar todas las notificaciones como leídas' });
    }
  }
} 
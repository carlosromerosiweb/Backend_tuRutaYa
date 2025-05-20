import { Router } from 'express';
import { NotificationsController } from '../modules/notifications/notifications.controller';

const router = Router();

// Crear una nueva notificación
router.post('/', NotificationsController.createNotification);

// Obtener notificaciones de un usuario
router.get('/users/:userId/notifications', NotificationsController.getUserNotifications);

// Obtener notificaciones de un equipo
router.get('/teams/:teamId/notifications', NotificationsController.getTeamNotifications);

// Marcar una notificación como leída
router.patch('/:notificationId/read', NotificationsController.markAsRead);

// Marcar todas las notificaciones de un usuario como leídas
router.patch('/users/:userId/notifications/mark-all-read', NotificationsController.markAllAsRead);

export default router; 
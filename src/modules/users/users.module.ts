import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticateToken } from './users.middleware';

const router = Router();

// Rutas protegidas
router.get('/', authenticateToken, UsersController.getAllUsers);
router.get('/me', authenticateToken, UsersController.getCurrentUser);
router.get('/:id', authenticateToken, UsersController.getUserById);
router.patch('/:id/schedule', authenticateToken, UsersController.updateUserSchedule);

export const usersModule = {
  router,
}; 
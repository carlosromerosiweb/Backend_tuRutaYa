import { Request, Response } from 'express';
import { UsersService } from './users.service';

export class UsersController {
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await UsersService.getAllUsers();
      res.json(users);
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UsersService.getUserById(id);
      res.json(user);
    } catch (error: any) {
      console.error('Error al obtener usuario:', error);
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      if (!req.user?.userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }
      const user = await UsersService.getCurrentUser(req.user.userId);
      res.json(user);
    } catch (error: any) {
      console.error('Error al obtener usuario actual:', error);
      if (error.message === 'Usuario no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  }
} 
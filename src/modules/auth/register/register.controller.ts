import { Request, Response } from 'express';
import { RegisterService } from './register.service';
import { RegisterUserDto } from './register.types';

export class RegisterController {
  static async register(req: Request, res: Response) {
    try {
      const userData: RegisterUserDto = req.body;
      
      // Validaciones básicas
      if (!userData.email || !userData.name || !userData.password) {
        return res.status(400).json({ 
          error: 'Email, nombre y contraseña son obligatorios' 
        });
      }

      const result = await RegisterService.register(userData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'El usuario ya existe') {
        return res.status(409).json({ error: error.message });
      }
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
} 
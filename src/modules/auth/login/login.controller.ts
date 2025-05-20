import { Request, Response } from 'express';
import { LoginService } from './login.service';
import { LoginUserDto } from './login.types';

export class LoginController {
  static async login(req: Request, res: Response) {
    try {
      const loginData: LoginUserDto = req.body;
      
      // Validaciones básicas
      if (!loginData.identifier || !loginData.password) {
        return res.status(400).json({ 
          error: 'Identificador (email o nombre) y contraseña son obligatorios' 
        });
      }

      const result = await LoginService.login(loginData);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === 'Credenciales inválidas') {
        return res.status(401).json({ error: error.message });
      }
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
} 
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { LoginUserDto, LoginResponse } from './login.types';

// Validación de variables de entorno
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.JWT_SECRET;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son requeridas');
}

if (!jwtSecret) {
  throw new Error('La variable de entorno JWT_SECRET es requerida');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export class LoginService {
  private static readonly JWT_SECRET = jwtSecret as string;
  private static readonly JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

  static async login(loginData: LoginUserDto): Promise<LoginResponse> {
    // Buscar usuario por email o nombre
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${loginData.identifier},name.eq.${loginData.identifier}`)
      .single();

    if (error || !user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(loginData.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Credenciales inválidas');
    }

    // Incrementar token_version para invalidar tokens anteriores
    const { error: updateError } = await supabase
      .from('users')
      .update({ token_version: user.token_version + 1 })
      .eq('id', user.id);

    if (updateError) {
      throw new Error('Error al actualizar el token');
    }

    // Generar nuevo token
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        roles: user.roles,
        tokenVersion: user.token_version + 1
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles
      }
    };
  }
} 
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import { RegisterUserDto, RegisterResponse } from './register.types';

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

export class RegisterService {
  private static readonly JWT_SECRET = jwtSecret as string;
  private static readonly JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'];

  static async register(userData: RegisterUserDto): Promise<RegisterResponse> {
    // Verificar si el usuario ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', userData.email)
      .single();

    if (existingUser) {
      throw new Error('El usuario ya existe');
    }

    // Hashear el password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(userData.password, salt);

    // Crear el usuario
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email: userData.email,
          name: userData.name,
          password_hash: passwordHash,
          roles: userData.roles || ['vendedor'],
          token_version: 1
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error detallado de Supabase:', error);
      throw new Error(`Error al crear el usuario: ${error.message}`);
    }

    // Generar token
    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email,
        roles: newUser.roles,
        tokenVersion: newUser.token_version
      },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        roles: newUser.roles
      }
    };
  }
} 
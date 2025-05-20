import { supabase } from '../../utils/supabaseClient';

export class UsersService {
  static async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, roles, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Error al obtener los usuarios');
    }

    return data;
  }

  static async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, roles, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error('Usuario no encontrado');
    }

    return data;
  }

  static async getCurrentUser(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, roles, created_at')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error('Usuario no encontrado');
    }

    return data;
  }
} 
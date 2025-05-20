import { supabase } from './supabaseClient';

async function createUsersTable() {
  try {
    // Verificar si la tabla existe
    const { error: checkError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (checkError) {
      console.log('Error al verificar la tabla:', checkError);
      
      if (checkError.code === '42P01') { // Tabla no existe
        console.log('La tabla no existe, intentando crear...');
        
        // Intentar crear la tabla insertando un registro
        const { data, error: createError } = await supabase
          .from('users')
          .insert({
            email: 'admin@turutaya.com',
            name: 'Administrador',
            roles: ['admin']
          })
          .select()
          .single();

        if (createError) {
          console.error('Error al crear la tabla:', createError);
          throw createError;
        }

        console.log('Tabla creada exitosamente con el primer registro:', data);
      } else {
        throw checkError;
      }
    } else {
      console.log('La tabla users ya existe');
    }

    // Insertar o actualizar datos de prueba
    console.log('Insertando datos de prueba...');
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .upsert([
        {
          email: 'admin@turutaya.com',
          name: 'Administrador',
          roles: ['admin']
        },
        {
          email: 'vendedor@turutaya.com',
          name: 'Vendedor Ejemplo',
          roles: ['vendedor']
        },
        {
          email: 'supervisor@turutaya.com',
          name: 'Supervisor Ejemplo',
          roles: ['supervisor', 'vendedor']
        }
      ], {
        onConflict: 'email'
      })
      .select();

    if (insertError) {
      console.error('Error al insertar datos de prueba:', insertError);
      throw insertError;
    }

    console.log('Datos de prueba insertados exitosamente:', insertData);
  } catch (error) {
    console.error('Error detallado:', error);
    if (error instanceof Error) {
      console.error('Mensaje de error:', error.message);
      console.error('Stack trace:', error.stack);
    }
  }
}

// Ejecutar la función
createUsersTable(); 
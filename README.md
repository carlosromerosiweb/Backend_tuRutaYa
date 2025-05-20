# Tu Ruta Ya - Backend

Backend para la aplicación de optimización de rutas comerciales.

## Requisitos

- Node.js (v14 o superior)
- npm o yarn
- Cuenta en Supabase
- Credenciales de Google OAuth

## Instalación

1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
   - Copiar `.env.example` a `.env`
   - Completar las variables de entorno necesarias:
     - SUPABASE_URL
     - SUPABASE_SERVICE_ROLE_KEY
     - GOOGLE_CLIENT_ID
     - GOOGLE_CLIENT_SECRET

## Scripts disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo
- `npm run build`: Compila el proyecto
- `npm start`: Inicia el servidor en modo producción
- `npm run lint`: Ejecuta el linter
- `npm test`: Ejecuta las pruebas

## Estructura del proyecto

```
src/
  ├── config/         # Configuraciones (Supabase, etc.)
  ├── controllers/    # Controladores de rutas
  ├── routes/         # Definición de rutas
  ├── services/       # Lógica de negocio
  ├── utils/          # Utilidades
  └── index.ts        # Punto de entrada
```

## Endpoints

- `GET /ping`: Ruta de prueba
- `POST /auth/google`: Autenticación con Google (pendiente de implementar) 
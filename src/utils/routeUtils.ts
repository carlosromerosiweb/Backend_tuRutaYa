import wkx from 'wkx';

/**
 * Convierte metros a kilómetros redondeando a 1 decimal
 */
export function metersToKm(meters: number): number {
  return Math.round((meters / 1000) * 10) / 10;
}

/**
 * Convierte segundos a minutos redondeando al entero más cercano
 */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

/**
 * Formatea las coordenadas para la API de Google Directions
 */
export function formatWaypoint(lat: number, lng: number): string {
  return `${lat},${lng}`;
}

/**
 * Extrae las coordenadas de un punto PostGIS en formato WKB
 * @param location Formato WKB de PostGIS (ej: 0101000020E6100000FB0DC97F377B21C0892A57D3501B4540)
 */
export function extractCoordinates(location: string): { lat: number; lng: number } {
  try {
    // Verificar que el string tenga el formato correcto
    if (!location.match(/^[0-9A-F]+$/i)) {
      throw new Error('El formato WKB debe ser un string hexadecimal');
    }

    // Convertir el string hex a buffer
    const buffer = Buffer.from(location, 'hex');
    
    // Parsear la geometría usando wkx
    const geometry = wkx.Geometry.parse(buffer);
    
    // Verificar que es un punto
    if (!(geometry instanceof wkx.Point)) {
      throw new Error('La geometría debe ser un punto');
    }

    // Extraer coordenadas
    const { x: lng, y: lat } = geometry;

    // Verificar que las coordenadas son válidas
    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Las coordenadas extraídas no son números válidos');
    }

    // Verificar rangos válidos
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new Error('Las coordenadas están fuera de los rangos válidos');
    }
    
    return { lat, lng };
  } catch (error) {
    console.error('Error al procesar WKB:', error);
    console.error('Valor WKB:', location);
    throw new Error(`Formato de ubicación WKB inválido: ${location}`);
  }
} 
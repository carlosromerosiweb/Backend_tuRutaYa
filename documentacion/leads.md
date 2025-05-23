#   IMPORTAR LEADS DE GOOGLE
POST /api/leads/import/google
    Body
        {
            "sector": "peluquerías",
            "lat": 42.2406,
            "lng": -8.7207,
            "radius": 5000,
            "limit": 3,
            "campaign_id": "123e4567-e89b-12d3-a456-426614174000"
        }

    Response
        {
            "success": true,
            "totalProcessed": 3,
            "newLeads": 3,
            "duplicateLeads": 0,
            "metadata": {
                "sector": "peluquerías",
                "location": {
                    "lat": 42.2406,
                    "lng": -8.7207
                },
                "radius": 5000,
                "limit": 3,
                "campaign_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }

#   IMPORTAR LEADS DE GOOLE POR ZONA Y SECTOR
POST /api/leads/import/zone
    Body
        {
            "sector": "fruteria",
            "zone_type": "city",
            "zone_name": "Vigo",
            "limit": 3,
            "campaign_id": "123e4567-e89b-12d3-a456-426614174000"
        }

    Response
        {
            "success": true,
            "totalProcessed": 3,
            "newLeads": 3,
            "duplicateLeads": 0,
            "metadata": {
                "sector": "fruteria",
                "zone_type": "city",
                "zone_name": "Vigo",
                "limit": 3,
                "campaign_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        }

#   LISTAR TODOS LOS LEADS
GET /api/leads
    Query Parameters
        status (opcional): Filtro por estado del lead ('pendiente', 'visitado', 'reprogramado', 'cancelado')

    Response
        [
            {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "Peluquería Ejemplo",
                "address": "Calle Ejemplo 123",
                "location": "SRID=4326;POINT(-8.7207 42.2406)",
                "place_id": "ChIJ...",
                "sector": "peluquerías",
                "campaign_id": "123e4567-e89b-12d3-a456-426614174000",
                "status": "pendiente",
                "priority": 3,
                "notes": "Notas del lead",
                "created_at": "2024-03-20T10:00:00Z",
                "updated_at": "2024-03-20T10:00:00Z",
                "assigned_team_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        ]

#   LISTAR LEADS POR EQUIPO
GET /api/leads/team/:teamId
    Path Parameters
        teamId: ID del equipo

    Query Parameters
        status (opcional): Filtro por estado del lead ('pendiente', 'visitado', 'reprogramado', 'cancelado')

    Response
        [
            {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "Peluquería Ejemplo",
                "address": "Calle Ejemplo 123",
                "location": "SRID=4326;POINT(-8.7207 42.2406)",
                "place_id": "ChIJ...",
                "sector": "peluquerías",
                "campaign_id": "123e4567-e89b-12d3-a456-426614174000",
                "status": "pendiente",
                "priority": 3,
                "notes": "Notas del lead",
                "created_at": "2024-03-20T10:00:00Z",
                "updated_at": "2024-03-20T10:00:00Z",
                "assigned_team_id": "123e4567-e89b-12d3-a456-426614174000"
            }
        ]
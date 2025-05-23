#   CREAR NUEVA CAMPAÑA
##  start date y end date son opcionales
POST /api/campaigns
    Body
        {
            "name": "Campaña Q1 2024",
            "description": "Campaña de ventas para el primer trimestre de 2024",
            "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
            "zones": ["Vigo"],
            "sectors": ["peluqueria", "informatica"],
            "start_date": "2024-01-01T00:00:00Z",
            "end_date": "2024-03-31T23:59:59Z"
        }      

    Response
        {
            "message": "Campaña creada exitosamente",
            "campaign": {
                "id": "75de8ab2-685d-41df-a011-e3064c268440",
                "name": "Campaña Q1 2024",
                "description": "Campaña de ventas para el primer trimestre de 2024",
                "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
                "zones": [
                    "Vigo"
                ],
                "sectors": [
                    "peluqueria",
                    "informatica"
                ],
                "start_date": "2024-01-01T00:00:00+00:00",
                "end_date": "2024-03-31T23:59:59+00:00",
                "status": "active",
                "created_at": "2025-05-23T11:36:51.724052+00:00",
                "updated_at": "2025-05-23T11:36:51.724052+00:00"
            }
        }

#   ASIGNAR CAMPAÑA A UN EQUIPO
POST /api/campaigns/assign
    Body
        {
           "campaign_id": "75de8ab2-685d-41df-a011-e3064c268440",
           "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d"      
        }

    Response
        {
            "message": "Campaña asignada exitosamente",
            "campaign": {
                "id": "75de8ab2-685d-41df-a011-e3064c268440",
                "name": "Campaña Q1 2024",
                "description": "Campaña de ventas para el primer trimestre de 2024",
                "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
                "zones": [
                    "Vigo"
                ],
                "sectors": [
                    "peluqueria",
                    "informatica"
                ],
                "start_date": "2024-01-01T00:00:00+00:00",
                "end_date": "2024-03-31T23:59:59+00:00",
                "status": "active",
                "created_at": "2025-05-23T11:36:51.724052+00:00",
                "updated_at": "2025-05-23T11:36:51.724052+00:00"
            }
        }
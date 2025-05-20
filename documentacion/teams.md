#   CREAR TEAM
##      user_ids es opcional. si no se pone nada, se creará el equipo sin usuarios
POST /api/teams
    Body
        {
            "name": "Nombre del Equipo 3",
            "user_ids": [1]
        }

    Response
        {
            "team": {
                "id": "8f45f148-e7a5-43d9-80bd-258ed15fd49e",
                "name": "Nombre del Equipo 3",
                "members": [
                    {
                        "id": 1,
                        "name": "Usuario prueba",
                        "email": "prueba",
                        "role_in_team": "member",
                        "joined_at": "2025-05-20T10:52:03.447+00:00"
                    }
                ]
            }
        }

#   AÑADIR MIEMBROS A UN TEAM
##  role_in_team es opcional. de hecho, dudo bastante que usemos esa propiedad, pero la dejo por si acaso, tú ignorala
POST /api/teams/:teamId/members
    Body
        {
            "user_ids": [3],
            "role_in_team": "member" 
        }

    Response
        {
            "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
            "members": [
                {
                    "id": 3,
                    "name": "Oda",
                    "email": "asd@asd.com",
                    "role_in_team": "member",
                    "joined_at": "2025-05-20T10:56:58.198+00:00"
                }
            ]
        }

#   AÑADIR LEADS A UN TEAM
POST /api/teams/:teamId/leads
    Body
        {
            "lead_ids": [
                "3c5e0357-0161-424a-8ffc-6fe49fb31bf4",
                "b0960c7c-35a6-459a-a9e4-653d9ff05956"
            ]
        }

    Response
        {
            "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
            "leads": [
                {
                    "id": "3c5e0357-0161-424a-8ffc-6fe49fb31bf4",
                    "name": "Santa Cruz Peluquería y Belleza UNISEX",
                    "address": "Rúa Manuel de Castro, 13, Bajo, Coia, 36210 Vigo, Pontevedra, Spain",
                    "status": "pendiente",
                    "assigned_team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
                    "updated_at": "2025-05-20T11:16:34.93997+00:00"
                },
                {
                    "id": "b0960c7c-35a6-459a-a9e4-653d9ff05956",
                    "name": "Joseba Gorkla Salón de peiteado",
                    "address": "Rúa Vázquez Varela, 1, Santiago de Vigo, 36204 Vigo, Pontevedra, Spain",
                    "status": "pendiente",
                    "assigned_team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
                    "updated_at": "2025-05-20T11:16:34.93997+00:00"
                }
            ]
        }
                

#   LISTAR TEAMS
GET /api/teams
    Response
        {
            "teams": [
                {
                    "id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
                    "name": "Nombre del Equipo 3",
                    "created_at": "2025-05-20T10:44:24.093946+00:00",
                    "members": [
                        {
                            "id": 3,
                            "name": "Oda",
                            "email": "asd@asd.com",
                            "role_in_team": "member",
                            "joined_at": "2025-05-20T10:56:58.198+00:00"
                        }
                    ]
                }
            ]
        }

#   LISTAR TEAM POR TEAMID
GET /api/teams/:teamId
    Response
        {
            "id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
            "name": "Nombre del Equipo 3",
            "created_at": "2025-05-20T10:44:24.093946+00:00",
            "members": [
                {
                    "id": 3,
                    "name": "Oda",
                    "email": "asd@asd.com",
                    "role_in_team": "member",
                    "joined_at": "2025-05-20T10:56:58.198+00:00"
                }
            ]
        }
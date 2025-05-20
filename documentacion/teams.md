#   CREAR TEAM
##      user_ids es opcional. si no se pone nada, se creará el equipo sin usuarios
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
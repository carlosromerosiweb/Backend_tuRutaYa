#   REGISTER
##  "roles" es opcional. por defecto, si no se entrega nada, se le asignará el valor de "vendedor"
POST /auth/register
    Body
        {
            "email": "prueba@prueba.com",
            "name": "Usuario prueba",
            "password": "Contraseña123!",
            "roles": ["vendedor", "user"] 
        }  

    Response
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoicHJ1ZWJhIiwicm9sZXMiOlsidmVuZGVkb3IiXSwidG9rZW5WZXJzaW9uIjoxLCJpYXQiOjE3NDc3MjgwNDQsImV4cCI6MTc0ODMzMjg0NH0.95RW9ehiJaxTqZQoGzKxprJqtIA3fFvApiVNBOf98qY",
            "user": {
                "id": 1,
                "email": "prueba@prueba.com",
                "name": "Usuario prueba",
                "roles": [
                    "vendedor"
                ]
            }
        }

#   LOGIN
## "identifier" acepta tanto nombre como email, cualquiera de los 2 es válido para este campo
POST /auth/login
    Body
        {
            "identifier": "Usuario prueba", 
            "password": "Contraseña123!"
        }

    Response
        {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoicHJ1ZWJhIiwicm9sZXMiOlsidmVuZGVkb3IiXSwidG9rZW5WZXJzaW9uIjoyLCJpYXQiOjE3NDc3MjgyNzAsImV4cCI6MTc0ODMzMzA3MH0.CCxOK4HwI2ljvV-0SVa6s7o6HOZ8ivQezhGNpgldIhQ",
            "user": {
                "id": 1,
                "email": "prueba@prueba.com",
                "name": "Usuario prueba",
                "roles": [
                    "vendedor"
                ]
            }
        }

#   OBTENER USUARIOS
GET /api/users
    Response
        [
            {
                "id": 4,
                "email": "sab@sab.com",
                "name": "Sabela",
                "roles": [
                    "vendedor"
                ],
                "created_at": "2025-05-20T11:17:57.601852+00:00"
            },
            {
                "id": 3,
                "email": "asd@asd.com",
                "name": "Oda",
                "roles": [
                    "admin"
                ],
                "created_at": "2025-05-20T10:37:59.430156+00:00"
            },
            {
                "id": 2,
                "email": "hola@hola.com",
                "name": "kojima",
                "roles": [
                    "vendedor"
                ],
                "created_at": "2025-05-20T09:23:49.138859+00:00"
            },
            {
                "id": 1,
                "email": "prueba",
                "name": "Usuario prueba",
                "roles": [
                    "vendedor"
                ],
                "created_at": "2025-05-20T08:00:44.208935+00:00"
            }
        ]

#   OBTENER USUARIO POR SESIÓN
GET /api/users/me
    Response
        {
            "id": 2,
            "email": "hola@hola.com",
            "name": "kojima",
            "roles": [
                "vendedor"
            ],
            "created_at": "2025-05-20T09:23:49.138859+00:00"
        }

#   OBTENER USUARIO POR ID
GET /api/users/3
    Response
        {
            "id": 3,
            "email": "asd@asd.com",
            "name": "Oda",
            "roles": [
                "admin"
            ],
            "created_at": "2025-05-20T10:37:59.430156+00:00"
        }
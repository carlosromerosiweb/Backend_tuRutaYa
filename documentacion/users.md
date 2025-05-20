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
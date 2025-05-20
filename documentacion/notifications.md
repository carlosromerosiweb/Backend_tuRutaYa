#   CREAR NOTIFICACION PARA USUARIO
POST /api/notifications
    Body
        {
            "user_id": 2,
            "type": "cita_cancelada",
            "title": "Cita cancelada",
            "message": "La cita en Peluquería Vane ha sido cancelada por el cliente"
        }

    Response
    {
        "id": "a2aae860-f7d5-4b6b-9061-548a668a6830",
        "user_id": 2,
        "type": "cita_cancelada",
        "title": "Cita cancelada",
        "message": "La cita en Peluquería Vane ha sido cancelada por el cliente",
        "read": false,
        "created_at": "2025-05-20T14:09:03.518314+00:00",
        "team_id": null
    }

#   CREAR NOTIFICACION PARA EQUIPO
POST /api/notificacions
    Body
        {
            "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
            "type": "mensaje_equipo",
            "title": "Nueva meta del equipo",
            "message": "El equipo debe alcanzar 100 ventas este mes"
        }

    Response
        {
            "id": "4710712b-398f-4f11-80a6-570fd731887b",
            "user_id": null,
            "type": "mensaje_equipo",
            "title": "Nueva meta del equipo",
            "message": "El equipo debe alcanzar 100 ventas este mes",
            "read": false,
            "created_at": "2025-05-20T14:25:15.36+00:00",
            "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d"
        }

#   OBTENER NOTIFICACIONES DE UN USUARIO
GET /api/notifications/users/:userId/notifications?limit=3
    Response
        [
            {
                "id": "191f143c-239e-43a9-811b-599229b54609",
                "user_id": 2,
                "type": "cita_cancelada",
                "title": "Cita cancelada",
                "message": "La cita en Peluquería Vane ha sido cancelada por el cliente",
                "read": false,
                "created_at": "2025-05-20T14:19:46.429245+00:00",
                "team_id": null
            },
            {
                "id": "a2aae860-f7d5-4b6b-9061-548a668a6830",
                "user_id": 2,
                "type": "cita_cancelada",
                "title": "Cita cancelada",
                "message": "La cita en Peluquería Vane ha sido cancelada por el cliente",
                "read": false,
                "created_at": "2025-05-20T14:09:03.518314+00:00",
                "team_id": null
            }
        ]

#   OBTENER NOTIFICACIONES DE UN EQUIPO
GET /api/notifications/teams/:teamId/notifications?limit=3
    Response
        [
            {
                "id": "4710712b-398f-4f11-80a6-570fd731887b",
                "user_id": null,
                "type": "mensaje_equipo",
                "title": "Nueva meta del equipo",
                "message": "El equipo debe alcanzar 100 ventas este mes",
                "read": false,
                "created_at": "2025-05-20T14:25:15.36+00:00",
                "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d"
            }
        ]

#   MARCAR NOTIFICACIÓN COMO LEÍDA
PATCH /api/notifications/:notificationId/read
    Response
        {
            "message": "Notificación marcada como leída"
        }
#   CREAR CHECKIN
POST /api/checkins
    Body
        {
            "user_id": 1,
            "lead_id": "3c5e0357-0161-424a-8ffc-6fe49fb31bf4",
            "status": "realizada",
            "notes": "Cliente muy interesado en el producto",
            "lat": 42.2406,
            "lng": -8.7207
        }

    Response
        {
            "success": true,
            "checkin": {
                "id": "9aa1f152-84ac-4709-825f-113d30cc0517",
                "user_id": 1,
                "lead_id": "3c5e0357-0161-424a-8ffc-6fe49fb31bf4",
                "route_id": null,
                "checked_in_at": "2025-05-20T13:43:16.643+00:00",
                "status": "realizada",
                "notes": "Cliente muy interesado en el producto",
                "lat": 42.2406,
                "lng": -8.7207,
                "created_at": "2025-05-20T13:43:16.818736+00:00"
            }
        }
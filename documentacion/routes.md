#   OBTENER LA RUTA DE UN TEAM (en coche)
GET /api/teams/:teamId/optimized-route
    Response
        {
            "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
            "total_distance_km": 7.7,
            "total_duration_min": 22,
            "waypoint_order": [
                0,
                1
            ],
            "ordered_leads": [
                {
                    "id": "3c5e0357-0161-424a-8ffc-6fe49fb31bf4",
                    "name": "Santa Cruz Peluquería y Belleza UNISEX",
                    "address": "Rúa Manuel de Castro, 13, Bajo, Coia, 36210 Vigo, Pontevedra, Spain",
                    "lat": 42.2134041,
                    "lng": -8.7406578
                },
                {
                    "id": "b0960c7c-35a6-459a-a9e4-653d9ff05956",
                    "name": "Joseba Gorkla Salón de peiteado",
                    "address": "Rúa Vázquez Varela, 1, Santiago de Vigo, 36204 Vigo, Pontevedra, Spain",
                    "lat": 42.2332367,
                    "lng": -8.7141215
                }
            ],
            "segments": [
                {
                    "from_lead_name": "Plaza España",
                    "to_lead_name": "Santa Cruz Peluquería y Belleza UNISEX",
                    "distance_km": 2.9,
                    "duration_min": 8
                },
                {
                    "from_lead_name": "Santa Cruz Peluquería y Belleza UNISEX",
                    "to_lead_name": "Joseba Gorkla Salón de peiteado",
                    "distance_km": 4,
                    "duration_min": 10
                },
                {
                    "from_lead_name": "Joseba Gorkla Salón de peiteado",
                    "to_lead_name": "Plaza España",
                    "distance_km": 0.8,
                    "duration_min": 3
                }
            ],
            "polyline": "k}v`Gb`ft@LVLDJ?JGBATLf@Th@V~@b@lB|@L?ZN~GdDzAp@JFHPJFD?V\\rC|D~JvNTf@p@vBnE|Ox@pC`@jAR`AJfADtBBtDIn@MFMPITA\\D^JRTPZBNEJKHQBKfD|AlGlCnHjDp@f@tDdDnLlKJt@^dBHNDNBFHTTbABLLlA?\\I~@K`@OTmAz@QJSs@Rr@KFkEpCA?A?C@C@CDADoBnBwArAsDxC]N{BT_CPO?WCCCIKIEGA]qCcByMkAoJkAkJSeBc@kEGGYsBQy@m@aEQs@?w@Am@Ek@Cu@EgGEuAQoAUuAgB{GmEwOq@uA}A_C_GoImD_Fa@q@MKI?iEsBwEwBa@OMAk@Uo@YgCkAiCmAaAe@e@[]WyCuAcIuDyFkCk@Ye@QVw@hAaE`AiDH[Ja@DHHFLFVHpA^Ux@q@`Cm@vBw@lCUz@CNnAj@xBhArLjF~@j@f@TxB`A@FBF"
        }

#   OBTENER LA RUTA DE UN TEAM ANDANDO
GET /api/teams/:teamId/walking-route
    Response
        {
            "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
            "transport_mode": "walking",
            "total_distance_km": 6.9,
            "total_duration_min": 100,
            "waypoint_order": [
                1,
                0
            ],
            "ordered_leads": [
                {
                    "id": "b0960c7c-35a6-459a-a9e4-653d9ff05956",
                    "name": "Joseba Gorkla Salón de peiteado",
                    "address": "Rúa Vázquez Varela, 1, Santiago de Vigo, 36204 Vigo, Pontevedra, Spain",
                    "lat": 42.2332367,
                    "lng": -8.7141215
                },
                {
                    "id": "3c5e0357-0161-424a-8ffc-6fe49fb31bf4",
                    "name": "Santa Cruz Peluquería y Belleza UNISEX",
                    "address": "Rúa Manuel de Castro, 13, Bajo, Coia, 36210 Vigo, Pontevedra, Spain",
                    "lat": 42.2134041,
                    "lng": -8.7406578
                }
            ],
            "segments": [
                {
                    "from_lead_name": "Plaza España",
                    "to_lead_name": "Joseba Gorkla Salón de peiteado",
                    "distance_km": 0.7,
                    "duration_min": 9
                },
                {
                    "from_lead_name": "Joseba Gorkla Salón de peiteado",
                    "to_lead_name": "Santa Cruz Peluquería y Belleza UNISEX",
                    "distance_km": 3.4,
                    "duration_min": 47
                },
                {
                    "from_lead_name": "Santa Cruz Peluquería y Belleza UNISEX",
                    "to_lead_name": "Plaza España",
                    "distance_km": 2.8,
                    "duration_min": 43
                }
            ],
            "polyline": "k}v`Gb`ft@CGAQBMFODEmA{FAUe@sBGUs@gD_AyDiBs@aFaB}DqA|DpA`F`BhBr@~@xDz@|Dr@xCXl@x@vDB?H@LJHZ@J`@Hv@\\lCnARHHNlClAjGrCh@XL@NPZh@lD~E~FnI|A~Bp@tAxAdFrBpHfBzGLPJ^Hb@L|@FfADnGBn@FBJJHPDZ?\\EPMVABLZNJZj@l@hAlAvBfCfExChFvBlDxA|Br@hA~GdL~BxDTXLHlEqC\\SQu@Pt@]RkEpCC?KIUYcGyJmD}F{BoDwBmDaCeEiB{CcCgEm@iA[k@OKM[DGJWBM?]E]IOKKOGUAE@Fm@AsBAaAEuBKgASaAa@kAy@qCoE}Oq@wBUg@oGaJcGsIW]OEKOAEIE{Aq@gEqBsBcAM?y@_@qAm@sBaAUMGDKBG?MEGIEM"
        }

#   DISTRIBUIR LA RUTA DE UN EQUIPO ENTRE COMERCIALES
POST /api/teams/:teamId/distribute-route
    Body
        {
            "user_ids": [1, 2, 3]
        }
    Otro Body
        {
            "num_commercials": 2
        }

    Response
        {
            "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
            "distributed_routes": [
                {
                    "user_id": 3,
                    "total_duration_min": 19,
                    "total_distance_km": 8.6,
                    "leads": [
                        {
                            "id": "3c5e0357-0161-424a-8ffc-6fe49fb31bf4",
                            "lat": 42.2134041,
                            "lng": -8.7406578,
                            "name": "Santa Cruz Peluquería y Belleza UNISEX",
                            "address": "Rúa Manuel de Castro, 13, Bajo, Coia, 36210 Vigo, Pontevedra, Spain"
                        },
                        {
                            "id": "a76c99ff-7a3b-4e5a-89bb-977382d53cab",
                            "lat": 42.2002479,
                            "lng": -8.7632465,
                            "name": "Lola & Lía",
                            "address": "Camiño dos Muiños, 19, 36213 Vigo, Pontevedra, Spain"
                        },
                        {
                            "id": "f6a12d1a-e6da-4f8a-8772-5a5bca619cf0",
                            "lat": 42.2130353,
                            "lng": -8.7376358,
                            "name": "Maria Amoedo Estilistas",
                            "address": "Av. de Balaídos, 70, Coia, 36210 Vigo, Pontevedra, Spain"
                        }
                    ],
                    "segments": [
                        {
                            "distance_km": 2.9,
                            "duration_min": 8,
                            "to_lead_name": "Santa Cruz Peluquería y Belleza UNISEX",
                            "from_lead_name": "Plaza España"
                        },
                        {
                            "distance_km": 2.8,
                            "duration_min": 6,
                            "to_lead_name": "Lola & Lía",
                            "from_lead_name": "Santa Cruz Peluquería y Belleza UNISEX"
                        },
                        {
                            "distance_km": 2.9,
                            "duration_min": 5,
                            "to_lead_name": "Maria Amoedo Estilistas",
                            "from_lead_name": "Lola & Lía"
                        }
                    ]
                },
                {
                    "user_id": 2,
                    "total_duration_min": 21,
                    "total_distance_km": 8.1,
                    "leads": [
                        {
                            "id": "94ae25fa-5128-4fa7-8f0c-77343f905965",
                            "lat": 42.2353823,
                            "lng": -8.7305922,
                            "name": "Restaurante Reposo",
                            "address": "Rúa do Conde de Torrecedeira, 1, 36202 Vigo, Pontevedra, Spain"
                        },
                        {
                            "id": "d8f3efca-3712-4359-982a-f761c3df74b8",
                            "lat": 42.2413798,
                            "lng": -8.728214099999999,
                            "name": "Albatros Restaurante-Terraza-Bar",
                            "address": "36202 Vigo, Pontevedra, Spain"
                        },
                        {
                            "id": "ba1384d8-c5f3-4a0e-9903-e58b09052d2f",
                            "lat": 42.2382031,
                            "lng": -8.7104774,
                            "name": "Restaurante Casa Marco",
                            "address": "Rúa de García Barbón, 123, Santiago de Vigo, 36201 Vigo, Pontevedra, Spain"
                        },
                        {
                            "id": "b0960c7c-35a6-459a-a9e4-653d9ff05956",
                            "lat": 42.2332367,
                            "lng": -8.7141215,
                            "name": "Joseba Gorkla Salón de peiteado",
                            "address": "Rúa Vázquez Varela, 1, Santiago de Vigo, 36204 Vigo, Pontevedra, Spain"
                        }
                    ],
                    "segments": [
                        {
                            "distance_km": 3.1,
                            "duration_min": 10,
                            "to_lead_name": "Restaurante Reposo",
                            "from_lead_name": "Maria Amoedo Estilistas"
                        },
                        {
                            "distance_km": 1.1,
                            "duration_min": 3,
                            "to_lead_name": "Albatros Restaurante-Terraza-Bar",
                            "from_lead_name": "Restaurante Reposo"
                        },
                        {
                            "distance_km": 3.9,
                            "duration_min": 8,
                            "to_lead_name": "Restaurante Casa Marco",
                            "from_lead_name": "Albatros Restaurante-Terraza-Bar"
                        }
                    ]
                }
            ]
        }

#   OBTENER RUTAS DE UN COMERCIAL  
GET /api/teams/assigned-routes/:userId
    Body
        {
            "user_id": 2,
            "assigned_routes": [
                {
                    "id": "ea3d5fe6-d857-4efc-97d5-b48314193af6",
                    "user_id": 2,
                    "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
                    "assigned_date": "2025-05-22",
                    "leads": [
                        {
                            "id": "94ae25fa-5128-4fa7-8f0c-77343f905965",
                            "lat": 42.2353823,
                            "lng": -8.7305922,
                            "name": "Restaurante Reposo",
                            "address": "Rúa do Conde de Torrecedeira, 1, 36202 Vigo, Pontevedra, Spain"
                        },
                        {
                            "id": "d8f3efca-3712-4359-982a-f761c3df74b8",
                            "lat": 42.2413798,
                            "lng": -8.728214099999999,
                            "name": "Albatros Restaurante-Terraza-Bar",
                            "address": "36202 Vigo, Pontevedra, Spain"
                        },
                        {
                            "id": "ba1384d8-c5f3-4a0e-9903-e58b09052d2f",
                            "lat": 42.2382031,
                            "lng": -8.7104774,
                            "name": "Restaurante Casa Marco",
                            "address": "Rúa de García Barbón, 123, Santiago de Vigo, 36201 Vigo, Pontevedra, Spain"
                        },
                        {
                            "id": "b0960c7c-35a6-459a-a9e4-653d9ff05956",
                            "lat": 42.2332367,
                            "lng": -8.7141215,
                            "name": "Joseba Gorkla Salón de peiteado",
                            "address": "Rúa Vázquez Varela, 1, Santiago de Vigo, 36204 Vigo, Pontevedra, Spain"
                        }
                    ],
                    "total_duration_min": 21,
                    "total_distance_km": 8.1,
                    "created_at": "2025-05-22T08:18:52.55+00:00",
                    "team": {
                        "id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
                        "name": "Nombre del Equipo 3"
                    }
                }
            ]
        }

#   CALCULAR NÚMERO ÓPTIMO DE COMERCIALES
POST /api/teams/:teamId/calculate-commercials
    Body
        {
            "target_duration_min":15
        }

    Response
       {
            "team_id": "055430b9-b8ea-4476-aae5-102f87b98e4d",
            "total_duration_min": 51,
            "target_duration_min": 15,
            "recommended_commercials": 4,
            "estimated_distribution": [
                {
                    "commercial_number": 1,
                    "estimated_duration_min": 14,
                    "estimated_leads": 3
                },
                {
                    "commercial_number": 2,
                    "estimated_duration_min": 10,
                    "estimated_leads": 3
                },
                {
                    "commercial_number": 3,
                    "estimated_duration_min": 16,
                    "estimated_leads": 3
                },
                {
                    "commercial_number": 4,
                    "estimated_duration_min": 11,
                    "estimated_leads": 2
                }
            ],
            "distribution_quality": {
                "max_deviation_min": 5,
                "avg_deviation_min": 2.75,
                "is_balanced": false
            }
        }
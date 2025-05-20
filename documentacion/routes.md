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

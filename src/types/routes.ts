export interface OptimizedRouteResponse {
  team_id: string;
  transport_mode: 'driving' | 'walking';
  total_distance_km: number;
  total_duration_min: number;
  waypoint_order: number[];
  ordered_leads: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  }[];
  segments: {
    from_lead_name: string;
    to_lead_name: string;
    distance_km: number;
    duration_min: number;
  }[];
  polyline?: string;
}

export interface GoogleDirectionsResponse {
  status: string;
  routes: {
    legs: {
      distance: {
        value: number; // metros
        text: string;
      };
      duration: {
        value: number; // segundos
        text: string;
      };
      start_address: string;
      end_address: string;
    }[];
    overview_polyline: {
      points: string;
    };
    waypoint_order: number[];
  }[];
} 
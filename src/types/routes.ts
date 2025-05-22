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

export interface DistributeRouteRequest {
  user_ids?: number[];
  num_commercials?: number;
}

export interface DistributedRouteSegment {
  user_id: number;
  total_duration_min: number;
  total_distance_km: number;
  leads: OptimizedRouteResponse['ordered_leads'];
  segments: OptimizedRouteResponse['segments'];
}

export interface DistributeRouteResponse {
  team_id: string;
  distributed_routes: DistributedRouteSegment[];
} 
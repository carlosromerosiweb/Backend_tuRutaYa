export interface GooglePlacesResponse {
  results: GooglePlaceResult[];
  status: string;
  next_page_token?: string;
}

export interface GooglePlaceResult {
  name: string;
  vicinity?: string;
  formatted_address?: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  place_id: string;
  opening_hours?: {
    weekday_text?: string[];
  };
}

export interface GooglePlaceDetailsResponse {
  result: {
    name: string;
    formatted_address?: string;
    opening_hours?: {
      weekday_text?: string[];
    };
  };
  status: string;
}

export interface ImportLeadsRequest {
  sector: string;
  lat: number;
  lng: number;
  radius: number;
  limit: number;
  campaign_id: string;
}

export interface ImportLeadsResponse {
  totalProcessed: number;
  newLeads: number;
  duplicateLeads: number;
}

export interface Lead {
  name: string;
  address: string;
  location: string;
  place_id: string;
  sector: string;
  campaign_id: string;
  status: string;
  opening_hours: string[];
  created_at: Date;
  updated_at: Date;
  assigned_team_id?: string;
} 
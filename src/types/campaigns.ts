export interface Campaign {
    id: string;
    name: string;
    description?: string;
    team_id: string;
    zones: string[];
    sectors: string[];
    start_date?: Date;
    end_date?: Date;
    status: 'active' | 'inactive' | 'completed';
    created_at: Date;
    updated_at: Date;
}

export interface CreateCampaignRequest {
    name: string;
    description?: string;
    team_id: string;
    zones: string[];
    sectors: string[];
    start_date?: Date;
    end_date?: Date;
}

export interface AssignCampaignRequest {
    campaign_id: string;
    team_id: string;
}

export interface CampaignWithTeam extends Campaign {
    team: {
        id: string;
        name: string;
    };
}

export interface CampaignsResponse {
    campaigns: CampaignWithTeam[];
    total: number;
} 
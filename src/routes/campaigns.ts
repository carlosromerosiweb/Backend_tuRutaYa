import { Router, Request, Response } from 'express';
import { supabase } from '../utils/supabaseClient';
import { CreateCampaignRequest, AssignCampaignRequest, CampaignsResponse } from '../types/campaigns';

const router = Router();

// Crear una nueva campaña
router.post('/', async (req: Request, res: Response) => {
    try {
        const campaignData: CreateCampaignRequest = req.body;

        // Validar datos requeridos
        if (!campaignData.name || !campaignData.team_id) {
            return res.status(400).json({
                error: 'El nombre de la campaña y el ID del equipo son requeridos'
            });
        }

        // Verificar que el equipo existe
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id')
            .eq('id', campaignData.team_id)
            .single();

        if (teamError || !team) {
            return res.status(404).json({
                error: 'El equipo especificado no existe'
            });
        }

        // Crear la campaña
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .insert([{
                name: campaignData.name,
                description: campaignData.description,
                team_id: campaignData.team_id,
                zones: campaignData.zones || [],
                sectors: campaignData.sectors || [],
                start_date: campaignData.start_date,
                end_date: campaignData.end_date,
                status: 'active'
            }])
            .select()
            .single();

        if (campaignError) {
            throw campaignError;
        }

        return res.status(201).json({
            message: 'Campaña creada exitosamente',
            campaign
        });

    } catch (error) {
        console.error('Error al crear campaña:', error);
        return res.status(500).json({
            error: 'Error al crear la campaña',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

// Asignar una campaña a un equipo
router.post('/assign', async (req: Request, res: Response) => {
    try {
        const { campaign_id, team_id }: AssignCampaignRequest = req.body;

        // Validar datos requeridos
        if (!campaign_id || !team_id) {
            return res.status(400).json({
                error: 'El ID de la campaña y el ID del equipo son requeridos'
            });
        }

        // Verificar que la campaña existe
        const { data: campaign, error: campaignError } = await supabase
            .from('campaigns')
            .select('id')
            .eq('id', campaign_id)
            .single();

        if (campaignError || !campaign) {
            return res.status(404).json({
                error: 'La campaña especificada no existe'
            });
        }

        // Verificar que el equipo existe
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id')
            .eq('id', team_id)
            .single();

        if (teamError || !team) {
            return res.status(404).json({
                error: 'El equipo especificado no existe'
            });
        }

        // Actualizar la campaña con el nuevo equipo
        const { data: updatedCampaign, error: updateError } = await supabase
            .from('campaigns')
            .update({ team_id })
            .eq('id', campaign_id)
            .select()
            .single();

        if (updateError) {
            throw updateError;
        }

        return res.json({
            message: 'Campaña asignada exitosamente',
            campaign: updatedCampaign
        });

    } catch (error) {
        console.error('Error al asignar campaña:', error);
        return res.status(500).json({
            error: 'Error al asignar la campaña',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

// Obtener todas las campañas
router.get('/', async (req: Request, res: Response) => {
    try {
        const { data: campaigns, error, count } = await supabase
            .from('campaigns')
            .select(`
                *,
                team:teams (
                    id,
                    name
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        const response: CampaignsResponse = {
            campaigns: campaigns || [],
            total: count || 0
        };

        return res.json(response);

    } catch (error) {
        console.error('Error al obtener campañas:', error);
        return res.status(500).json({
            error: 'Error al obtener las campañas',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

// Obtener una campaña por ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const { data: campaign, error } = await supabase
            .from('campaigns')
            .select(`
                *,
                team:teams (
                    id,
                    name
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({
                    error: 'Campaña no encontrada'
                });
            }
            throw error;
        }

        return res.json(campaign);

    } catch (error) {
        console.error('Error al obtener campaña:', error);
        return res.status(500).json({
            error: 'Error al obtener la campaña',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

// Obtener campañas por equipo
router.get('/team/:teamId', async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params;

        // Verificar que el equipo existe
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id')
            .eq('id', teamId)
            .single();

        if (teamError || !team) {
            return res.status(404).json({
                error: 'El equipo especificado no existe'
            });
        }

        const { data: campaigns, error, count } = await supabase
            .from('campaigns')
            .select(`
                *,
                team:teams (
                    id,
                    name
                )
            `, { count: 'exact' })
            .eq('team_id', teamId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        const response: CampaignsResponse = {
            campaigns: campaigns || [],
            total: count || 0
        };

        return res.json(response);

    } catch (error) {
        console.error('Error al obtener campañas del equipo:', error);
        return res.status(500).json({
            error: 'Error al obtener las campañas del equipo',
            details: error instanceof Error ? error.message : 'Error desconocido'
        });
    }
});

export default router; 
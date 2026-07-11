import type { Request, Response } from 'express';
import { eventRepo } from '@gameInfoHub/db';

export async function getActiveEvents(_req: Request, res: Response): Promise<void> {
    const rows = await eventRepo.findActive();
    res.json(rows);
}

export async function createEvent(req: Request, res: Response): Promise<void> {
    console.log('[createEvent] body:', JSON.stringify(req.body));
    const { game_name, event_name, event_type, start_time, end_time } = req.body ?? {};
    if (!game_name || !event_name || !event_type || !start_time || !end_time) {
        res.status(400).json({error: 'Missing required fields'});
        return;
    }
    const [created] = await eventRepo.create({
        game_name,
        event_name,
        event_type,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
        still_active: true,
    });
    res.status(201).json(created);
}
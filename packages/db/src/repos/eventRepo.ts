import { eq } from 'drizzle-orm';
import { db } from '../client.js';
import { event_details, events, type EventInsert, type EventUpdate } from '../schema/index.js';

export const eventRepo = {
    create: (data: EventInsert) => {
        return db.insert(events).values(data).returning();
    },
    update: (id:string, data:EventUpdate) => {
        return db.update(events).set(data).where(eq(events.id, id)).returning();
    },
    findById: (id: string) => {
        return db.select().from(events).where(eq(events.id, id));
    },
    findActive: () => {
        return db.select().from(events).where(eq(events.still_active, true));
    },

    // Join specific queries. Combining the details from event_details with the events info
    findAllWithDetails: () => 
        db.select({
            id: events.id,
            game_name: events.game_name,
            event_name: events.event_name,
            event_type: events.event_type,
            start_time: events.start_time,
            end_time: events.end_time,
            description: event_details.event_description,
            rewards: event_details.event_rewards,
            still_active: events.still_active,
        })
        .from(events)
        .leftJoin(event_details, eq(event_details.source_event_id, events.id)),
    findByIdWithDetails: (id: string) => 
        db.select({
            id: events.id,
            game_name: events.game_name,
            event_name: events.event_name,
            event_type: events.event_type,
            start_time: events.start_time,
            end_time: events.end_time,
            description: event_details.event_description,
            rewards: event_details.event_rewards,
            still_active: events.still_active,
        })
        .from(events)
        .leftJoin(event_details, eq(event_details.source_event_id, events.id))
        .where(eq(events.id, id)),
};
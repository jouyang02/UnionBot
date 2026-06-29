import { eq, ilike, sql } from 'drizzle-orm';
import { db } from '../client.js';
import { event_details, type EventDetailInsert, type EventDetailUpdate} from '../schema/index.js';

export const eventDetailRepo = {
    create: (data: EventDetailInsert) => {
        return db.insert(event_details).values(data).returning();
    },

    update: (sourceEventId: string, data: EventDetailUpdate) => {
        return db.update(event_details).set(data)
            .where(eq(event_details.source_event_id, sourceEventId))
            .returning();
    },

    findBySourceEventId: (sourceEventId: string) => {
        return db.select().from(event_details)
            .where(eq(event_details.source_event_id, sourceEventId));
    },

    searchByAllRewards: (rewards: string[]) => {
        return db.select({source_event_id: event_details.source_event_id})
            .from(event_details)
            .where(sql`${event_details.event_rewards} @> ${rewards}`);
    },

    searchByAnyReward: (rewards: string[]) => {
        return db.select({source_event_id: event_details.source_event_id})
            .from(event_details)
            .where(sql`${event_details.event_rewards} && ${rewards}`);
    },
}
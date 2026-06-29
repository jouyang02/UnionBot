import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";


// ======================================================================
// Defines what an event is. Events can be from several different games, therefore it is a generic description of an event
// Events table has the following columns: 
// * id {uuid of the data in table}
// * game_name {Title of the game event is from}
// * event_name {The title of the event, the full name of the events listed in the game}
// * event_type {Whether or not the game is a permanent event (no end_time) or a limited time event (with end_time)}
// ======================================================================
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    game_name: varchar('game_name', {length: 255}).notNull(),
    event_name: varchar('event_name', {length: 255}).notNull(),
    event_type: varchar('event_type', {length: 255}).notNull(),
    start_time: timestamp('start_time', {withTimezone: true}).notNull(),
    end_time: timestamp('end_time', {withTimezone: true}).notNull(),
    still_active: boolean('still_active').notNull().default(true),
});

// =====================================================================
// TypeScript Inferred Types for editting the events table
// =====================================================================
export type EventRow = typeof events.$inferSelect;
export type EventInsert = typeof events.$inferInsert;
export type EventUpdate = Partial<EventInsert>;

// =========================================================================
// Defines the extended datas for each event
// Linked to events via source_event_id (as foreign key). 
// Event_Details Table has the following columns:
// * id {uuid of the event details in this table}
// * source_event_id {Foreign Key relating it back to the event table, linking them}
// * event_description { Short explanation of the event }
// * event_rewards { The expected total rewards from completing the events }
// * start_time, end_time { Timestamp details of the events, start date and end date }
// * still_active { Whether the event is still live or has already ended using boolean }
// ===========================================================================
export const event_details = pgTable('event_details', {
    source_event_id: uuid('source_event_id')
        .primaryKey()
        .references(() => events.id, {onDelete: 'cascade'}),
    event_description: text('event_description'),
    event_rewards: text('event_rewards').array(),
});

// ============================================================================================================
// TypeScript Inferred Types for editting the event_details table
// ============================================================================================================

export type EventDetailRow = typeof event_details.$inferSelect;
export type EventDetailInsert = typeof event_details.$inferInsert;
export type EventDetailUpdate = Partial<EventDetailInsert>;

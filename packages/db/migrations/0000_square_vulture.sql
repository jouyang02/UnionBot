CREATE TABLE "event_details" (
	"source_event_id" uuid PRIMARY KEY NOT NULL,
	"event_description" text,
	"event_rewards" text []
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_name" varchar(255) NOT NULL,
	"event_name" varchar(255) NOT NULL,
	"event_type" varchar(255) NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"still_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_details"
ADD CONSTRAINT "event_details_source_event_id_events_id_fk" FOREIGN KEY ("source_event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
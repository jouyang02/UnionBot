import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const connectionURL = process.env.DATABASE_URL! as string;

if (!connectionURL) {
    throw new Error(
        "[database] Missing Database URL. \n" +
        "Importing app must call dotenv.config() before importing @gameInfoHub/db."
    );
}

// Setting up client and wrapping drizzle's type query builder driver to database.
// {prepare: false} is needed for Supabase transaction pooler to prevent error.
const client = postgres(connectionURL, {prepare: false});

// Allows the databased to be accessed anywhere in our monorepo.
export const db = drizzle(client,{schema, logger:true});
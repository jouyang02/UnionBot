// Exporting the database driver for the rest of the app to use.
export { db } from './client.js';
// Exporting all the schemas for the database tables
export * from './schema/index.js';
// Exporting drizzle database queries for CRUD.
export { eventRepo } from './repos/eventRepo.js';
export { eventDetailRepo } from './repos/eventDetailRepo.js';


// import dotenv from "dotenv";
import 'dotenv/config';
import express from "express";
import cors, {CorsOptions} from "cors";
import path from "path";
import { fileURLToPath } from 'node:url';
import axios from "axios";
import { errorHandler } from './middleware/error.js';
import eventsRoutes from './routes/eventRoute.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config({
//     path: path.resolve(__dirname,".env")
// });

const port: number = Number(process.env.PORT) || 3000;

const app = express();

const corsOptions: CorsOptions = {
    origin: ["http://localhost:3000"], // Allowed origins to access server
    allowedHeaders: ["Content-Type", "Authorization"], // 
    credentials: true,                  //Allowed cookies and auth headers
}

// CORS setup with options
app.use(cors(corsOptions));
app.use(express.json());

// Discord Bot Event handling (create and read active events)
app.use('/api/events', eventsRoutes);

// Error Handling in Express Server
app.use(errorHandler);

// Starts express server on port 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
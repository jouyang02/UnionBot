import express from "express";
import cors, {CorsOptions} from "cors";
import dotenv from "dotenv";
import path from "path";
import axios from "axios";
import mongoose from "mongoose";

dotenv.config({
    path: path.resolve(__dirname,".env")
});

const port: number = Number(process.env.PORT) || 3000;
const db_uri: string | undefined = process.env.MONGODB_URI;

const app = express();

const corsOptions: CorsOptions = {
    origin: ["http://localhost:3000"], // Allowed origins to access server
    allowedHeaders: ["Content-Type", "Authorization"], // 
    credentials: true,                  //Allowed cookies and auth headers
}

// CORS setup with options
app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection using mongoose
if (!db_uri) {
    throw new Error("Missing MONGO URI for connection");
}
const db_name: string = "gameinfohub_db";
mongoose.connect(db_uri);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
db.on('connected', () => 
    console.log(`Connected to ${db_name} Database`));

// Starts express server on port 3000
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
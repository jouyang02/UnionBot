import axios from 'axios';

// Check if the current phase is in development or prod
const isDevelopment = (): boolean => {
    return (process.env.NODE_ENV ?? "DEVELOPMENT").trim().toLowerCase() === 'development';
};

// Picks the BaseURL based on which environment it is in
const resolveBaseURL = (): string => {
    if (isDevelopment()) {
        return process.env.SERVER_URL_DEV ?? 'http://localhost:3000';
    }
    const prodURL = process.env.SERVER_URL_PROD;
    if (!prodURL) {
        throw new Error("SERVER_URL_PROD error: [undefined]");
    }
    return prodURL;
};

// Setup the HTTP serverClient
export const serverClient = axios.create({
    baseURL: resolveBaseURL(),
    timeout: 10000,
    headers: { 'bot-service-token': process.env.SERVICE_SECRET! },
});

// Environment checking
console.log('[serverClient] baseURL:', serverClient.defaults.baseURL);
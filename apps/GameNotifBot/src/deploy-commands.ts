import { REST, RESTPostAPIApplicationCommandsJSONBody, RESTPostAPIApplicationCommandsResult, Routes, SlashCommandBuilder } from 'discord.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

// Resolve __dirname for ESM using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Importing environment variables
dotenv.config();
const discordToken = process.env.DISCORD_TOKEN!;
const guildID = process.env.DISCORD_GUILD_ID!;
const clientID = process.env.DISCORD_CLIENT_ID!;

// Development vs Production 
const isTS: boolean = (process.env.NODE_ENV === "DEVELOPMENT");
const fileExt = isTS ? '.ts' : '.js';
console.log(fileExt);

// The command array, for all the commands
const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];

// Directory Paths
const commandsDirPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsDirPath);

// Loops to locate all command files from the command directory
for (const folder of commandFolders) {
    const commandsPath = path.join(commandsDirPath, folder);
    const commandFiles = fs.readdirSync(commandsPath)
        .filter((file) => file.endsWith(fileExt));
    // Grabs the SlashCommandBuilder#toJSON() output of each commands for deployment
    for (const file of commandFiles){
        const filePath = path.join(commandsPath, file);
        const component = await import(filePath);
        const command = component.default;
        
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        }else{
            console.log(`[WARNING] The command at ${filePath} is missing required "data" or "execute" property. `);
        }
    }
}

// Constructing and preparing an instance of the REST Module
const rest = new REST({version: '10'}).setToken(discordToken);

// Registers the slash commands through discord js' REST Wrapper and deploy the commands
(async () => {
    try{
        console.log(`Started refreshing ${commands.length} applications (/) commands.`);
        const data = await rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands }) as RESTPostAPIApplicationCommandsResult[];
        console.log(`Successfully reloaded ${data.length}`);
    }catch (error) {
        console.error(error);
    }
})();

// ARCHIVED CODE FOR VIEWING

import dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SlashCommand } from './interfaces/SlashCommand.js';
import { Client, Collection, Events, GatewayIntentBits, Interaction, MessageFlags } from 'discord.js';

dotenv.config();

//Create __dirname for ESM using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Setting up the commands array for clients
client.commands = new Collection<string, SlashCommand>();
// Setting up a command cooldown array for clients
client.cooldowns = new Collection<string, Collection<string, number>>();

// Development vs Production : NO LONGER NEED WITH ESM
const isTS: boolean = (process.env.NODE_ENV === "DEVELOPMENT");
const fileExt = isTS ? '.ts' : '.js';
console.log(fileExt);

// Paths for extracting commands
const commandsDirPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsDirPath);


// Loops to extracts the .ts command files (for development ) & .js command files (prod)
for (const folder of commandFolders) {
    const commandsPath = path.join(commandsDirPath, folder);
    const commandFiles = fs.readdirSync(commandsPath)
        .filter((file) => file.endsWith(fileExt));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const component = await import(filePath);
        const command = component.default;
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
        }else{
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

// Dynamically Retrieving all the event files
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith(fileExt));

// Loops for extracting events files
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const component = await import(filePath);
    const event = component.default;
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
};


// Logging Bot in...
client.login(process.env.DISCORD_TOKEN!);

process.on("SIGINT", async () => {
  console.log("\n Shutting down bot...");
  await client.destroy();
  process.exit(0);
});


// ARCHIVE CODE FOR VIEWING

// Getting Client Ready. Only ran once
// client.once(Events.ClientReady,() => {
//     console.log(`${client.user?.username} is online`);
// });


// Creating the slash command interactions and readying to receive command interactions
// client.on(Events.InteractionCreate, async (interaction: Interaction) => {
//     if (!interaction.isChatInputCommand()) return;
//     const command = interaction.client.commands.get(interaction.commandName);

//     if (!command) {
//         console.error();
//         return;
//     }

//     try {
//         await command.execute(interaction);
//     }catch (error) {
//         console.error(error);
//         if (interaction.replied || interaction.deferred){
//             await interaction.followUp({
//                 content: 'There was an error while executing this command!',
//                 flags: MessageFlags.Ephemeral
//             });
//         }else{
//             await interaction.reply({
//                 content: 'There was an error while executing this command!',
//                 flags: MessageFlags.Ephemeral
//             });
//         }
//     }
// });


// client.on('messageCreate', (message) => {
//     if (!message.member) {
//         return;
//     }
//     console.log(`${message.member.displayName} sent: ${message.content}`);
// });

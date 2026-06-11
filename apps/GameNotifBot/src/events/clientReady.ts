import { Client, Events } from 'discord.js';
import { Event } from '../interfaces/Event.js';

// interface Event {
//     name: string;
//     once: boolean;s
//     execute: (client: Client) => void;
// }


const ready: Event = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client): void {
        console.log(`Ready! Logged in as ${client.user?.tag}. Bot is online!`);
    }
};

export default ready;
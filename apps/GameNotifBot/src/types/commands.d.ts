import 'discord.js';
import { Client, Collection } from 'discord.js';
import { SlashCommand } from '../interfaces/SlashCommand.js';

declare module "discord.js" {
    interface Client {
        commands: Collection<String, SlashCommand>;
        cooldowns: Collection<String, Collection<string, number>>;
    }
}

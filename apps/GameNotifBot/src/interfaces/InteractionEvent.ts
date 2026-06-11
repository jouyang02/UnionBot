import { Interaction } from 'discord.js';

export interface InteractionEvent {
    name: string;
    once?: boolean;
    execute: (interaction: Interaction) => Promise<void>;
}
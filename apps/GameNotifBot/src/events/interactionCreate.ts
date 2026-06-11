import { ChatInputCommandInteraction, Client, Collection, Events, Interaction, MessageFlags } from 'discord.js';
import { InteractionEvent } from '../interfaces/InteractionEvent.js';

// interface InteractionEvent {
//     name: string;
//     once?: boolean;
//     execute: (interaction: Interaction) => Promise<void>;

// }


const slashEvent: InteractionEvent = {
    name: Events.InteractionCreate,
    async execute(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const chatInteraction = interaction as ChatInputCommandInteraction;
        const { commands, cooldowns} = chatInteraction.client;
        const command = commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${chatInteraction.commandName} was found.`);
            return;
        }

        // Cooldown checking for commands.
        if (!cooldowns.has(command.data.name)) {
            cooldowns.set(command.data.name, new Collection());
        }

        const defaultCooldown: number = 5;
        const now: number = Date.now();
        const timestamps = cooldowns.get(command.data.name)!;
        const cooldownAmount: number = (command.cooldown ?? defaultCooldown) * 1_000;
        
        // Calculate expiration time
        if (timestamps.has(chatInteraction.user.id)){
            const expirationTime: number = timestamps.get(chatInteraction.user.id)! + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft: number = Math.round(expirationTime/ 1_000);

                await interaction.reply({
                    content: `Please wait, \`${command.data.name}\` is on cooldown. You can use it again <t:${timeLeft}:R>.`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
        }
        // Allowing user to execute the command once cooldown passes
        timestamps.set(chatInteraction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        // Command execution
        try{
            await command.execute(chatInteraction);
        }catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred){
                await interaction.followUp({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral
                });
            }else{
                await interaction.reply({
                    content: 'There was an error while executing this command!',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};

export default slashEvent;
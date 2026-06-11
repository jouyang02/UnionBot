import { SlashCommandBuilder, CommandInteraction } from "discord.js";
import { SlashCommand } from "../../interfaces/SlashCommand.js";

const command: SlashCommand = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Respond with Pong!'),
    async execute(interaction: CommandInteraction) {
        await interaction.reply('Pong');
    }
}

export default command;

// module.exports = {
//     data: new SlashCommandBuilder()
//         .setName('Ping')
//         .setDescription('Respond with Pong!'),
//     async execute(interaction:CommandInteraction) {
//         await interaction.reply('Pong');
//     }
// }
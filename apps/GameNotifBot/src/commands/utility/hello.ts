import { 
    SlashCommandBuilder, 
    CommandInteraction, 
    APIInteractionGuildMember, 
    GuildMember
} from "discord.js";
import { SlashCommand } from "../../interfaces/SlashCommand.js";

const command: SlashCommand = {
    cooldown:10,
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Provides info on server join date of user'),
    async execute(interaction: CommandInteraction) {
        const member = await interaction.guild!.members.fetch(interaction.user.id);
        await interaction.reply(
            `Run by ${interaction.user.username}, who joined at ${member.joinedAt}`
        );
    }
}

export default command;

// module.exports = {
//     cooldown: 10,
//     data: new SlashCommandBuilder()
//         .setName('userinfo')
//         .setDescription('Provides info on server join date of user'),
//     async execute(interaction:CommandInteraction) {
//         const member = await interaction.guild!.members.fetch(interaction.user.id);
//         await interaction.reply(
//             `Run by ${interaction.user.username}, who joined at ${member.joinedAt}`
//         );
//     }
// }
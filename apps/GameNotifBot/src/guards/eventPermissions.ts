import { PermissionFlagsBits, type ChatInputCommandInteraction } from "discord.js";

export async function canCreateEvent(interaction: ChatInputCommandInteraction): Promise<boolean> {
    const guild = interaction.guild;
    if (!interaction.inGuild()) return false;
    if (!guild) return false;
    if (interaction.user.id === guild.ownerId) return true;
    return interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) ?? false;

    //if (interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) return true;
    // const modRoleId = process.env.DISCORD_MOD_ROLE_ID;
    // if(!modRoleId) return false;
    // const member = await guild.members.fetch(interaction.user.id);
    // return member.roles.cache.has(modRoleId);
}
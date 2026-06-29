import { 
    CommandInteraction, 
    ChatInputCommandInteraction, 
    SlashCommandBuilder, 
    SlashCommandOptionsOnlyBuilder, 
    SlashCommandSubcommandsOnlyBuilder 
} from "discord.js";

export interface SlashCommand {
    cooldown?: number;
    data:
          SlashCommandBuilder
        | SlashCommandOptionsOnlyBuilder
        | SlashCommandSubcommandsOnlyBuilder;
    execute(interaction: CommandInteraction): Promise<void>;
}
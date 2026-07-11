import { 
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    MessageFlags,
    type ChatInputCommandInteraction,
} from 'discord.js';
import { isAxiosError } from 'axios';
import { SlashCommand } from '../../interfaces/SlashCommand.js';
import { serverClient } from '../../http/serverClient.js';
import { toAdaptiveDiscordTimestamp } from '../../utils/datetime.js';

const PAGE_SIZE = 10;
const PAGINATION_TIMEOUT_MS = 1 * 60 * 1000;

interface ActiveEvent {
    game_name: string;
    event_name: string;
    event_type: string;
    end_time: string;
}

const buildPageEmbed = (events: ActiveEvent[], page: number, totalPages:number) => {
    const slice = events.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
    const lines = slice.map(
        (element, index) =>
            `**${page * PAGE_SIZE + index + 1}. ${element.event_name}**. (${element.event_type}) -- *${element.game_name}*\n` +
            `ends ${toAdaptiveDiscordTimestamp(element.end_time)}`,
    );
    return new EmbedBuilder()
        .setTitle('All Current Active Events')
        .setDescription(lines.join('\n'))
        .setColor(0x5865f2)
        .setFooter({ text: `Page ${page + 1} of ${totalPages} • ${events.length} events`});
};

const buildButtonRow = (
    prevId: string,
    nextId: string,
    page: number,
    totalPages: number,
    disableAll = false,
) => 
    new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
            .setCustomId(prevId)
            .setLabel('◀ Previous')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disableAll || page === 0),
        new ButtonBuilder()
            .setCustomId(nextId)
            .setLabel('Next ▶')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(disableAll || page === totalPages - 1),
    );

const command: SlashCommand = {
    cooldown:5,
    data: new SlashCommandBuilder()
        .setName('active-events')
        .setDescription('List all currently active game events'),

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        let events: ActiveEvent[];
        try{
            ({ data: events } = await serverClient.get<ActiveEvent[]>('/api/events/active'));
        }catch (err) {
            const status = isAxiosError(err) ? err.response?.status : undefined;
            return interaction.editReply(`Couldn't fetch events${status ? ` (Server said ${status})`: ''}`);
        }

        if (events.length === 0) {
            return interaction.editReply('No active events right now.');
        }

        const totalPages = Math.ceil(events.length / PAGE_SIZE);
        if (totalPages === 1) {
            return interaction.editReply({ embeds: [buildPageEmbed(events, 0, 1)] });
        }

        const prevId = `active-events:prev:${interaction.id}`;
        const nextId = `active-events:next:${interaction.id}`;
        let page = 0;

        const message = await interaction.editReply({
            embeds: [buildPageEmbed(events, page, totalPages)],
            components: [buildButtonRow(prevId, nextId, page, totalPages)],
        });

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: PAGINATION_TIMEOUT_MS,
        });

        collector.on('collect', async btn => {
            if (btn.user.id !== interaction.user.id) {
                return btn.reply({
                    content: `You cannot interact with these buttons.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
            
            page = btn.customId === nextId ? Math.min(page + 1, totalPages - 1) : Math.max(page - 1, 0);

            await btn.update({
                embeds: [buildPageEmbed(events, page, totalPages)],
                components: [buildButtonRow(prevId, nextId, page, totalPages)],
            });
        });

        collector.on('end', () => {
            interaction
                .editReply({components: [buildButtonRow(prevId, nextId, page, totalPages, true)] })
                .catch(() => {});
        });
    },
};

export default command;
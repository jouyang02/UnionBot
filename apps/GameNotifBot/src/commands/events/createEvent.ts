import {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    LabelBuilder,
    EmbedBuilder,
    MessageFlags,
    type ChatInputCommandInteraction,
    type ModalSubmitInteraction
} from 'discord.js';
import { isAxiosError } from 'axios';
import { SlashCommand } from '../../interfaces/SlashCommand.js';
import { serverClient } from '../../http/serverClient.js';
import { parseEventTimestamp, toAdaptiveDiscordTimestamp } from '../../utils/datetime.js';
import { normalizeWhitespace } from '../../utils/string.js';
import { canCreateEvent } from '../../guards/eventPermissions.js';

const MODAL_TIMEOUT_MS = 5 * 60 * 1000;

const field = (id: string, label: string, description?: string) => {
    const input = new TextInputBuilder()
        .setCustomId(id)
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

    const label_wrapper = new LabelBuilder()
        .setLabel(label)
        .setTextInputComponent(input);
    if (description) label_wrapper.setDescription(description);

    return label_wrapper
};

const command: SlashCommand = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('create-event')
        .setDescription('Create a in game event event you wish to track. (Admin Only)'),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!(await canCreateEvent(interaction))) {
            return interaction.reply({
                content: 'You do not have permission to run this command.',
                flags: MessageFlags.Ephemeral,
            });
        }

        // Generating the modal to fill in Create Event data
        const modalId = `create-event:${interaction.id}`;
        const modal = new ModalBuilder()
            .setCustomId(modalId)
            .setTitle('Create a Game Event to Track')
            .addLabelComponents(
                field('game_name', 'Game Name'),
                field('event_name', 'Event Name'),
                field('event_type', 'Event Type or Category of Event'),
                field('start_time', 'Start Time (UTC)', 'Format: mm/dd/yyyy hh:mm -- 24-hour clock in UTC'),
                field('end_time', 'End Time (UTC)', 'Format: mm/dd/yyyy hh:mm -- 24 hour clock in UTC'),
            );
        await interaction.showModal(modal);

        // Waiting for this specific modal response, from the invocating user, up to timeout (5 MINS)
        const submitted: ModalSubmitInteraction | null = await interaction.awaitModalSubmit({
            time: MODAL_TIMEOUT_MS,
            filter: form => form.customId === modalId && form.user.id === interaction.user.id,
        })
        .catch(() => null);

        if (!submitted) return;

        await submitted.deferReply({ flags: MessageFlags.Ephemeral });

        const game_name = normalizeWhitespace(submitted.fields.getTextInputValue('game_name'));
        const event_name = normalizeWhitespace(submitted.fields.getTextInputValue('event_name'));
        const event_type = normalizeWhitespace(submitted.fields.getTextInputValue('event_type'));
        const rawStartTime = submitted.fields.getTextInputValue('start_time');
        const rawEndTime = submitted.fields.getTextInputValue('end_time');

        let start_time: Date, end_time: Date;
        try {
            start_time = parseEventTimestamp(rawStartTime);
            end_time = parseEventTimestamp(rawEndTime);
        } catch (err) {
            return submitted.editReply(`Invalid date format -- ${(err as Error).message}`);
        }
        if (end_time <= start_time) {
            return submitted.editReply(`Not logical: [Start Time] and [End Time], End Time came before Start Time.`);
        }
        try {
            const { data } = await serverClient.post('/api/events/create', {
                game_name,
                event_name,
                event_type,
                start_time: start_time.toISOString(),
                end_time: end_time.toISOString(),
            });

            const embed = new EmbedBuilder()
                .setTitle('Event created')
                .setDescription(`**${data.event_name}**`)
                .addFields(
                    { name: 'Game', value: data.game_name, inline:true },
                    { name: 'Type', value: data.event_type, inline:true },
                    { name: 'Starts', value: toAdaptiveDiscordTimestamp(data.start_time) },
                    { name: 'Ends', value: toAdaptiveDiscordTimestamp(data.end_time) },
                )
                .setColor(0x57f287)
                .setFooter({ text: `Event ID: ${data.source_event_id ?? data.id}` })
                .setTimestamp();
            
            return submitted.editReply({ embeds: [embed] });
        }catch (err) {
            const status = isAxiosError(err) ? err.response?.status : undefined;
            return submitted.editReply(`Failed to create event ${status ? `(Server said ${status})` : ''}`);
        }
    },
};

export default command;
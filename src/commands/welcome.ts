import { ApplicationCommandOptionType, ChannelType, EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextChannel, TextInputBuilder, type CommandInteraction } from 'discord.js';
import { Discord, ModalComponent, Slash, SlashGroup, SlashOption } from 'discordx';
import { actionRow } from '../utils/discord';
import { prisma } from '..';
import { config } from '../config';
import { placeholders } from '../utils/functions';

@Discord()
@SlashGroup({ name: 'welcome', description: 'Welcome management commands.' })
export class WelcomeCommand {
    @Slash({ name: 'message', description: 'Set the welcome message.' })
    @SlashGroup('welcome')
    setWelcomeMessage(interaction: CommandInteraction) {
        const modal = new ModalBuilder()
            .setCustomId('setwelcome')
            .addComponents(
                actionRow(
                    new TextInputBuilder()
                        .setCustomId('message')
                        .setLabel('Welcome Message')
                        .setPlaceholder('Enter the welcome message')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(2000)
                )
            )

        interaction.showModal(modal);
    }

    @ModalComponent({ id: 'setwelcome' })
    async setWelcomeMessageModal(interaction: ModalSubmitInteraction) {
        if (!interaction.guildId) return;
        const message = interaction.fields.getTextInputValue('message');

        await prisma.guild.upsert({
            where: { id: interaction.guildId },
            create: {
                id: interaction.guildId,
                welcomeMessage: message
            },
            update: {
                welcomeMessage: message
            }
        });

        const welcomeConfig = config.welcome.message;
        const title = welcomeConfig.title;
        const description = placeholders(welcomeConfig.description, { message });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(welcomeConfig.color);

        interaction.reply({ embeds: [embed] });
    }

    @Slash({ name: 'channel', description: 'Set the welcome channel.' })
    @SlashGroup('welcome')
    async setWelcomeChannel(
        @SlashOption({
            name: 'channel',
            description: 'The channel to set the welcome channel to.',
            type: ApplicationCommandOptionType.Channel,
            channelTypes: [ChannelType.GuildText],
            required: true
        })
        channel: TextChannel,
        interaction: CommandInteraction
    ) {
        if (!interaction.guildId) return;

        await prisma.guild.upsert({
            where: { id: interaction.guildId },
            create: {
                id: interaction.guildId,
                welcomeChannel: channel.id
            },
            update: {
                welcomeChannel: channel.id
            }
        });

        const welcomeConfig = config.welcome.channel;
        const title = welcomeConfig.title;
        const description = placeholders(welcomeConfig.description, { channel });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(welcomeConfig.color);
        
        interaction.reply({ embeds: [embed] });
    }
}
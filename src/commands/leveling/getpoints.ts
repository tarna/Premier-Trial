import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma } from '../..';
import { config } from '../../config';
import { placeholders } from '../../utils/functions';

@Discord()
export class GetPointsCommand {
    @Slash({ name: 'getpoints', description: 'View the points amount of a user.' })
    async getPoints(
        @SlashOption({
            name:'user',
            description: 'The user to view the points of.',
            type: ApplicationCommandOptionType.User,
            required: true
        })
        user: GuildMember,
        interaction: CommandInteraction
    ) {
        const data = await prisma.user.findFirst({ where: { id: user.id } });
        if (!data) return interaction.reply({ content: 'User not found.', ephemeral: true })

        const getPointsConfig = config.levels.messages.getpoints;
        const title = placeholders(getPointsConfig.title, { user: user.user.username });
        const description = placeholders(getPointsConfig.description, {
            user,
            points: data.level,
            level: data.level
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(getPointsConfig.color);
        
        interaction.reply({ embeds: [embed] });
    }
}
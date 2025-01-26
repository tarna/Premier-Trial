import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma } from '../..';
import { config } from '../../config';
import { placeholders } from '../../utils/functions';
import { log } from '../../utils/logs';

@Discord()
export class AddPointsCommand {
    @Slash({ name: 'addpoints', description: 'Add points to a user.' })
    async addXp(
        @SlashOption({
            name: 'user',
            description: 'The user to add points to.',
            type: ApplicationCommandOptionType.User,
            required: true
        })
        user: GuildMember,
        @SlashOption({
            name: 'amount',
            description: 'The amount of points to add',
            type: ApplicationCommandOptionType.Integer,
            required: true
        })
        amount: number,
        interaction: CommandInteraction
    ) {
        await prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                level: {
                    increment: amount
                }
            }
        });

        const addXpConfig = config.levels.messages.addpoints;
        const title = placeholders(addXpConfig.title, { user: user.user.username, amount });
        const description = placeholders(addXpConfig.description, {
            user,
            amount
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(addXpConfig.color);
        
        interaction.reply({ embeds: [embed] });

        log('Points Added', `${interaction.user.tag} added ${amount} points to ${user.user.tag}`);
    }
}
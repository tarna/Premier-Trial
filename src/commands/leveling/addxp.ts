import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma } from '../..';
import { config } from '../../config';
import { placeholders } from '../../utils/functions';

@Discord()
export class AddXpCommand {
    @Slash({ name: 'addxp', description: 'Add EXP to a user.' })
    async addXp(
        @SlashOption({
            name: 'user',
            description: 'The user to add EXP to.',
            type: ApplicationCommandOptionType.User,
            required: true
        })
        user: GuildMember,
        @SlashOption({
            name: 'amount',
            description: 'The amount of EXP to add',
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
                exp: {
                    increment: amount
                }
            }
        });

        const addXpConfig = config.levels.messages.addxp;
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
    }
}
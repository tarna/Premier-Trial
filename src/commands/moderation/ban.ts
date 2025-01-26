import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma } from '../..';
import { PunishmentType } from '@prisma/client';
import ms from 'ms';
import { config } from '../../config';
import { placeholders } from '../../utils/functions';
import { log } from '../../utils/logs';

@Discord()
export class BanCommand {
    @Slash({ name: 'ban', description: 'Ban a user from the server.', defaultMemberPermissions: ['BanMembers'] })
    async ban(
        @SlashOption({
            name: 'user',
            description: 'The user to ban.',
            type: ApplicationCommandOptionType.User,
            required: true
        })
        user: GuildMember,
        @SlashOption({
            name: 'reason',
            description: 'The reason for the ban.',
            type: ApplicationCommandOptionType.String,
            required: false
        })
        reason: string | null,
        @SlashOption({
            name: 'duration',
            description: 'The duration of the ban.',
            type: ApplicationCommandOptionType.String,
            required: false
        })
        duration: ms.StringValue | null,
        interaction: CommandInteraction
    ) {
        if (!interaction.guildId) return;
        if (!user.bannable) return interaction.reply({ content: 'I cannot ban this user.', ephemeral: true });

        await prisma.punishment.create({
            data: {
                userId: user.id,
                punisherId: interaction.user.id,
                guildId: interaction.guildId,
                type: PunishmentType.BAN,
                reason,
                expiresAt: duration ? new Date(Date.now() + ms(duration)) : null
            }
        });
        user.ban({ reason: reason ?? 'No Reason Specified', deleteMessageSeconds: 1000 });

        const banConfig = config.punishment.messages.ban;
        const title = placeholders(banConfig.title, { user: user.user.username });
        const description = placeholders(banConfig.description, {
            user,
            reason,
            duration: duration ? ms(duration) : 'Permanent'
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(banConfig.color);
        
        interaction.reply({ embeds: [embed] });

        log('User Banned', `${interaction.user.tag} banned ${user.user.tag} for ${duration ? ms(duration) : 'forever'} with reason: ${reason ?? 'No Reason Specified'}`);
    }
}
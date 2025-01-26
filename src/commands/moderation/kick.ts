import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, type GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma } from '../..';
import { PunishmentType } from '@prisma/client';
import { config } from '../../config';
import { placeholders } from '../../utils/functions';
import { log } from '../../utils/logs';

@Discord()
export class KickCommand {
    @Slash({ name: 'kick', description: 'Kick a user from the server.', defaultMemberPermissions: ['KickMembers'] })
    async kick(
        @SlashOption({
            name: 'user',
            description: 'The user to kick.',
            type: ApplicationCommandOptionType.User,
            required: true
        })
        user: GuildMember,
        @SlashOption({
            name: 'reason',
            description: 'The reason for the kick.',
            type: ApplicationCommandOptionType.String
        })
        reason: string,
        interaction: CommandInteraction
    ) {
        if (!interaction.guildId) return;
        if (!user.kickable) return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });

        await prisma.punishment.create({
            data: {
                userId: user.id,
                punisherId: interaction.user.id,
                guildId: interaction.guildId,
                type: PunishmentType.KICK,
                reason,
            }
        });
        user.kick(reason);

        const kickConfig = config.punishment.messages.kick;
        const title = placeholders(kickConfig.title, { user: user.user.username });
        const description = placeholders(kickConfig.description, {
            user,
            reason
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(kickConfig.color);
        
        interaction.reply({ embeds: [embed] });

        log('User Kicked', `${interaction.user.tag} kicked ${user.user.tag} for ${reason}`);
    }
}
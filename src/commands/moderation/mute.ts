import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, type GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma } from '../..';
import { PunishmentType } from '@prisma/client';
import { config } from '../../config';
import { placeholders } from '../../utils/functions';
import ms from 'ms';
import { canMute, getMutedRole } from '../../utils/punishment';

@Discord()
export class MuteCommand {
    @Slash({ name: 'mute', description: 'Mute a user from the server.', defaultMemberPermissions: ['ModerateMembers'] })
    async mute(
        @SlashOption({
            name: 'user',
            description: 'The user to mute.',
            type: ApplicationCommandOptionType.User,
            required: true
        })
        user: GuildMember,
        @SlashOption({
            name: 'reason',
            description: 'The reason for the mute.',
            type: ApplicationCommandOptionType.String
        })
        reason: string,
        @SlashOption({
            name: 'duration',
            description: 'The duration of the ban.',
            type: ApplicationCommandOptionType.Integer,
            required: false
        })
        duration: ms.StringValue | null,
        interaction: CommandInteraction
    ) {
        if (!interaction.guild || !interaction.guildId) return;
        if (!canMute(user)) return interaction.reply({ content: 'I cannot mute this user.', ephemeral: true });
        if (!canMute(user, interaction.member as GuildMember)) return interaction.reply({ content: 'You cannot mute this user.', ephemeral: true });

        await prisma.punishment.create({
            data: {
                userId: user.id,
                punisherId: interaction.user.id,
                guildId: interaction.guildId,
                type: PunishmentType.MUTE,
                reason,
            }
        });
        
        const mutedRole = getMutedRole(interaction.guild);
        if (!mutedRole) return interaction.reply({ content: 'The muted role is not set up.', ephemeral: true });

        await user.roles.add(mutedRole, reason);

        const muteConfig = config.punishment.messages.mute;
        const title = placeholders(muteConfig.title, { user: user.user.username });
        const description = placeholders(muteConfig.description, {
            user,
            reason,
            duration: duration ? ms(duration) : 'Permanent'
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(muteConfig.color);
        
        interaction.reply({ embeds: [embed] });
    }
}
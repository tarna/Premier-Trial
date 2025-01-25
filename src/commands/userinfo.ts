import { ApplicationCommandOptionType, EmbedBuilder, GuildMember, type CommandInteraction, type User } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { config } from '../config';
import { placeholders } from '../utils/functions';
import { prisma } from '..';
import { evaluate } from 'mathjs';

@Discord()
export class UserInfoCommand {
    @Slash({ name: 'userinfo', description: 'View information about a certain user.' })
    async userInfo(
        @SlashOption({
            name: 'user',
            description: 'The user to view information about.',
            type: ApplicationCommandOptionType.User,
            required: false
        })
        user: GuildMember,
        interaction: CommandInteraction
    ) {
        if (!user) user = interaction.member as GuildMember;

        const userData = await prisma.user.findUnique({
            where: {
                id: user.id
            },
            include: {
                messages: true
            }
        });

        if (!userData) return interaction.reply({ content: 'User not found.', ephemeral: true });

        const userInfoConfig = config.userInfo;
        const title = placeholders(userInfoConfig.title, { user: user.displayName });
        const description = placeholders(userInfoConfig.description, {
            id: user.id,
            user: user.displayName,
            join_date: `<t:${Math.floor(user.user.createdTimestamp / 1000)}:R>`,
            roles: user.roles.cache.map(role => role.toString()).join(' '),
            xp: userData.exp,
            exp: userData.exp,
            level: userData.level,
            progress: `${userData.exp} / ${evaluate(config.levels.formula.replace(/level/g, (userData.level + 1).toString()))}`,
            messages: userData.messages.length,
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(userInfoConfig.color);
        
        interaction.reply({ embeds: [embed] });
    }
}
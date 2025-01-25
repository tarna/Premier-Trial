import { Discord, On, type ArgsOf } from 'discordx';
import { prisma } from '..';
import type { TextChannel } from 'discord.js';
import { placeholders } from '../utils/functions';

@Discord()
export class MemberJoinListener {
    @On({ event: 'guildMemberAdd' })
    async onMemberJoin([member]: ArgsOf<'guildMemberAdd'>) {
        const guild = member.guild;
        const data = await prisma.guild.findUnique({
            where: { id: guild.id }
        });

        const welcomeMessage = data?.welcomeMessage;
        const welcomeChannel = data?.welcomeChannel;
        if (!welcomeMessage || !welcomeChannel) return;

        const channel = guild.channels.cache.get(welcomeChannel) as TextChannel;
        if (!channel) return;

        channel.send(placeholders(welcomeMessage, {
            user: member,
            guild: guild.name,
            members: guild.memberCount
        }));
    }
}
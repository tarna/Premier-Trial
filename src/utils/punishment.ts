import type { Guild, GuildMember } from 'discord.js';
import { config } from '../config';

export function canMute(member: GuildMember, me: GuildMember = member.guild.members.me!) {
    return member.roles.highest.position < me.roles.highest.position;
}

export function getMutedRole(guild: Guild) {
    return guild.roles.cache.get(config.punishment.mutedRole);
}
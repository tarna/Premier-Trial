import { EmbedBuilder, type TextChannel } from 'discord.js';
import { client } from '..';
import { config } from '../config';
import { listToString } from './functions';

export async function log(action: string, ...message: string[]) {
    const logsChannel = await client.channels.fetch(config.logsChannel) as TextChannel | null;
    if (!logsChannel) return;

    const embed = new EmbedBuilder()
        .setTitle(action)
        .setDescription(listToString(message))
        .setColor('Blue')
        .setTimestamp();
    
    logsChannel.send({ embeds: [embed] });
}
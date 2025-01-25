import type { GuildMember } from 'discord.js';
import { prisma } from '..';

export const listToString = (list: string[], separator: string = '\n') => list.join(separator);

export function placeholders(message: string, placeholders: Record<string, any>) {
    for (const [placeholder, value] of Object.entries(placeholders)) {
        message = message.replace(new RegExp(`{${placeholder}}`, 'g'), value);
    }
    return message;
}

export async function getRandomFact() {
    const facts = await prisma.fact.findMany();
    return facts[Math.floor(Math.random() * facts.length)].message;
}
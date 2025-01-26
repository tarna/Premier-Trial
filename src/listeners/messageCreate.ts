import { Discord, On, type ArgsOf } from 'discordx';
import { messageCooldown, prisma } from '..';
import { config } from '../config';
import { evaluate } from 'mathjs';
import { EmbedBuilder } from 'discord.js';
import { placeholders } from '../utils/functions';

@Discord()
export class MessageCreateListener {
    @On({ event: 'messageCreate' })
    async onMessage([message]: ArgsOf<'messageCreate'>) {
        if (message.author.bot || !message.guild) return;

        if (messageCooldown.isOnCooldown(message.author.id)) return;
        messageCooldown.setCooldown(message.author.id);

        await prisma.message.create({
            data: {
                id: message.id,
                guildId: message.guild.id,
                userId: message.author.id,
                content: message.content,
                sentAt: new Date(message.createdTimestamp)
            }
        });

        const randomExp = Math.floor(Math.random() * (config.levels.xp.max - config.levels.xp.min + 1)) + config.levels.xp.min;
        const data = await prisma.user.upsert({
            where: { id: message.author.id },
            update: {
                exp: {
                    increment: randomExp
                }
            },
            create: {
                id: message.author.id,
                guildId: message.guild.id,
                exp: randomExp
            }
        });

        const expToLevelUp = evaluate(
            config.levels.formula
                .replace('level', data.level.toString())
        );

        if (data.exp >= expToLevelUp) {
            await prisma.user.update({
                where: { id: message.author.id },
                data: {
                    exp: 0,
                    level: {
                        increment: 1
                    }
                }
            });

            const levelUpConfig = config.levels.messages.levelUp;
            const title = placeholders(levelUpConfig.title, { user: message.author.username });
            const description = placeholders(levelUpConfig.description, {
                user: message.author,
                level: data.level + 1
            })

            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(levelUpConfig.color);

            const levelUpMessage = await message.channel.send({ embeds: [embed] });

            setTimeout(() => {
                levelUpMessage.delete();
            }, 5000);
        }
    }
}
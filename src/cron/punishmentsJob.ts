import { CronJob } from 'cron';
import { client, prisma } from '..';
import { PunishmentType } from '@prisma/client';
import { getMutedRole } from '../utils/punishment';
import { EmbedBuilder } from 'discord.js';

export default new CronJob('0 * * * * *', async () => {
    const punishments = await prisma.punishment.findMany({
        where: {
            expiresAt: {
                lt: new Date()
            }
        }
    });

    for (const punishment of punishments) {
        const guild = client.guilds.cache.get(punishment.guildId);
        if (!guild) continue;

        const user = await guild.members.fetch(punishment.userId);
        if (!user) continue;

        await prisma.punishment.update({
            where: {
                id: punishment.id
            },
            data: {
                expired: true
            }
        });

        switch (punishment.type) {
            case PunishmentType.MUTE:
                const mutedRole = getMutedRole(guild);
                if (!mutedRole) continue;

                await user.roles.remove(mutedRole, 'Punishment expired.');

                break;
            case PunishmentType.BAN:
                await guild.members.unban(punishment.userId, 'Punishment expired.');
                
                break;
            default:
                console.log('Unknown punishment type:', punishment.type);
        }

        const punisher = await guild.members.fetch(punishment.punisherId);
        if (!punisher) continue;

        const embed = new EmbedBuilder()
            .setTitle('Punishment Expired')
            .setDescription(`The punishment against ${user.user.username} has expired.`)
            .setColor('Red');
        
        await punisher.send({ embeds: [embed] });
    }
});
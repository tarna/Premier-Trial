import { EmbedBuilder, type CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { prisma } from '../..';

@Discord()
export class LeaderboardCommand {
    @Slash({ name: 'leaderboard', description: 'View the leveling leaderboard.' })
    async leaderboard(interaction: CommandInteraction) {
        if (!interaction.guildId) return;

        const data = await prisma.user.findMany({
            where: {
                guildId: interaction.guildId
            }
        });

        const sortedData = data.sort((a, b) => {
            if (a.level === b.level) return b.exp - a.exp;
            return b.level - a.level;
        });

        const leaderboard = sortedData.slice(0, 10);

        const embed = new EmbedBuilder()
            .setTitle('Leaderboard')
            .setColor('Blue')
            .setDescription(leaderboard.map((user, index) => {
                return `${index + 1}. <@${user.id}> - Level ${user.level} (${user.exp} exp)`;
            }).join('\n'));
        
        interaction.reply({ embeds: [embed] });
    }
}
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { prisma } from '../..';
import { config } from '../../config';
import { placeholders } from '../../utils/functions';

@Discord()
export class GetXpCommand {
    @Slash({ name: 'getxp', description: 'View the EXP amount of a user.' })
    async getExp(
        @SlashOption({
            name:'user',
            description: 'The user to view the EXP of.',
            type: ApplicationCommandOptionType.User,
            required: true
        })
        user: GuildMember,
        interaction: CommandInteraction
    ) {
        const data = await prisma.user.findFirst({ where: { id: user.id } });
        if (!data) return interaction.reply({ content: 'User not found.', ephemeral: true })

        const getExpConfig = config.levels.messages.getxp;
        const title = placeholders(getExpConfig.title, { user: user.user.username });
        const description = placeholders(getExpConfig.description, {
            user,
            xp: data.exp,
            exp: data.exp
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(getExpConfig.color);
        
        interaction.reply({ embeds: [embed] });
    }
}
import { EmbedBuilder, type CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import { config } from '../config';
import { getRandomFact, placeholders } from '../utils/functions';

@Discord()
export class HelloCommand {
    @Slash({ name: 'hello', description: 'Hello from the bot.' })
    async hello(interaction: CommandInteraction) {
        const helloConfig = config.hello;
        const title = placeholders(helloConfig.title, { user: interaction.user.username });
        const description = placeholders(helloConfig.description, { 
            user: interaction.user.username ,
            fact: await getRandomFact()
        });

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor(helloConfig.color);
        
        interaction.reply({ embeds: [embed] });
    }
}
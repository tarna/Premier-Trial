import { EmbedBuilder, ModalBuilder, ModalSubmitInteraction, TextInputBuilder, type CommandInteraction } from 'discord.js';
import { Discord, ModalComponent, Slash } from 'discordx';
import { actionRow } from '../utils/discord';

@Discord()
export class EchoCommand {
    @Slash({ name: 'echo', description: 'Repeats your input.' })
    async echo(interaction: CommandInteraction) {
        const modal = new ModalBuilder()
            .setCustomId('echo')
            .setTitle('Echo')
            .addComponents(
                actionRow(
                    new TextInputBuilder()
                        .setCustomId('input')
                        .setLabel('Input')
                        .setPlaceholder('Enter your text here')
                        .setRequired(true)
                        .setMinLength(1)
                        .setMaxLength(500)
                )
            );

        interaction.showModal(modal);
    }

    @ModalComponent({ id: 'echo' })
    async echoModal(interaction: ModalSubmitInteraction) {
        const input = interaction.fields.getTextInputValue('input');

        const embed = new EmbedBuilder()
            .setColor('Blue')
            .addFields([
                {
                    name: 'Original',
                    value: input
                },
                {
                    name: 'Reversed',
                    value: input.split('').reverse().join('')
                }
            ]);

        interaction.reply({ embeds: [embed] });
    }
}
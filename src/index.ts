import { Client } from 'discordx';
import { config } from './config';
import { importx } from '@discordx/importer';
import { codeBlock, EmbedBuilder, IntentsBitField, Partials } from 'discord.js';
import { listToString } from './utils/functions';
import { PrismaClient } from '@prisma/client';
import punishmentsJob from './cron/punishmentsJob';

export const prisma = new PrismaClient();

export const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
    ],
    silent: false
});

client.on('ready', async () => {
    await client.initApplicationCommands();

    punishmentsJob.start();

    console.log(`Logged in as ${client.user?.tag}`);
});

client.on('interactionCreate', async interaction => {
    try {
        await client.executeInteraction(interaction);
    } catch (error: any) {
        if (interaction.isRepliable()) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(listToString([
                    `An error occurred while executing the command:`,
                    '',
                    codeBlock('js', error.stack ?? error.message)
                ]));
            interaction.reply({ embeds: [embed] });
        }
        console.error('Failed to execute interaction', error);
    }
})

const token = config.token;
if (!token) {
    throw new Error('No token provided');
}

await importx(__dirname + '/{listeners,commands}/**/*.{ts,js}');

await client.login(token);
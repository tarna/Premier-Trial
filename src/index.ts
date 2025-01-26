import { Client } from 'discordx';
import { config } from './config';
import { importx } from '@discordx/importer';
import { codeBlock, EmbedBuilder, IntentsBitField, Partials } from 'discord.js';
import { listToString } from './utils/functions';
import { PrismaClient } from '@prisma/client';
import punishmentsJob from './cron/punishmentsJob';
import Cooldown from './utils/cooldown';

export const messageCooldown = new Cooldown(5);

export const prisma = new PrismaClient();

export const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.GuildMessageReactions,
		IntentsBitField.Flags.DirectMessages,
		IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMembers
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

    await client.guilds.fetch();

    punishmentsJob.start();

    const guilds = client.guilds.cache;
    console.log(`Fetched ${guilds.size} guilds`);
    for (const guild of guilds.values()) {
        const data = await prisma.guild.findUnique({
            where: { id: guild.id }
        });

        if (!data) {
            await prisma.guild.create({
                data: {
                    id: guild.id
                }
            });

            console.log(`Created guild data for ${guild.name}`);
        }

        const users = await guild.members.fetch();
        console.log(`Fetched ${users.size} users from ${guild.name}`);
        for (const user of users.values()) {
            const data = await prisma.user.findUnique({
                where: { id: user.id }
            });

            if (!data) {
                await prisma.user.create({
                    data: {
                        id: user.id,
                        guildId: guild.id
                    }
                });

                console.log(`Created user data for ${user.user.username}`);
            }
        }
    }

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
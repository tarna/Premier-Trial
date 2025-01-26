import type { ColorResolvable } from 'discord.js';

const file = Bun.file('config.json');
export const config = await file.json() as Config;

export interface Config {
    token: string;
    logsChannel: string;
    hello: ConfigEmbed;
    levels: {
        cooldown: number;
        xp: {
            min: number;
            max: number;
        };
        formula: string;
        messages: {
            addxp: ConfigEmbed;
            getxp: ConfigEmbed;
            addpoints: ConfigEmbed;
            getpoints: ConfigEmbed;
            levelUp: ConfigEmbed;
        }
    };
    userInfo: ConfigEmbed;
    welcome: {
        message: ConfigEmbed;
        channel: ConfigEmbed;
    };
    punishment: {
        mutedRole: string;
        messages: {
            kick: ConfigEmbed;
            mute: ConfigEmbed;
            ban: ConfigEmbed;
        };
    };
}

export interface ConfigEmbed {
    title: string;
    description: string;
    color: ColorResolvable;
}
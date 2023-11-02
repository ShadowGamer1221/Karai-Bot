import { discordClient } from '../../main';
import { EmbedBuilder } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { groupBy } from 'lodash';
import {
    getCommandInfoEmbed,
    getCommandListEmbed,
    getCommandNotFoundEmbed,
} from '../../handlers/locale';
import axios from 'axios';
import moment from 'moment';
import { config } from '../../config';

class UptimeCommand extends Command {
    constructor() {
        super({
            trigger: 'uptime',
            description: 'Gets the uptime of the bot',
            type: 'ChatInput',
            module: 'bot',
            args: [],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.verified,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {

        const now = new Date();


        const baseUrl = 'https://ipinfo.io';

		let url; let response; let
			corona;

		try {
            url = `${baseUrl}/json`;
			response = await axios.get(url);
			corona = response.data;
		} catch (error) {
			return ctx.reply(`Error with fetching the api website.`);
		}

        let uptime = moment.duration(process.uptime(), 'seconds'),
			started = moment().subtract(process.uptime(), 'seconds').format('llll');


        const days = Math.floor(discordClient.uptime / 86400000 );
        const hours = Math.floor(discordClient.uptime / 3600000 ) % 24;
        const minutes = Math.floor(discordClient.uptime / 60000 ) % 60;
        const seconds = Math.floor(discordClient.uptime / 1000 ) % 60;
        const embed = new EmbedBuilder()
    .setTitle('Uptime')
    .setDescription(`${days} days, ${hours} hrs, ${minutes} min, ${seconds} sec`)
    .setColor('#43d177')
    .setFooter({ text: `${corona.country} | ${corona.city} | ${corona.timezone} | Last started on ${started}` });
        ctx.reply({ embeds: [embed] });
        return({ embeds: [embed] });
    }
}

export default UptimeCommand;
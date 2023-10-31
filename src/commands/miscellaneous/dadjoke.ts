import { discordClient } from '../../main';
import { TextChannel } from 'discord.js';
import { GetGroupRoles } from 'bloxy/src/client/apis/GroupsAPI';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { EmbedBuilder } from 'discord.js';
import {
    getInvalidRobloxUserEmbed,
    getRobloxUserIsNotMemberEmbed,
    getUnexpectedErrorEmbed,
    getNoRankAboveEmbed,
    getRoleNotFoundEmbed,
    getVerificationChecksFailedEmbed,
    getUserSuspendedEmbed,
    xmarkIconUrl,
    redColor,
    greenColor,
    mainColor,
} from '../../handlers/locale';
import axios from 'axios';
import { config } from '../../config';
 
class DadjokeCommand extends Command {
    constructor() {
        super({
            trigger: 'dadjoke',
            description: 'Get a random Dad joke.',
            type: 'ChatInput',
            module: 'miscellaneous',
            args: []
        });
    }
 
    async run(ctx: CommandContext) {
        const errorEmbed = new EmbedBuilder()
        .setAuthor({ name: `Error`, iconURL: xmarkIconUrl })
        .setDescription(`Error with fetching the API website.`)
        .setColor(redColor)
        .setTimestamp();
      const baseUrl = 'https://api.api-ninjas.com';

		let url; let response; let
        joke;

		try {
			url = `${baseUrl}/v1/dadjokes?limit=1`;
			response = (await axios.get(url, { headers: { 'X-Api-Key': process.env.NINJA_API_KEY as string } }));
			joke = response.data;
		} catch (error) {
			return ctx.reply({ embeds: [errorEmbed] });
		}

        const jokeText = response.data[0].joke;

        const passwordEmbed = new EmbedBuilder()
        .setColor(mainColor)
        .setDescription(jokeText)


		return ctx.reply({ embeds: [passwordEmbed] });
  }
}
 
export default DadjokeCommand;
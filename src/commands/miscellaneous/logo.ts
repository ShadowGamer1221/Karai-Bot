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
    infoIconUrl,
} from '../../handlers/locale';
import axios from 'axios';
import { config } from '../../config';
 
class LogoCommand extends Command {
    constructor() {
        super({
            trigger: 'logo',
            description: 'Give you the information about a logo.',
            type: 'ChatInput',
            module: 'miscellaneous',
            args: [
                {
                    trigger: 'brand',
                    description: 'The brand that you want to get the logo of.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
              },
            ],
        });
    }
 
    async run(ctx: CommandContext) {
        const errorEmbed = new EmbedBuilder()
        .setAuthor({ name: `Error`, iconURL: xmarkIconUrl })
        .setDescription(`Error with fetching the API website.`)
        .setColor(redColor)
        .setTimestamp();
      const baseUrl = 'https://api.api-ninjas.com';
      const name = ctx.args['brand']

		let url; let response; let
        joke;

		try {
			url = `${baseUrl}/v1/logo?name=${name}`;
			response = (await axios.get(url, { headers: { 'X-Api-Key': process.env.NINJA_API_KEY as string } }));
			joke = response.data;
		} catch (error) {
			return ctx.reply({ embeds: [errorEmbed] });
		}

        const jokeText = response.data ? response.data[0] : undefined;

        const passwordEmbed = new EmbedBuilder()
        .setAuthor({ name: `Logo`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .addFields({
            name: 'Name',
            value: jokeText?.name || 'None',
            inline: true,
        },
        {
            name: 'Ticker',
            value: jokeText?.ticker || 'None',
            inline: true,
        },
        )
        .setImage(jokeText?.image || null)


		return ctx.reply({ embeds: [passwordEmbed] });
  }
}
 
export default LogoCommand;
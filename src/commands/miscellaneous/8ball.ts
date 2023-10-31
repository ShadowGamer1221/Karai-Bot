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
} from '../../handlers/locale';
import axios from 'axios';
import { config } from '../../config';
 
class EightballCommand extends Command {
    constructor() {
        super({
            trigger: '8ball',
            description: 'Will give you a answer on your question.',
            type: 'ChatInput',
            module: 'miscellaneous',
            args: [
                {
                    trigger: 'question',
                    description: 'The question that you want to ask.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
              }
            ],
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
        const errorEmbed = new EmbedBuilder()
        .setAuthor({ name: `Error`, iconURL: xmarkIconUrl })
        .setDescription(`Error with fetching the api website.`)
        .setColor(redColor)
        .setTimestamp();
      const baseUrl = 'https://customapi.aidenwallis.co.uk';

		let url; let response; let
			corona;

		try {
			url = `${baseUrl}/api/v1/misc/8ball`;
			response = await axios.get(url);
			corona = response.data;
		} catch (error) {
			return ctx.reply({ embeds: [errorEmbed] });
		}

		return ctx.reply({
            content: `${corona}`
        });
  }
}
 
export default EightballCommand;
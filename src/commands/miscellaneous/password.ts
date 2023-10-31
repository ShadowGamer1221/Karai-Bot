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
import { config } from '../../config';
import { User, PartialUser, GroupMember } from 'bloxy/dist/structures';
import axios from 'axios';
 
class PasswordCommand extends Command {
    constructor() {
        super({
            trigger: 'randompassword',
            description: 'This will generate a random password for you.',
            type: 'ChatInput',
            module: 'miscellaneous',
            args: [
                {
                    trigger: 'lenght',
                    description: 'The lenght of the password that you want.',
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
        .setDescription(`Error with fetching the API website.`)
        .setColor(redColor)
        .setTimestamp();
      const baseUrl = 'https://api.api-ninjas.com';
      const lenght = ctx.args['lenght'];

		let url; let response; let
			corona;

		try {
			url = `${baseUrl}/v1/passwordgenerator?length=${lenght}`;
			response = (await axios.get(url, { headers: { 'X-Api-Key': process.env.NINJA_API_KEY as string } }));
			corona = response.data;
		} catch (error) {
			return ctx.reply({ embeds: [errorEmbed] });
		}

        const passwordEmbed = new EmbedBuilder()
        .setTitle(`Your Random Password:`)
        .setColor(greenColor)
        .setDescription(`${corona.random_password}`)
        .setTimestamp();


		return ctx.reply({ embeds: [passwordEmbed] });
  }
}
 
export default PasswordCommand;
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
 
class ConvertcurrencyCommand extends Command {
    constructor() {
        super({
            trigger: 'convertcurrency',
            description: 'This will convert your currency to anoter currency.',
            type: 'ChatInput',
            module: 'miscellaneous',
            args: [
                {
                    trigger: 'old',
                    description: 'The currency you have',
                    isLegacyFlag: false,
                    required: true,
                    type: 'String',
              },
              {
                trigger: 'new',
                description: 'The new currency that you want.',
                isLegacyFlag: false,
                required: true,
                type: 'String',
              },
              {
                trigger: 'amount',
                description: 'The ammount that you want to convert.',
                isLegacyFlag: false,
                required: true,
                type: 'Number',
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
      const oldCurrency = ctx.args['old'];
      const newCurreny = ctx.args['new'];
      const ammount = ctx.args['amount'];

		let url; let response; let
			corona;

		try {
			url = `${baseUrl}/v1/convertcurrency?have=${oldCurrency}&want=${newCurreny}&amount=${ammount}`;
			response = (await axios.get(url, { headers: { 'X-Api-Key': process.env.NINJA_API_KEY as string } }));
			corona = response.data;
		} catch (error) {
			return ctx.reply({ embeds: [errorEmbed] });
		}

        const passwordEmbed = new EmbedBuilder()
        .setTitle(`Your Currency:`)
        .setColor(greenColor)
        .addFields(
            {
                name: 'Old Currency:',
                value: corona.old_currency,
                inline: false,
            },
            {
                name: 'Old Ammount:',
                value: `${corona.old_amount} ${corona.old_currency}`,
                inline: false,
            },
            {
                name: 'New Currency:',
                value: corona.new_currency,
                inline: false,
            },
            {
                name: 'New Ammount:',
                value: `${corona.new_amount} ${corona.new_currency}`,
                inline: false,
            },
            {
                name: 'List Of Curencies:',
                value: `[Click Here To See All Currencies](https://www.sport-histoire.fr/en/Geography/Currencies_countries_of_the_world.php)`,
                inline: false,
            },
        )
        .setTimestamp();


		return ctx.reply({ embeds: [passwordEmbed] });
  }
}
 
export default ConvertcurrencyCommand;
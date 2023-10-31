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
import { config } from '../../config';
import axios from 'axios';
 
class ServerinfoCommand extends Command {
    constructor() {
        super({
            trigger: 'serverinfo',
            description: 'Gives you the information about the server.',
            type: 'ChatInput',
            module: 'miscellaneous',
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

		const embed = new EmbedBuilder()
			.setThumbnail(ctx.guild.iconURL())
			.setColor(mainColor)
			.setAuthor({ name:`${ctx.guild.name} server stats`, iconURL: infoIconUrl })
			.addFields(
				{
					name: 'Owner: ',
					value: `<@1143229567625068696>`,
					inline: true,
				},
				{
					name: 'Members: ',
					value: `There are ${ctx.guild.memberCount} users!`,
					inline: true,
				},
				{
					name: 'Total Bots: ',
					value: `There are ${ctx.guild.members.cache.filter((m) => m.user.bot).size} bots!`,
					inline: true,
				},
				{
					name: 'Creation Date: ',
					value: ctx.guild.createdAt.toLocaleDateString('en-us'),
					inline: true,
				},
				{
					name: 'Roles Count: ',
					value: `There are ${ctx.guild.roles.cache.size} roles in this server.`,
					inline: true,
				},
				{
					name: 'Verified: ',
					value: ctx.guild.verified ? 'Server is verified' : 'Server isn\'t verified',
					inline: true,
				},
				{
					name: 'Boosters: ',
					value: ctx.guild.premiumSubscriptionCount >= 1 ? `There are ${ctx.guild.premiumSubscriptionCount} Boosters` : 'There are no boosters',
					inline: true,
				},
				{
					name: 'Emojis: ',
					value: ctx.guild.emojis.cache.size >= 1 ? `There are ${ctx.guild.emojis.cache.size} emojis!` : 'There are no emojis',
					inline: true,
				},
			);
		return ctx.reply({ embeds: [embed] });
  }
}
 
export default ServerinfoCommand;
import { discordClient } from '../../main';
import { GuildMember, TextChannel } from 'discord.js';
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
    greenColor,
    mainColor,
} from '../../handlers/locale';
import { config } from '../../config';
import { User, PartialUser, GroupMember } from 'bloxy/dist/structures';
import Discord from 'discord.js';
import discord from 'discord.js';
 
class DmCommand extends Command {
    constructor() {
        super({
            trigger: 'dm',
            description: 'DMs others using the bot.',
            type: 'ChatInput',
            module: 'utillity',
            args: [
                {
                    trigger: 'member',
                    description: 'The member that you want to send a DM.',
                    isLegacyFlag: false,
                    required: true,
                    type: 'DiscordUser',
              },
              {
                trigger: 'message',
                description: 'The message that you want to send.',
                isLegacyFlag: false,
                required: true,
                type: 'String',
          }
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.moderators,
                    value: true,
                }
            ]
        });
    }
 
    async run(ctx: CommandContext) {

        const embed = new EmbedBuilder().setColor(greenColor).setAuthor({ name: ctx.user.tag, iconURL: ctx.user.displayAvatarURL() })
        let mention = ctx.args['member'];
        mention = mention.replace("<","");
        mention = mention.replace("!","");
        mention = mention.replace("@","");
        mention = mention.replace(">","");
        console.log(mention)
       mention = await ctx.guild.members.fetch(mention)
        if(!mention) {embed.setDescription("I cannot DM this person as they are not in the server!"); return ctx.reply({ embeds: [embed] })}
        const toSend = ctx.args['message'];
        if(!toSend) {embed.setDescription("You did not provide what to send!"); return ctx.reply({ embeds: [embed] })}
        let success = true
        const newsend = new EmbedBuilder()
        .setTitle(`You got a new message:`)
        .setColor(mainColor)
        .setDescription(`${toSend}`)
        .setTimestamp()
        try {
            await mention.send({ embeds: [newsend] })
        } catch (error) {
            success = false
        }
        if(success) {embed.setDescription("**Success!** Successfully sent the DM!").setColor(greenColor)} else {embed.setDescription("That person does not have their DMs on!")}
        ctx.reply({ embeds: [embed] })
    }
    }
 
export default DmCommand;
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
    greenColor,
    mainColor,
    checkIconUrl,
} from '../../handlers/locale';
import { config } from '../../config';
import { User, PartialUser, GroupMember } from 'bloxy/dist/structures';
 
class ActivitycheckCommand extends Command {
    constructor() {
        super({
            trigger: 'activitycheck',
            description: 'Announced the activity check.',
            type: 'ChatInput',
            module: 'moderation',
            args: [],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.admin,
                    value: true,
                }
            ]
        });
    }
 
    async run(ctx: CommandContext) {

  let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1061346004697370705') as TextChannel;
        console.log(channelSend)
            let user = ctx.args['user'];
            console.log(user)

     var strMemberId = ctx.user.id
      strMemberId = strMemberId.replace("<","");
      strMemberId = strMemberId.replace("@","");
      strMemberId = strMemberId.replace("!","");
      strMemberId = strMemberId.replace(">","");

     const dizzyMember = await ctx.guild.members.fetch(strMemberId);
     console.log(dizzyMember)

   const e = new EmbedBuilder()
   .setTitle('**Activity Check**')
   .setDescription('It’s time for our weekly activity check! I ask for all members to interact with this message when it is viewed.\n\nI pay very close attention to the activity checks.')
   .setColor(mainColor)
   .setTimestamp()
let message389789 = await channelSend.send({ embeds: [e] })
await message389789.react('✅');

    const successEmbed = new EmbedBuilder()
    .setAuthor({ name: `Success!`, iconURL: checkIconUrl })
    .setDescription(`Successfully announced the activity check.`)
    .setColor(greenColor)

    ctx.reply({ embeds: [successEmbed] })

   let message86687 = await channelSend.send({
        content: '<@&872619476150018108>',
        allowedMentions: { roles: ['872619476150018108'] },
    });
    }
    }
 
export default ActivitycheckCommand;

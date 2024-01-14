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
 
class ClearCommand extends Command {
    constructor() {
        super({
            trigger: 'clear',
            description: 'Clears the ammount of messages.',
            type: 'ChatInput',
            module: 'admin',
            args: [
                {
                    trigger: 'amount',
                    description: 'The amount of messages to clear.',
                    required: true,
                    type: 'Number',
                }
            ],
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
        const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription(`Successfully cleared ${ctx.args['amount']} messages!`)

        ctx.channel.bulkDelete(ctx.args['amount'])
        ctx.reply({ embeds: [ embed ] });
    }
    }
 
export default ClearCommand;

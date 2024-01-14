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
 
class AddroleCommand extends Command {
    constructor() {
        super({
            trigger: 'addrole',
            description: 'Add a new role, with optional color and hoists.',
            type: 'ChatInput',
            module: 'admin',
            args: [
                {
                    trigger: 'name',
                    description: 'The amount of messages to clear.',
                    required: true,
                    type: 'Number',
                },
                {
                    trigger: 'color',
                    description: 'The amount of messages to clear.',
                    required: false,
                    type: 'String',
                },
                {
                    trigger: 'hoist',
                    description: 'Display role seperately from other roles in the member list?',
                    required: false,
                    type: 'String',
                    choices: [
                        {
                            name : 'True',
                            value : 'true',
                        },
                        {
                            name : 'False',
                            value : 'false',
                        }
                    ]
                },
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
        const guildId = ctx.guild.id;
        const guild = discordClient.guilds.cache.get(guildId);

        const role = await guild.roles.create({
            name: ctx.args['name'],
            color: ctx.args['color'],
            hoist: ctx.args['hoist'],
        });
        
        const roleId = role.id;

        const embed = new EmbedBuilder()
        .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription(`Successfully created <@&${roleId}> with the color ${ctx.args['color']} and hoist ${ctx.args['hoist']}!`)
    }
}
 
export default AddroleCommand;
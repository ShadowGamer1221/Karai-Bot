import { discordClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { TextChannel } from 'discord.js';
import { GetGroupRoles } from 'bloxy/src/client/apis/GroupsAPI';
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
    infoIconUrl,
} from '../../handlers/locale';
import { config } from '../../config';

let autoModerationEnabled = false;

class AutoModerationCommand extends Command {
    constructor() {
        super({
            trigger: 'automod',
            description: 'Enables or disables the automod.',
            type: 'ChatInput',
            module: 'admin',
            args: [
                {
                    trigger: 'state',
                    description: 'Enabled or disabled?',
                    type: 'String',
                    required: true,
                    choices: [
                        {
                            name: 'enable',
                            value: 'true',
                        },
                        {
                            name: 'disable',
                            value: 'false',
                        }
                    ],
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
        const newState = ctx.args['state'];

        if (newState === 'true') {
            autoModerationEnabled = true;
            const enabledEmbed = new EmbedBuilder()
            .setAuthor({ name: `Success!`, iconURL: checkIconUrl})
            .setColor(greenColor)
            .setDescription(`Auto-moderation has been enabled.`)
            ctx.reply({ embeds: [enabledEmbed] });
        } else if (newState === 'false') {
            autoModerationEnabled = false;
            const disabledEmbed = new EmbedBuilder()
            .setAuthor({ name: `Success!`, iconURL: checkIconUrl})
            .setColor(greenColor)
            .setDescription(`Auto-moderation has been disabled.`)
            ctx.reply({ embeds: [disabledEmbed] });
        } else {
            ctx.reply({ content: 'Invalid argument. Use `/automod true` to enable or `/automod false` to disable auto-moderation.' });
        }
    }
}

discordClient.on('messageCreate', async (message) => {
    if (autoModerationEnabled) {
        const keywordsToBlock = ['fuck', 'fek', 'fucking', 'nigger', 'n1gger', 'niger', 'n1ger', 'dumbass', 'dumb ass', 'fucking idiot', 'scumbag', 'cum', 'scum bag', 'scum', 'neger'];
        const content = message.content.toLowerCase();

        for (const keyword of keywordsToBlock) {
            if (message.content.toLowerCase().includes(keyword)) {
                
                message.delete();
                let channelSend: TextChannel;
                channelSend = await discordClient.channels.fetch('1168628274759471155') as TextChannel;

                const logEmbed = new EmbedBuilder()
                .setAuthor({ name: `Auto-Moderation Action`, iconURL: infoIconUrl})
                .setColor(mainColor)
                .setDescription(`**User:** <@${message.author.id}>\n**Action:** Message Removed\n**Content:** ${content}`)
                .setTimestamp();
                channelSend.send({ embeds: [logEmbed] })
                
                console.log(`Deleted message with keyword: ${keyword}`);

                const userEmbed = new EmbedBuilder()
                .setAuthor({ name: `Auto-Moderation Action`, iconURL: infoIconUrl})
                .setColor(mainColor)
                .setDescription(`Your message was removed due to inappropriate content.`)
                .setTimestamp();
                message.author.send({ embeds: [userEmbed] });
                break;
            }
        }
    }
});

export default AutoModerationCommand;

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
    redColor,
    xmarkIconUrl,
    infoIconUrl,
} from '../../handlers/locale';
import { config } from '../../config';
import { User, PartialUser, GroupMember } from 'bloxy/dist/structures';

class SlowModeCommand extends Command {
    constructor() {
        super({
            trigger: 'slowmode',
            description: 'Set slow mode on a channel with custom options.',
            type: 'ChatInput',
            module: 'admin',
            args: [
                {
                    trigger: 'channel',
                    description: 'The channel where you want to set slow mode.',
                    type: 'DiscordChannel',
                    required: true,
                },
                {
                    trigger: 'time',
                    description: 'Time interval in seconds (0 to disable slow mode).',
                    type: 'String',
                    required: true,
                    choices: [
                        {
                            name: 'No Cooldown',
                            value: '0',
                        },
                        {
                            name: '5 seconds',
                            value: '5',
                        },
                        {
                            name: '10 seconds',
                            value: '10',
                        },
                        {
                            name: '15 seconds',
                            value: '15',
                        },
                        {
                            name: '30 seconds',
                            value: '30',
                        },
                        {
                            name: '1 minute',
                            value: '60',
                        },
                        {
                            name: '2 minutes',
                            value: '120',
                        },
                        {
                            name: '5 minutes',
                            value: '300',
                        },
                        {
                            name: '10 minutes',
                            value: '600',
                        },
                        {
                            name: '15 minutes',
                            value: '900',
                        },
                        {
                            name: '30 minutes',
                            value: '1800',
                        },
                        {
                            name: '1 hour',
                            value: '3600',
                        },
                        {
                            name: '2 hours',
                            value: '7200',
                        },
                        {
                            name: '3 hours',
                            value: '10800',
                        },
                        {
                            name: '6 hours',
                            value: '21600',
                        },
                    ],
                },
                {
                    trigger: 'reason',
                    description: 'Reason for setting a cooldown?',
                    type: 'String',
                    required: true,
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.admin,
                    value: true,
                },
            ],
        });
    }

    async run(ctx: CommandContext) {
        const channel = ctx.args['channel'];
        const timeInSeconds = ctx.args['time'];
        const reason = ctx.args['reason'];
        const realChannel = await ctx.guild.channels.cache.get(channel);
        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1168628274759471155') as TextChannel;
        let formattedTime;

        if (timeInSeconds >= 3600) {
            // If time is greater than or equal to 1 hour (3600 seconds)
            const hours = Math.floor(timeInSeconds / 3600);
            const remainingSeconds = timeInSeconds % 3600;
            formattedTime = hours > 1 ? `${hours} hours` : `${hours} hour`;
        
            if (remainingSeconds > 0) {
                formattedTime += ` ${remainingSeconds} seconds`;
            }
        } else if (timeInSeconds >= 60) {
            // If time is greater than or equal to 1 minute (60 seconds)
            const minutes = Math.floor(timeInSeconds / 60);
            const remainingSeconds = timeInSeconds % 60;
            formattedTime = minutes > 1 ? `${minutes} minutes` : `${minutes} minute`;
        
            if (remainingSeconds > 0) {
                formattedTime += ` ${remainingSeconds} seconds`;
            }
        } else {
            // If time is in seconds
            formattedTime = timeInSeconds > 1 ? `${timeInSeconds} seconds` : `${timeInSeconds} second`;
        }

        try {
            await realChannel.edit({ rateLimitPerUser: timeInSeconds, reason: reason  });

            const embed = new EmbedBuilder()
                .setAuthor({ name: `Success!`, iconURL: checkIconUrl })
                .setDescription(`Slow mode set to ${formattedTime} for <#${channel}>.`)
                .setColor(greenColor);

            ctx.reply({ embeds: [embed] });

            const logEmbed = new EmbedBuilder()
            .setAuthor({ name: `Karai Logs`, iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`**Staff Member:** <@${ctx.user.id}>\n**Action:** Slow Mode\n**Channel:** <#${channel}>\n**Time:** ${formattedTime}\n**Reason:** ${reason}`)
            .setTimestamp();
            channelSend.send({ embeds: [logEmbed] });
        } catch (error) {
            console.error('Error setting slow mode:', error);

            const errorEmbed = new EmbedBuilder()
                .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
                .setDescription('An error occurred while setting slow mode.')
                .setColor(redColor);

            ctx.reply({ embeds: [errorEmbed] });
        }
    }
}

export default SlowModeCommand;
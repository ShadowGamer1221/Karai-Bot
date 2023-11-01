import { config } from '../../config';
import { checkIconUrl, greenColor, infoIconUrl, mainColor, redColor, xmarkIconUrl } from '../../handlers/locale';
import { discordClient } from '../../main';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { EmbedBuilder, TextChannel } from 'discord.js';

class TimeoutCommand extends Command {
    constructor() {
        super({
            trigger: 'timeout',
            description: 'Timeouts a user from the server.',
            type: 'ChatInput',
            module: 'moderation',
            args: [
                {
                    trigger: 'user',
                    description: 'The user to timeout.',
                    type: 'DiscordUser',
                    required: true,
                },
                {
                    trigger: 'duration',
                    description: 'How long should this user be timeouted?',
                    type: 'String',
                    required: true,
                    choices: [
                        {
                            name: '60 seconds',
                            value: '60000',
                        },
                        {
                            name: '5 minutes',
                            value: '300000',
                        },
                        {
                            name: '10 minutes',
                            value: '600000',
                        },
                        {
                            name: '1 hour',
                            value: '3600000',
                        },
                        {
                            name: '3 hours',
                            value: '10800000',
                        },
                        {
                            name: '6 hours',
                            value: '21600000',
                        },
                        {
                            name: '12 hours',
                            value: '43200000',
                        },
                        {
                            name: '1 day',
                            value: '86400000',
                        },
                        {
                            name: '1 week',
                            value: '604800000',
                        },
                    ],
                },
                {
                    trigger: 'reason',
                    description: 'The reason for the timeout? (optional)',
                    type: 'String',
                    required: false,
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.moderators,
                    value: true,
                },
            ],
        });
    }

    formatDuration(milliseconds) {
        const seconds = milliseconds / 1000;
        if (seconds < 60) {
            return `${Math.floor(seconds)} second(s)`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            return `${minutes} minute(s)`;
        } else if (seconds < 86400) {
            const hours = Math.floor(seconds / 3600);
            return `${hours} hour(s)`;
        } else {
            const days = Math.floor(seconds / 86400);
            return `${days} day(s)`;
        }
    }

    async run(ctx: CommandContext) {
        const userToTimeout = ctx.args['user'];
        const duration = parseInt(ctx.args['duration']);
        const reason = ctx.args['reason'] || 'No reason provided.';

        const member = ctx.guild.members.cache.get(userToTimeout);

        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1168628274759471155') as TextChannel;

        if (!member) {
            return ctx.reply({ content: 'The mentioned user is not in this server.' });
        }

        if (member.bannable) {
            try {
                member.timeout(duration, reason);

                const formattedDuration = this.formatDuration(duration);

                const successEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Success!`, iconURL: checkIconUrl })
                    .setDescription(`Successfully timed out <@${member.id}> from the server for ${formattedDuration}.\nReason: ${reason}`)
                    .setColor(greenColor);

                ctx.reply({ embeds: [successEmbed] });

                const logEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Karai Logs`, iconURL: infoIconUrl })
                    .setColor(mainColor)
                    .setDescription(`**Staff Member:** ${ctx.user}\n**Action:** Timeout\n**Timed Out User:** ${member.user}\n**Duration:** ${formattedDuration}\n**Reason:** ${reason}`);

                channelSend.send({ embeds: [logEmbed] });
            } catch (error) {
                console.error(error);
                const errorEmbed = new EmbedBuilder()
                    .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
                    .setColor(redColor)
                    .setDescription(`An error occurred while trying to timeout the user. Please try again later.`);

                ctx.reply({ embeds: [errorEmbed] });
            }
        } else {
            const noPermsEmbed = new EmbedBuilder()
                .setAuthor({ name: `Error!`, iconURL: xmarkIconUrl })
                .setColor(redColor)
                .setDescription(`I do not have the necessary permissions to timeout this user.`);
                
            ctx.reply({ embeds: [noPermsEmbed] });
        }
    }
}

export default TimeoutCommand;
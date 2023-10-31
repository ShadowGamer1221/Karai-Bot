import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { PermissionResolvable, ChannelType, TextChannel } from 'discord.js';
import { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { redColor, mainColor, infoIconUrl, xmarkIconUrl } from '../../handlers/locale';
import { config } from '../../config';

class CloseApplicationCommand extends Command {
    constructor() {
        super({
            trigger: 'close-application',
            description: 'Close a specific application channel',
            type: 'ChatInput',
            module: 'application',
            args: [
                // Define a string argument to take the channel name or ID.
                {
                    trigger: 'channel',
                    description: 'The application channel name or ID to close',
                    required: true,
                    type: 'DiscordChannel',
                },
                {
                    trigger: 'reason',
                    description: 'The reason for closing this application channel',
                    required: true,
                    type: 'String',
                }
            ],
            permissions: [
                // Specify the staff role ID for staff members.
                {
                    type: 'role',
                    ids: config.permissions.recruiter, // Replace with the actual staff role ID.
                    value: true,
                },
            ],
        });
    }

    async run(ctx: CommandContext) {
        const { guild, user } = ctx;
        const supportChannelIdentifier = ctx.args['channel'];

        const supportChannel = guild.channels.cache.find((channel) => {
            return (
                channel.type === ChannelType.GuildText &&
                (channel.name === supportChannelIdentifier || channel.id === supportChannelIdentifier)
            );
        });

        if (supportChannel) {
            if (supportChannel.name.startsWith('application-')) {
                const closeEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Application Ticket Closed', iconURL: infoIconUrl })
                .setDescription(`The application ticket ${supportChannel} has been closed by <@${user.id}>. Reason: \`${ctx.args['reason']}\``)
                .setColor(mainColor);

            ctx.reply({ embeds: [closeEmbed] });

            const logs = await guild.channels.fetch('1168628274759471155') as TextChannel;
            const logEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Karai Logs', iconURL: infoIconUrl })
            .setDescription(`**Staff Member:** ${user}\n**Action:** Application Ticket Closed\n**Closed Ticket Name:** ${supportChannel.name}\n**Reason:** ${ctx.args['reason']}`)
            .setColor(mainColor)
            .setFooter({ text: `User ID: ${user.id}` })
            .setTimestamp();

            logs.send({ embeds: [logEmbed] });
            supportChannel.delete();
            } else {
                const notSupportTicketEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Not a Application Ticket', iconURL: xmarkIconUrl })
                    .setDescription(`The channel with the name "<#${supportChannelIdentifier}>" is not a application ticket channel.`)
                    .setColor(redColor);

                ctx.reply({ embeds: [notSupportTicketEmbed] });
            }
        } else {
            const notFoundEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Application Channel Not Found', iconURL: xmarkIconUrl })
                .setDescription(`The application channel with the name or ID "${supportChannelIdentifier}" was not found.`)
                .setColor(redColor);

            ctx.reply({ embeds: [notFoundEmbed] });
        }
    }

}

export default CloseApplicationCommand;
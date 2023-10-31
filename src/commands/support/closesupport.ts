import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { PermissionResolvable, ChannelType } from 'discord.js';
import { EmbedBuilder, ButtonStyle, ButtonBuilder, ActionRowBuilder } from 'discord.js';
import { redColor, mainColor, infoIconUrl, xmarkIconUrl } from '../../handlers/locale';
import { config } from '../../config';

class CloseSupportCommand extends Command {
    constructor() {
        super({
            trigger: 'close-support',
            description: 'Close a specific support channel',
            type: 'ChatInput',
            module: 'support',
            args: [
                // Define a string argument to take the channel name or ID.
                {
                    trigger: 'channel',
                    description: 'The support channel name or ID to close',
                    required: true,
                    type: 'DiscordChannel',
                },
            ],
            permissions: [
                // Specify the staff role ID for staff members.
                {
                    type: 'role',
                    ids: config.permissions.ticketsupport, // Replace with the actual staff role ID.
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
            if (supportChannel.name.startsWith('support-')) {
                const closeEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Support Channel Closed', iconURL: infoIconUrl })
                .setDescription(`The support channel ${supportChannel} has been closed by <@${user.id}>`)
                .setColor(mainColor);

            ctx.reply({ embeds: [closeEmbed] });

            supportChannel.delete();
            } else {
                const notSupportTicketEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Not a Support Ticket', iconURL: xmarkIconUrl })
                    .setDescription(`The channel with the name "<#${supportChannelIdentifier}>" is not a support ticket channel.`)
                    .setColor(redColor);

                ctx.reply({ embeds: [notSupportTicketEmbed] });
            }
        } else {
            const notFoundEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Support Channel Not Found', iconURL: xmarkIconUrl })
                .setDescription(`The support channel with the name or ID "${supportChannelIdentifier}" was not found.`)
                .setColor(redColor);

            ctx.reply({ embeds: [notFoundEmbed] });
        }
    }

}

export default CloseSupportCommand;
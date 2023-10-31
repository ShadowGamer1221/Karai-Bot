import { discordClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { ChannelType, OverwriteType, PermissionsBitField, ButtonBuilder, ButtonStyle, EmbedBuilder, TextChannel, GuildMember, User } from 'discord.js';
import { greenColor, infoIconUrl, mainColor, redColor } from '../../handlers/locale';

class CloseCommand extends Command {
    constructor() {
        super({
            trigger: 'close',
            description: 'Close your support channel.',
            type: 'ChatInput',
            module: 'support',
            args: [],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.verified,
                    value: true,
                },
            ],
        });
    }

    async run(ctx: CommandContext) {
        const { user, guild } = ctx;
        const supportChannelNamePattern = `support-${user.tag.replace(/[.#0]/g, '')}`;

        // Find the user's support channel based on the name pattern.
        const supportChannel = guild.channels.cache.find((channel) => {
            return (
                channel.type === ChannelType.GuildText &&
                channel.name === supportChannelNamePattern &&
                channel.permissionOverwrites.cache.some(
                    (permission) =>
                        permission.type === OverwriteType.Member && permission.id === user.id
                )
            );
        });

        if (supportChannel) {
            // Send a DM to the user indicating that their support ticket has been closed.
            const closeEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Support Ticket Closed', iconURL: infoIconUrl })
                .setColor(mainColor)
                .setDescription('Your support ticket has been closed.')
                .setTimestamp();

            const dmChannel = await user.createDM();

            if (dmChannel) {
                dmChannel.send({ embeds: [closeEmbed] }).catch(error => {
                    console.error(`Failed to send a DM: ${error.message}`);
                });
            } else {
                console.error('User has DMs disabled or blocked the bot.');
            }

            // Delete the support channel.
            supportChannel.delete().then(() => {
                // Notify the user that their support channel has been closed.
                const closeEmbed = new EmbedBuilder()
                    .setAuthor({ name: 'Support Ticket Closed', iconURL: infoIconUrl })
                    .setDescription('Your support ticket has been closed.')
                    .setColor(mainColor)
                    .setTimestamp();

                ctx.reply({ embeds: [closeEmbed] });
            });
        } else {
            // Notify the user if their support channel doesn't exist.
            const notFoundEmbed = new EmbedBuilder()
                .setTitle('Support Channel Not Found')
                .setDescription('You do not have an active support channel to close.')
                .setColor(redColor);

            ctx.reply({ embeds: [notFoundEmbed] });
        }
    }
}

export default CloseCommand;
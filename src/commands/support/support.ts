import { discordClient } from '../../main'; // Import necessary modules
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { ChannelType, PermissionsBitField, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { checkIconUrl, greenColor, redColor } from '../../handlers/locale';

class SupportCommand extends Command {
    constructor() {
        super({
            trigger: 'support',
            description: 'Creates a support ticket.',
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
        const categoryID = '1168635890000740442'; // Replace with the actual category ID.
        const staffRoleID = config.permissions.ticketsupport; // Replace with the actual staff role ID.
        const supportChannelNamePattern = `support-${user.tag.replace(/[0]/g, '')}`; // Update the channel name pattern.

        const staffRole = guild.roles.cache.get(`${staffRoleID}`);

        if (!staffRole) {
            console.log('Staff role not found.');
            return;
        }

        // Check if a support channel with the same name pattern exists.
        const existingSupportChannel = guild.channels.cache.find((channel) => {
            return channel.type === ChannelType.GuildText && channel.name === supportChannelNamePattern;
        });

        if (existingSupportChannel) {
            // If a channel with the same name pattern already exists, notify the user.
            const existingSupportEmbed = new EmbedBuilder()
                .setTitle('Existing Support Channel')
                .setDescription(`You already have an existing support channel: ${existingSupportChannel}`)
                .setColor(redColor);

            ctx.reply({ embeds: [existingSupportEmbed] });
        } else {
            // Create a new support channel.
            const supportChannel = await guild.channels.create({
                name: supportChannelNamePattern,
                type: ChannelType.GuildText, // Specify the channel type as text.
                parent: categoryID, // Set the category for the channel.
                permissionOverwrites: [
                    {
                        id: user.id,
                        allow: [PermissionsBitField.Flags.ViewChannel], // Allow the user to view the channel.
                    },
                    {
                        id: staffRole.id,
                        allow: [PermissionsBitField.Flags.ViewChannel], // Allow staff to view the channel.
                    },
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel], // Deny everyone else from viewing the channel.
                    },
                ],
            });

            const welcomeEmbed = new EmbedBuilder()
                .setTitle('Support Request')
                .setDescription('Welcome to the support chat. A support agent will assist you shortly.')
                .setColor(greenColor)
                .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });

            await supportChannel.send({
                content: `<@&${staffRoleID}>`,
                embeds: [welcomeEmbed],
                allowedMentions: {
                    roles: staffRoleID, // Change to an array of strings
                },
            });

            const successEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
                .setColor(greenColor)
                .setDescription(`Successfully created your support ticket in ${supportChannel}!`)
                .setTimestamp();

            ctx.reply({ embeds: [successEmbed] });
        }
    }
}

export default SupportCommand;
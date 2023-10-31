import { discordClient } from '../../main';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { ChannelType, PermissionsBitField, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { checkIconUrl, greenColor, infoIconUrl, mainColor } from '../../handlers/locale';

class ClanApplicationCommand extends Command {
    constructor() {
        super({
            trigger: 'apply',
            description: 'Apply for the crew',
            type: 'ChatInput',
            module: 'application',
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

        // Define a category for the clan application channels (you may need to create the category first).
        const categoryID = '1168840654672109629'; // Replace with the actual category ID.

        // Define a name for the application channel.
        const channelName = `application-${user.tag}`;

        // Get the staff role.
        const staffRole = guild.roles.cache.get(config.permissions.recruiter[0]);

        if (!staffRole) {
            // Handle the case where the staff role is not found.
            console.log('Staff role not found.');
            return;
        }

        // Create the application channel.
        const applicationChannel = await guild.channels.create({
            name: channelName,
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

        // Store the application channel ID for later use.
        const applicationChannelID = applicationChannel.id;

        // Send a welcome message in the channel.
        const welcomeEmbed = new EmbedBuilder()
            .setTitle('Crew Application')
            .setDescription('Welcome to the crew application process. A recruiter will be with you shortly. Please answer the following questions:\n\n**1.** What is your total bounty right now?\n\n**2.** What is your current level?\n\n**3.** How frequently do you plan to be active each day?\n\n**4.** Why are you interested in becoming a part of our crew?')
            .setColor(greenColor) // Green color
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() });

        await applicationChannel.send({ content: `<@&1109445519052390400>`, embeds: [welcomeEmbed], allowedMentions: { roles: ['1109445519052390400'] }});

        // Create a "Close" button.
        const closeButton = new ButtonBuilder()
            .setCustomId('close')
            .setLabel('Close')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger);

        // Send the action row with the "Close" button.
        await applicationChannel.send({
            components: [
                {
                    type: 1,
                    components: [
                        closeButton,
                    ],
                },
            ],
        });

        // Send a success message mentioning the created ticket channel.
        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Success!', iconURL: checkIconUrl }) // Replace with the icon URL.
            .setColor(greenColor) // Green color
            .setDescription(`Successfully created your application ticket in ${applicationChannel}!`)
            .setTimestamp();

        ctx.reply({ embeds: [successEmbed] });

        // Handle button interactions using the "interactionCreate" event.
        discordClient.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'close' && interaction.channel?.id === applicationChannelID) {
                // Handle "Close" button press by deleting the specific application channel.
                applicationChannel.delete()
                    .then(() => {
                        // Send a DM to the user that their application has been closed.
                        const closeEmbed = new EmbedBuilder()
                            .setAuthor({ name: 'Closed', iconURL: infoIconUrl }) // Replace with the icon URL.
                            .setColor(mainColor) // Blue color
                            .setDescription('Your crew application has been closed. If you have been accepted, you should have received a DM from me about your status. If not, please open a new application to inquire about your application status.')
                            .setTimestamp();
    
                        interaction.user.send({ embeds: [closeEmbed] }).catch(console.error);
                    })
                    .catch(console.error);
            }
        });
    }
}

export default ClanApplicationCommand;
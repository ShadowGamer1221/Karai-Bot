import { infoIconUrl, mainColor } from '../../handlers/locale';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js'; // Import necessary classes

class ClanmembersCommand extends Command {
    constructor() {
        super({
            trigger: 'clanmembers-eng',
            description: 'Shows all clan members from the english ARC clan.',
            type: 'ChatInput',
            module: 'miscellaneous',
            args: [],
        });
    }

    async run(ctx: CommandContext) {
        const roleId = '1138884920756944896';

        if (!roleId) {
            return ctx.reply({ content: 'Please provide a valid role ID.' });
        }

        const role = ctx.guild.roles.cache.get(roleId);

        if (!role) {
            return ctx.reply({ content: 'Please provide a valid role ID.' });
        }

        // Get members with the specified role
        const membersWithRole = role.members;

        // Create an array of mentionable member usernames
        const mentionableMembers = membersWithRole.map((member) => `» **${member.user.username}**`);

        // Calculate the number of members per page
        const membersPerPage = 10;
        const totalPages = Math.ceil(mentionableMembers.length / membersPerPage);

        // Initialize the current page
        let currentPage = 1;

        // Function to create a page based on the current page number

                const prevButton = new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary);

                const nextButton = new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary);

                    const memberEmbed = new EmbedBuilder()
                    .setAuthor({ name: `ARC Clan Members`, iconURL: infoIconUrl })
                    .setColor(mainColor)
                    .setFooter({ text: `Page ${currentPage}/${totalPages}` })
                    .addFields(
                        { name: 'All ENG ARC Clan Members', value: `${mentionableMembers.slice((currentPage - 1) * membersPerPage, currentPage * membersPerPage).join('\n\n')}`, inline: false },
                    )



        // Create and send the initial page
        const message = await ctx.reply({
            embeds: [memberEmbed],
            components: [{
                type: 1,
                components: [
                    prevButton, nextButton,
                ],
            },
        ],
        });

        // Create a button collector to handle button interactions
        const collector = message.createMessageComponentCollector({ filter: (interaction) => interaction.customId === 'prev' || interaction.customId === 'next', time: 60000 });

        collector.on('collect', (interaction) => {
            if (interaction.customId === 'prev') {
                // Move to the previous page
                currentPage = Math.max(1, currentPage - 1);
            } else if (interaction.customId === 'next') {
                // Move to the next page
                currentPage = Math.min(totalPages, currentPage + 1);
            }
        
            // Update the embed with the members for the current page
            memberEmbed.setFields(
                { name: 'All ENG ARC Clan Members', value: `${mentionableMembers.slice((currentPage - 1) * membersPerPage, currentPage * membersPerPage).join('\n\n')}`, inline: false }
            ).setFooter({ text: `Page ${currentPage}/${totalPages}` });

            // Update the content with the new page
            interaction.update({ embeds: [memberEmbed], components: [
                {
                    type: 1,
                    components: [
                        prevButton, nextButton,
                    ],
                }
            ] });
        });

        const prevButtonDisabled = new ButtonBuilder()
            .setCustomId('prev')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        const nextButtonDisabled = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true);

        collector.on('end', () => {
            // Remove the buttons from the message
            message.edit({ components: [{
                type: 1,
                components: [
                    prevButtonDisabled, nextButtonDisabled,
                ],
            },
        ],
     });

     const timeisupEmbed = new EmbedBuilder()
        .setAuthor({ name: `Time Is Up!`, iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription(`You can no longer use the buttons to navigate through the pages. Please use the command again to view the list of clan members.`)
        .setTimestamp();

        message.edit({ embeds: [timeisupEmbed] });
        });
    }
}

export default ClanmembersCommand;

import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, InteractionType } from 'discord.js';
import { config } from '../../config';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { queue } from './play'; // Ensure to import the queue from your PlayCommand
import { infoIconUrl, mainColor } from '../../handlers/locale';

class QueueCommand extends Command {
    constructor() {
        super({
            trigger: 'queue',
            description: 'Shows the current music queue.',
            type: 'ChatInput',
            module: 'music',
            args: [],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.verified,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext, page: number = 1) {
        const serverQueue = queue.get(ctx.guild.id);

        if (!serverQueue || serverQueue.songs.length === 0) {
            return ctx.reply('There are no songs in the queue.');
        }
    
        const pageSize = 10; // Number of songs per page
        const pageCount = Math.ceil(serverQueue.songs.length / pageSize);
        let currentPage = 1;
    
        const embed = this.createQueueEmbed(serverQueue, currentPage, pageSize);
    
        const previousButton = new ButtonBuilder()
            .setCustomId('previous')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)
    
        const nextButton = new ButtonBuilder()
            .setCustomId('next')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
    
    
        const message = await ctx.reply({ 
            embeds: [embed], 
            components: [
                {
                    type: 1,
                    components: [
                        previousButton,
                        nextButton,
                    ],
                },
            ],
        });

        // Collector for button interaction
        const filter = (interaction) => interaction.user.id === ctx.member.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === 'next') {
                currentPage = Math.min(pageCount, currentPage + 1);
            } else if (interaction.customId === 'previous') {
                currentPage = Math.max(1, currentPage - 1);
            }

            const updatedEmbed = this.createQueueEmbed(serverQueue, currentPage, pageSize);

            await interaction.update({ embeds: [updatedEmbed], components: [
                {
                    type: 1,
                    components: [
                        previousButton,
                        nextButton,
                    ],
                },
            ], });
        });

        collector.on('end', () => {
            message.edit({ components: [] }); // Disable buttons after the collector ends
        });
    }

    createQueueEmbed(queue, page, pageSize) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const description = queue.songs.slice(start, end).map((song, index) => {
            return `${start + index + 1}. ${song.title} (requested by <@${song.requester}>)`;
        }).join('\n');

        return new EmbedBuilder()
            .setAuthor({ name: 'Music Queue', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(description)
            .setFooter({ text: `Page ${page}` });
    }
    
}

export default QueueCommand;
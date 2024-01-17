import { CommandInteraction, EmbedBuilder, TextInputBuilder } from 'discord.js';
import { discordClient } from '../../main';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { ButtonBuilder, ButtonStyle, MessageReaction, TextChannel, User } from 'discord.js';
import { setTimeout } from 'timers';
import { checkIconUrl, greenColor, infoIconUrl, mainColor } from '../../handlers/locale';
import { ModalBuilder } from 'discord.js';
import { TextInputStyle } from 'discord.js';
import { ModalActionRowComponentBuilder } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import { config } from '../../config';

class GiveawayCommand extends Command {
    constructor() {
        super({
            trigger: 'giveaway',
            description: 'Starts a giveaway.',
            type: 'ChatInput',
            module: 'fun',
            args: [],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.admin,
                    value: true,
                }
            ] // Adjust permissions as needed
        });
    }

    async run(ctx: CommandContext) {
        let channelToSend: TextChannel;
        channelToSend = await discordClient.channels.fetch('1168601617524854824') as TextChannel;
        console.log(channelToSend);

        const modal = new ModalBuilder()
        .setTitle('Create a Giveaway')
        .setCustomId('create')

        const duration2 = new TextInputBuilder()
        .setCustomId('duration')
        .setLabel('Duration')
        .setPlaceholder('Ex: 15 minutes')
        .setMinLength(1)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const winners2 = new TextInputBuilder()
        .setCustomId('winners')
        .setLabel('Number of winners')
        .setMinLength(1)
        .setValue('1')
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const prize2 = new TextInputBuilder()
        .setCustomId('prize')
        .setLabel('Prize')
        .setPlaceholder('Ex: 1000 robux')
        .setMinLength(1)
        .setRequired(true)
        .setStyle(TextInputStyle.Short)

        const durationInput = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(duration2);
        const winnersInput = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(winners2);
        const prizeInput = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(prize2);

        modal.addComponents(durationInput, winnersInput, prizeInput);

        const interaction = ctx.subject as CommandInteraction;

        await interaction.showModal(modal);

        interaction.awaitModalSubmit({ time: 60000, filter: i => i.customId === 'create' })
        .then(async (modalInteraction) => {
            const duration = modalInteraction.fields.getTextInputValue('duration');
            const prize = modalInteraction.fields.getTextInputValue('prize');
            const winners = modalInteraction.fields.getTextInputValue('winners');
            const created = new EmbedBuilder()
            .setAuthor({ name: 'Success!', iconURL: checkIconUrl })
            .setColor(greenColor)
            .setDescription(`Successfully created a giveaway!\n\nPrize: **${prize}**\nWinners: **${winners}**\nTime: **${duration} minutes**`)
            await modalInteraction.reply({ embeds: [created], ephemeral: true });

    
            const giveawayEmbed = new EmbedBuilder()
            .setAuthor({ name: '🎉Giveaway 🎉', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`Host: **<@${interaction.member.user.id}>**\nPrize: **${prize}**\nWinners: **${winners}**\nReact with 🎉 to enter!\nTime: **${duration} minutes**`);
            const giveawayMessage = await channelToSend.send({ embeds: [giveawayEmbed] });
            
            giveawayMessage.react('🎉');
    
            // Set a timeout for the giveaway duration
            setTimeout(async () => {
                const reaction = giveawayMessage.reactions.cache.get('🎉');
                const users = await reaction.users.fetch();
                const eligibleUsers = users.filter(user => !user.bot);
                const winner = eligibleUsers.random(winners as any);
    
                channelToSend.send(`🎉 The winner(s) of the **${prize}** giveaway is ${winner}!`);
            }, duration as any * 60000); // Convert minutes to milliseconds
        })

    }
}

export default GiveawayCommand;
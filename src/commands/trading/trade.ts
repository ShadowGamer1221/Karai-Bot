import { discordClient } from '../../main';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import {
    checkIconUrl,
    mainColor,
    greenColor,
    infoIconUrl,
} from '../../handlers/locale';

class TradeCommand extends Command {
    constructor() {
        super({
            trigger: 'trade',
            description: 'Sends a trade request into #trading',
            type: 'ChatInput',
            module: 'trading',
            args: [
                {
                    trigger: 'item',
                    description: 'The item that you want to trade',
                    required: true,
                    type: 'String',
                },
                {
                    trigger: 'amount',
                    description: 'How much do you want to trade?',
                    required: true,
                    type: 'Number',
                },
                {
                    trigger: 'item-wanted',
                    description: 'Which item do you want?',
                    required: true,
                    type: 'String',
                },
                {
                    trigger: 'amount-needed',
                    description: 'How much do you want to have of the wanted item?',
                    required: true,
                    type: 'Number',
                },
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.verified,
                    value: true,
                }
            ]
        });
    }

    async run(ctx: CommandContext) {
        const guild = ctx.guild;
        let channelSend: TextChannel;

        try {
            // Fetch the trading channel by its ID
            channelSend = await discordClient.channels.fetch('1059790913989267547') as TextChannel;
        } catch (error) {
            console.error(error);
            return ctx.reply({ content: 'The trading channel is not accessible or does not exist.' });
        }

        const item = ctx.args['item'];
        const amount = ctx.args['amount'];
        const itemWanted = ctx.args['item-wanted'];
        const amountNeeded = ctx.args['amount-needed'];

        // Create an embed to send to the trading channel
        const tradeRequestEmbed = new EmbedBuilder()
            .setAuthor({ name: `New Trade Request`, iconURL: infoIconUrl })
            .setColor(mainColor)
            .setFields([
                { name: 'User', value: `<@${ctx.user.id}>`, inline: true },
                { name: 'Item for Trade', value: item, inline: true },
                { name: 'Amount for Trade', value: amount.toString(), inline: true },
                { name: 'Item Wanted', value: itemWanted, inline: true },
                { name: 'Amount Needed', value: amountNeeded.toString(), inline: true },
            ]);

        // Send the trade request embed to the trading channel
        channelSend.send({ embeds: [tradeRequestEmbed] });

        // Send a success message to the user
        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: `Success!`, iconURL: checkIconUrl })
            .setColor(greenColor)
            .setDescription(`Successfully sent the trade request into ${channelSend}!`)
            .setTimestamp();

        ctx.reply({ embeds: [successEmbed] });
    }
}

export default TradeCommand;
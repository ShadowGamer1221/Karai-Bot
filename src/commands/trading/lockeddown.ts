import { discordClient } from '../../main';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { Command } from '../../structures/Command';
import { config } from '../../config';
import { GuildMember } from 'discord.js';
import { groupBy } from 'lodash';
import {
    checkIconUrl,
    getCommandInfoEmbed,
    getCommandListEmbed,
    getCommandNotFoundEmbed,
    mainColor,
    greenColor,
    redColor,
    infoIconUrl,
} from '../../handlers/locale';

class LockCommand extends Command {
    constructor() {
        super({
            trigger: 'lockmessage',
            description: 'Sends the lock info for trading and advises using /trade.',
            type: 'ChatInput',
            module: 'trading',
        });
    }

    async run(ctx: CommandContext) {
        
        let channelSend: TextChannel;
        channelSend = await discordClient.channels.fetch('1059790913989267547') as TextChannel;

        const embed = new EmbedBuilder()
        .setAuthor({ name: 'Trading', iconURL: infoIconUrl })
        .setColor(mainColor)
        .setDescription('This channel is now locked for trading. Please use `/trade` in <#872399914313859132> channel.')
        .setTimestamp();

        channelSend.send({ embeds: [embed] });

        const successEmbed = new EmbedBuilder()
        .setAuthor({ name: `Success!`, iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription(`The channel has been locked for trading.`)
        .setTimestamp();

        ctx.reply({ embeds: [successEmbed] });
    }
}

export default LockCommand;
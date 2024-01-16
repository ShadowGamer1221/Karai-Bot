import { EmbedBuilder } from 'discord.js';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { queue } from './play'; // Make sure to import the queue from your queue manager
import { checkIconUrl, greenColor, redColor, xmarkIconUrl } from '../../handlers/locale';

class LeaveCommand extends Command {
    constructor() {
        super({
            trigger: 'leave',
            description: 'Leave the voice channel and clear the queue.',
            type: 'ChatInput',
            module: 'music',
            args: [],
            permissions: [] // Define necessary permissions
        });
    }

    async run(ctx: CommandContext) {
        const serverQueue = queue.get(ctx.guild.id);

        if (!serverQueue) {
            const notInVoiceEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Not in Voice Channel', iconURL: xmarkIconUrl })
            .setColor(redColor)
            .setDescription('I am not in a voice channel.');
            return ctx.reply({ embeds: [notInVoiceEmbed] });
        }

        serverQueue.songs = [];
        if (serverQueue.connection) {
            serverQueue.connection.destroy();
        }
        queue.delete(ctx.guild.id);

        const leftEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Left Voice Channel', iconURL: checkIconUrl })
        .setColor(greenColor)
        .setDescription('Left the voice channel and cleared the queue.');

        ctx.reply({ embeds: [leftEmbed] });
    }
}

export default LeaveCommand;
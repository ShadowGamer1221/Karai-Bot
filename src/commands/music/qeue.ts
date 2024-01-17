import { EmbedBuilder } from 'discord.js';
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

    async run(ctx: CommandContext) {
        const serverQueue = queue.get(ctx.guild.id);

        if (!serverQueue || serverQueue.songs.length === 0) {
            return ctx.reply('There are no songs in the queue.');
        }

        const queueDescription = serverQueue.songs.map((song, index) => {
            return `${index + 1}. ${song.title} (requested by <@${song.requester}>)`;
        }).join('\n');
    
        const embed = new EmbedBuilder()
            .setAuthor({ name: 'Music Queue', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(queueDescription);
    
        ctx.reply({ embeds: [embed] });
    }
}

export default QueueCommand;
import { config } from '../../config';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { queue } from './play'; // Ensure to import the queue from your PlayCommand

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

        let message = '**Music Queue:**\n';
        serverQueue.songs.forEach((song, index) => {
            message += `${index + 1}. ${song.title} (requested by <@${song.requester}>)\n`;
        });

        ctx.reply(message);
    }
}

export default QueueCommand;
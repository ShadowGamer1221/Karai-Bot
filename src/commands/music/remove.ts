import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { queue } from './play'; // Import the queue from your PlayCommand

class RemoveCommand extends Command {
    constructor() {
        super({
            trigger: 'remove',
            description: 'Remove a song from the queue by its position.',
            type: 'ChatInput',
            module: 'music',
            args: [
                {
                    trigger: 'position',
                    description: 'The position of the song in the queue to remove.',
                    type: 'Number', // Ensure this matches the type system of your command framework
                    required: true
                }
            ],
            permissions: [] // Set permissions as needed
        });
    }

    async run(ctx) {
        const position = ctx.args['position']; // Ensure this matches how arguments are accessed in your framework
        const serverQueue = queue.get(ctx.guild.id);

        if (!serverQueue || serverQueue.songs.length === 0) {
            return ctx.reply('The queue is currently empty.');
        }

        if (position < 1 || position > serverQueue.songs.length) {
            return ctx.reply(`Please provide a valid position between 1 and ${serverQueue.songs.length}.`);
        }

        // Remove the song from the queue
        const removedSong = serverQueue.songs.splice(position - 1, 1)[0];
        ctx.reply(`Removed: ${removedSong.title} from the queue.`);
    }
}

export default RemoveCommand;
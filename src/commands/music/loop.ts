import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { queue } from './play'; // Adjust this import to match your file structure

class LoopCommand extends Command {
    constructor() {
        super({
            trigger: 'loop',
            description: 'Toggle loop mode for the current song or the entire queue.',
            type: 'ChatInput',
            module: 'music',
            args: [
                {
                    trigger: 'mode',
                    description: 'Choose loop mode: "song" or "queue".',
                    type: 'String',
                    required: true,
                    choices: [
                        {
                            name: 'song',
                            value: 'song'
                        },
                        {
                            name: 'queue',
                            value: 'queue'
                        }
                    ]
                }
            ],
            permissions: [] // Set permissions as needed
        });
    }

    async run(ctx: CommandContext) {
        const mode = ctx.args['mode'];
        const serverQueue = queue.get(ctx.guild.id);

        if (!serverQueue) {
            return ctx.reply('There is no music playing in this server.');
        }

        if (mode === 'song') {
            serverQueue.loopSong = !serverQueue.loopSong;
            serverQueue.loopQueue = false; // Turn off queue loop if song loop is activated
            ctx.reply(`Looping of current song is now ${serverQueue.loopSong ? 'enabled' : 'disabled'}.`);
        } else if (mode === 'queue') {
            serverQueue.loopQueue = !serverQueue.loopQueue;
            serverQueue.loopSong = false; // Turn off song loop if queue loop is activated
            ctx.reply(`Looping of the entire queue is now ${serverQueue.loopQueue ? 'enabled' : 'disabled'}.`);
        }
    }
}

export default LoopCommand;
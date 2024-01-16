import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { config } from '../../config';
import { queue } from './play'; // Assuming this is where your queue is stored
import { EmbedBuilder } from 'discord.js';
import { infoIconUrl, mainColor } from '../../handlers/locale';

class SkipCommand extends Command {
    constructor() {
        super({
            trigger: 'skip',
            description: 'Skip the currently playing song.',
            type: 'ChatInput',
            module: 'music',
            args: [],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.verified,
                    value: true,
                },
            ] // Define necessary permissions
        });
    }

    async run(ctx: CommandContext) {
        const serverQueue = queue.get(ctx.guild.id);

        if (!serverQueue) {
            return ctx.reply('There is no song that I could skip!');
        }

        if (!serverQueue.songs.length) {
            return ctx.reply('The queue is empty!');
        }

        // Skip the current song
        this.skipSong(ctx.guild.id);
        const skippedEmbed = new EmbedBuilder()
        .setAuthor({ name: 'Skipped Song', iconURL: infoIconUrl })
        .setDescription(`Skipped the current song!`)
        .setColor(mainColor);
        ctx.reply({ embeds: [skippedEmbed] });
    }

    skipSong(guildId: string) {
        const serverQueue = queue.get(guildId);
        if (!serverQueue) {
            return;
        }

        // End the current song by emitting the Idle event
        serverQueue.player.stop();
    }
}

export default SkipCommand;
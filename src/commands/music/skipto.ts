// Import necessary classes and structures
import { createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { queue } from './play'; // Adjust this import to match your file structure
import ytdl from 'ytdl-core';
import { EmbedBuilder } from 'discord.js';
import { infoIconUrl, mainColor } from '../../handlers/locale';
import { config } from '../../config';

class SkipToCommand extends Command {
    constructor() {
        super({
            trigger: 'skipto',
            description: 'Skip to a specific song in the queue.',
            type: 'ChatInput',
            module: 'music',
            args: [
                {
                    trigger: 'position',
                    description: 'The position of the song in the queue to skip to.',
                    type: 'Number',
                    required: true
                }
            ],
            permissions: [
                {
                    type: 'role',
                    ids: config.permissions.verified,
                    value: true,
                },
            ]
        });
    }

    async run(ctx) {
        const position = ctx.args['position'];
        const serverQueue = queue.get(ctx.guild.id);

        if (!serverQueue) {
            return ctx.reply('There is no music playing in this server.');
        }

        if (position < 1 || position > serverQueue.songs.length) {
            return ctx.reply(`Please enter a valid song position (1-${serverQueue.songs.length}).`);
        }

        // Skip to the specified song
        serverQueue.songs = serverQueue.songs.slice(position - 1);
        if (serverQueue.player) {
            serverQueue.player.stop();
        }

        // Start playing the selected song
        this.startPlaying(ctx.guild.id, serverQueue.songs[0]);

        const embed = new EmbedBuilder()
        .setAuthor({ name: 'Skipped Song', iconURL: infoIconUrl })
        .setDescription(`Skipped to song number ${position}: ${serverQueue.songs[0].title}`)
        .setColor(mainColor);

        ctx.reply({ embeds: [embed] });
    }

    startPlaying(guildId, song) {
        const serverQueue = queue.get(guildId);

        if (!song) {
            serverQueue.connection.destroy();
            queue.delete(guildId);
            return;
        }

        // Create a stream using ytdl and play the song
        try {
            const stream = ytdl(song.url, { filter: 'audioonly' });
            const resource = createAudioResource(stream);
            serverQueue.player.play(resource);

            // Subscribe the connection to the player and play the song
            serverQueue.connection.subscribe(serverQueue.player);

            // Listener for when the song ends
            serverQueue.player.on(AudioPlayerStatus.Idle, () => {
                // Remove the finished song from the queue and play the next
                serverQueue.songs.shift();
                this.startPlaying(guildId, serverQueue.songs[0]);
            });

            // Error handling
            serverQueue.player.on('error', error => {
                console.error('Error in player: ', error);
                serverQueue.songs.shift();
                this.startPlaying(guildId, serverQueue.songs[0]);
            });

        } catch (error) {
            console.error('Error starting playback: ', error);
            serverQueue.connection.destroy();
            queue.delete(guildId);
        }
    }
}

export default SkipToCommand;
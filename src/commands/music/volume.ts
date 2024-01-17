import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { AudioResource, StreamType, createAudioResource } from '@discordjs/voice';
import { queue } from './play'; // Ensure to import the queue from your PlayCommand
import ytdl from 'ytdl-core';

class VolumeCommand extends Command {
  constructor() {
    super({
      trigger: 'volume',
      description: 'Adjusts the volume of the current song.',
      type: 'ChatInput',
      module: 'music',
      args: [
        {
          trigger: 'level',
          description: 'Volume level (0 to 100).',
          type: 'Number',
          required: true
        }
     

],
permissions: []
});
}

async run(ctx: CommandContext) {
const volumeLevel = ctx.args['level'];
if (isNaN(volumeLevel) || volumeLevel < 0 || volumeLevel > 100) {
return ctx.reply('Please provide a volume level between 0 and 100.');
}

const serverQueue = queue.get(ctx.guild.id);
if (!serverQueue || !serverQueue.player) {
  return ctx.reply('There is no song currently playing.');
}

const currentSong = serverQueue.songs[0];
if (!currentSong) {
  return ctx.reply

('There is no song currently playing.');
}

// Adjust volume
try {
  const volume = volumeLevel / 100; // Volume must be a value between 0 and 1
  const stream = ytdl(currentSong.url, { filter: 'audioonly' });
  const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary, inlineVolume: true });
  resource.volume.setVolume(volume);
  serverQueue.player.play(resource);

  ctx.reply(`Volume set to ${volumeLevel}%`);
} catch (error) {
  console.error('Error setting volume:', error);
return ctx.reply('There was an error adjusting the volume.');
}
}
}
export default VolumeCommand;
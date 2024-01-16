import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import { EmbedBuilder, GuildMember, Message } from 'discord.js';
import SpotifyWebApi from 'spotify-web-api-node';
import { google } from 'googleapis';
import { infoIconUrl, mainColor } from '../../handlers/locale';

const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyA5voxM5zJoUggTyE4gr4fPNtmjMshuMh0'
});

const spotifyApi = new SpotifyWebApi({
  clientId: '8fee832fe5eb42e0b418b598f7659565',
  clientSecret: 'd05ef47e548e4163b2a7bb70446b3a71'
});

interface Song {
  title: string;
  url: string;
  requester: string;
}

interface QueueContract {
  textChannel: Message['channel'];
  voiceChannel: GuildMember['voice']['channel'];
  connection: null | ReturnType<typeof joinVoiceChannel>;
  songs: Song[];
  player: ReturnType<typeof createAudioPlayer>;
  playing: boolean;
}

const queue = new Map<string, QueueContract>();
export { queue };

class PlayCommand extends Command {
  constructor() {
    super({
      trigger: 'play',
      description: 'Play a song from Spotify or YouTube in your voice channel.',
      type: 'ChatInput',
      module: 'music',
      args: [
        {
          trigger: 'song',
          description: 'The name of the song or YouTube URL to play.',
          type: 'String',
          required: true
        }
      ],
      permissions: []
    });
  }

  async run(ctx: CommandContext) {
    const songArg = ctx.args['song'];
    let songInfo: Song;

    if (ytdl.validateURL(songArg)) {
        // YouTube URL handling
        const songDetails = await ytdl.getBasicInfo(songArg);
        songInfo = {
          title: songDetails.videoDetails.title,
          url: songArg,
          requester: ctx.member.user.tag
        };
      } else {
        // Spotify search or direct song name search
        const trackDetails = await this.searchSpotify(songArg) || await this.getSpotifyTrackDetails(songArg);
        if (!trackDetails) {
          return ctx.reply('Could not find the track on Spotify.');
        }
        const youtubeURL = await this.searchYouTube(`${trackDetails.name} ${trackDetails.artist}`);
        if (!youtubeURL) {
          return ctx.reply('Could not find a YouTube equivalent for the provided track.');
        }
        songInfo = {
          title: `${trackDetails.name} by ${trackDetails.artist}`,
          url: youtubeURL,
          requester: ctx.member.user.id
        };
      }

    const voiceChannel = ctx.member.voice.channel;
    if (!voiceChannel) {
      return ctx.reply

('You need to be in a voice channel to play music!');
}

const serverQueue = queue.get(ctx.guild.id);

if (serverQueue) {
  serverQueue.songs.push(songInfo);
  return ctx.reply(`${songInfo.title} has been added to the queue by <@${songInfo.requester}>`);
}

const queueContract: QueueContract = {
  textChannel: ctx.channel,
  voiceChannel: voiceChannel,
  connection: null,
  songs: [songInfo],
  player: createAudioPlayer(),
  playing: true
};

queue.set(ctx.guild.id, queueContract);

try {
  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: ctx.guild.id,
    adapterCreator: ctx.guild.voiceAdapterCreator,
  });

  queueContract.connection = connection;
  this.play(ctx.guild.id, queueContract.songs[0]);
} catch (error) {
  console.error(error);
  queue.delete(ctx.guild.id);
  return ctx.reply('There was an error connecting to the voice channel.');
}

}

async searchSpotify(query: string): Promise<{ name: string, artist: string } | null> {
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);

      const response = await spotifyApi.searchTracks(query, { limit: 1 });
      const track = response.body.tracks.items[0];
      if (!track) return null;

  return { name: track.name, artist: track.artists[0].name };
} catch (error) {
  console.error('Error searching Spotify:', error);
  return null;
}

}

isSpotifyUrl(url: string): boolean {
return url.includes('spotify.com/track/');
}

async getSpotifyTrackDetails(url: string): Promise<{ name: string, artist: string } | null> {
    const matches = url.match(/track\/([a-zA-Z0-9]+)/);
    if (!matches) return null;
    const trackId = matches[1];

    try {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);

      const trackData = await spotifyApi.getTrack(trackId);
      const track = trackData.body;
      return { name: track.name, artist: track.artists[0].name };
    } catch (error) {
      console.error('Error fetching Spotify track details:', error);
      return null;
    }
  }

  async searchYouTube(query: string): Promise<string> {
    try {
      const response = await youtube.search.list({
        part: ['snippet'],
        q: query,
        maxResults: 1,
        type: ['video']
      });

      const videoId = response.data.items[0]?.id.videoId;
      return `https://www.youtube.com/watch?v=${videoId}`;
    } catch (error) {
      console.error('Error searching on YouTube:', error);
      return null;
    }
  }

play(guildId: string, song: Song) {
const serverQueue = queue.get(guildId);

if (!serverQueue) return;

if (!song) {
  serverQueue.connection.destroy();
  queue.delete(guildId);
  return;
}

const stream = ytdl(song.url, { filter: 'audioonly' });
const resource = createAudioResource(stream);
serverQueue.player.play(resource);

serverQueue.connection.subscribe(serverQueue.player);

serverQueue.player.on(AudioPlayerStatus.Idle, () => {
  serverQueue.songs.shift();
  if (serverQueue.songs.length > 0) {
    this.play(guildId, serverQueue.songs[0]);
  } else {
    serverQueue.connection.destroy();
    queue.delete(guildId);
  }
});

serverQueue.player.on('error', error => console.error(error));


const embed = new EmbedBuilder()
.setAuthor({ name: 'Starting Playing...', iconURL: infoIconUrl })
.setColor(mainColor)
.setDescription(`[${song.title}](${song.url})`)
.setFields([
    {
        name: 'Title',
        value: song.title, inline: true
    },
    {
        name: 'Requested By',
        value: `<@${song.requester}>`, inline: true
    }
    ]);

serverQueue.textChannel.send({ embeds: [embed] });
serverQueue.voiceChannel.send({ embeds: [embed] });

}
}

export default PlayCommand;
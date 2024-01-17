import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import ytdl from 'ytdl-core';
import { ChatInputCommandInteraction, CommandInteraction, EmbedBuilder, GuildMember, Message } from 'discord.js';
import SpotifyWebApi from 'spotify-web-api-node';
import { google } from 'googleapis';
import { infoIconUrl, mainColor } from '../../handlers/locale';

// Initialize YouTube and Spotify APIs
const youtube = google.youtube({
  version: 'v3',
  auth: 'AIzaSyDakPFQh1ibLiV8csW-OF2XXdLY9xNKUJ0'
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
  loopSong: boolean; // Indicates if the current song is set to loop
  loopQueue: boolean; // Indicates if the entire queue is set to loop
}

const queue = new Map<string, QueueContract>();
export { queue, Song };

class PlayCommand extends Command {
  constructor() {
    super({
      trigger: 'play',
      description: 'Play a song or a playlist from Spotify or YouTube in your voice channel.',
      type: 'ChatInput',
      module: 'music',
      args: [
        {
          trigger: 'song',
          description: 'The Spotify URL, YouTube URL, or name of the song or playlist to play.',
          type: 'String',
          required: true
        }
      ],
      permissions: []
    });
  }

  async run(ctx: CommandContext) {
    const songArg = ctx.args['song'];
    let songsToAdd: Song[] = [];

    if (this.isYoutubePlaylistUrl(songArg)) {
      const playlistId = this.extractYoutubePlaylistId(songArg);
      songsToAdd = await this.fetchYoutubePlaylistSongs(playlistId);
    } else if (this.isSpotifyPlaylistUrl(songArg)) {
      const playlistId = this.extractSpotifyPlaylistId(songArg);
      const playlistSongs = await this.fetchSpotifyPlaylistSongs(playlistId);

if (!playlistSongs || playlistSongs.length === 0) {
  return ctx.reply('Could not find the track on Spotify.');
}

      songsToAdd = await this.fetchSpotifyPlaylistSongs(playlistId);
    } else {
      if (ytdl.validateURL(songArg)) {
        // YouTube URL handling
        const songDetails = await ytdl.getBasicInfo(songArg);
        songsToAdd = [{
            title: songDetails.videoDetails.title,
            url: songArg,
            requester: ctx.member.user.tag,
        }];        
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
        songsToAdd = [{
          title: `${trackDetails.name} by ${trackDetails.artist}`,
          url: youtubeURL,
          requester: ctx.member.user.id
        }];
      }
    }

    const serverQueue = queue.get(ctx.guild.id);
    if (!serverQueue) {
      // Create a new queue contract
      const voiceChannel = ctx.member.voice.channel;
      if (!voiceChannel) {
        return ctx.reply('You need to be in a voice channel to play music!');
      }

      const newQueueContract: QueueContract = {
        textChannel: ctx.channel,
        voiceChannel: voiceChannel,
        connection: null,
        songs: songsToAdd, // songsToAdd contains either playlist songs or a single song
        player: createAudioPlayer(),
        playing: false,
        loopSong: false,
        loopQueue: false
      };

      queue.set(ctx.guild.id, newQueueContract);
      this.startPlaying(ctx.guild.id, newQueueContract);
    } else {
      songsToAdd.forEach(song => serverQueue.songs.push(song));
      ctx.reply(`${songsToAdd.length} song(s) have been added to the queue.`);
    }
  }

  // Start playing the first song in the queue
  startPlaying(guildId: string, queueContract: QueueContract) {
    const song = queueContract.songs[0];
    if (!song) {
      queue.delete(guildId);
      return;
    }

    // Join the voice channel and start playing
    const connection = joinVoiceChannel({
      channelId: queueContract.voiceChannel.id,
      guildId: guildId,
      adapterCreator: queueContract.voiceChannel.guild.voiceAdapterCreator
    });

    queueContract.connection = connection;
    if (ytdl.validateURL(song.url)) {
      const stream = ytdl(song.url, { filter: 'audioonly', quality: 'lowest' });
      const resource = createAudioResource(stream);
      queueContract.player.play(resource);
      connection.subscribe(queueContract.player);

      queueContract.player.on(AudioPlayerStatus.Idle, () => {
        queueContract.songs.shift();
        this.startPlaying(guildId, queueContract);
      });

      queueContract.player.on('error', error => console.error(error));
      const embed = new EmbedBuilder()
      .setAuthor({ name: 'Now Playing', iconURL: infoIconUrl })
      .setColor(mainColor)
      .setDescription(`[${song.title}](${song.url})`)
      .setFields([
          { name: 'Requested By', value: `<@${song.requester}>`, inline: true },
          { name: 'Title', value: song.title, inline: true }
      ]);
  
  queueContract.textChannel.send({ embeds: [embed] });  
    } else {
      // Not a YouTube URL, search YouTube for equivalent
      this.searchYouTube(song.title)
        .then(url => {
          if (url) {
            song.url = url;
            const stream = ytdl(song.url, { filter: 'audioonly', quality: 'lowest' });
            const resource = createAudioResource(stream);
            queueContract.player.play(resource);
            connection.subscribe(queueContract.player);

            queueContract.player.on(AudioPlayerStatus.Idle, () => {
              queueContract.songs.shift();
              this.startPlaying(guildId, queueContract);
            });

            queueContract.player.on('error', error => console.error(error));
            const embed = new EmbedBuilder()
            .setAuthor({ name: 'Now Playing', iconURL: infoIconUrl })
            .setColor(mainColor)
            .setDescription(`[${song.title}](${song.url})`)
            .setFields([
                { name: 'Requested By', value: `<@${song.requester}>`, inline: true },
                { name: 'Title', value: song.title, inline: true }
            ]);
        
        queueContract.textChannel.send({ embeds: [embed] });        
          } else {
            // No equivalent song found on YouTube, skip the song
            queueContract.songs.shift();
            this.startPlaying(guildId, queueContract);
          }
        })
        .catch(error => {
          console.error('Error searching YouTube:', error);
          // Skip the song if an error occurs during the YouTube search
          queueContract.songs.shift();
          this.startPlaying(guildId, queueContract);
        });
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
      return {
          name: track.name,
          artist: track.artists[0].name,
      };      
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

  isYoutubePlaylistUrl(url: string): boolean {
    const youtubePlaylistRegex = /^.*(youtu.be\/|list=)([^#\&\?]*).*/;
    return youtubePlaylistRegex.test(url);
  }
  
  extractYoutubePlaylistId(url: string): string | null {
    const match = url.match(/list=([^#\&\?]+)/);
    return match ? match[1] : null;
  }

  async fetchYoutubePlaylistSongs(playlistId: string): Promise<Song[]> {
    const songs: Song[] = [];
    let pageToken = '';

  
    try {
      do {
        const response = await youtube.playlistItems.list({
          part: ['snippet'],
          playlistId: playlistId,
          maxResults: 50,
          pageToken: pageToken
        });
  
        for (const item of response.data.items) {
          const song: Song = {
            title: item.snippet.title,
            url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`,
            requester: 'YouTube Playlist',
          };
          songs.push(song);
        }
  
        pageToken = response.data.nextPageToken || '';
      } while (pageToken);
    } catch (error) {
      console.error('Error fetching YouTube playlist:', error);
    }
  
    return songs;
  }  

  isSpotifyPlaylistUrl(url: string): boolean {
    const spotifyPlaylistRegex = /https?:\/\/(?:open\.|)spotify\.com\/(?:user\/\w+\/)?playlist\/(\w+)/;
    return spotifyPlaylistRegex.test(url);
}
  
extractSpotifyPlaylistId(url: string): string | null {
  const match = url.match(/playlist\/(\w+)/);
  return match ? match[1] : null;
}

  async fetchSpotifyPlaylistSongs(playlistId: string): Promise<Song[]> {
    const songs: Song[] = [];
    let offset = 0;
  
    try {
      const data = await spotifyApi.clientCredentialsGrant();
      spotifyApi.setAccessToken(data.body['access_token']);
  
      while (true) {
        const response = await spotifyApi.getPlaylistTracks(playlistId, {
          limit: 100,
          offset: offset
        });
  
        for (const item of response.body.items) {
          const track = item.track;
          songs.push({
            title: `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`,
            url: track.external_urls.spotify, // Placeholder, find YouTube equivalent for playback
            requester: 'Spotify Playlist',
          });
        }
  
        if (response.body.items.length === 0) break;
        offset += response.body.items.length;
      }
    } catch (error) {
      console.error('Error fetching Spotify playlist:', error);
    }
  
    return songs;
  }
  
  
}

export default PlayCommand;
import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { queue } from './play'; // Import the queue from your PlayCommand
import ytdl from 'ytdl-core';
import SpotifyWebApi from 'spotify-web-api-node';
import { google } from 'googleapis';

const youtube = google.youtube({
    version: 'v3',
    auth: 'AIzaSyA5voxM5zJoUggTyE4gr4fPNtmjMshuMh0'
  });
  
  const spotifyApi = new SpotifyWebApi({
    clientId: '8fee832fe5eb42e0b418b598f7659565',
    clientSecret: 'd05ef47e548e4163b2a7bb70446b3a71'
  });

class AddCommand extends Command {
  constructor() {
    super({
      trigger: 'add',
      description: 'Adds a song to the queue.',
      type: 'ChatInput',
      module: 'music',
      args: [
        {
          trigger: 'song',
          description: 'The Spotify URL, YouTube URL, or name of the song to add.',
          type: 'String',
          required: true
        }
      ],
      permissions: []
    });
  }

  async run(ctx: CommandContext) {
    const songArg = ctx.args['song'];
    let songInfo;

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

    const serverQueue = queue.get(ctx.guild.id);

    if (serverQueue) {
      serverQueue.songs.push(songInfo);
      ctx.reply(`${songInfo.title} has been added to the queue.`);
    } else {
      // If there is no music currently playing, you can choose to start playing
      // Or just inform the user that there's no active queue
      ctx.reply('There is no music currently playing. Use the play command to start playing music.');
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
}

export default AddCommand;
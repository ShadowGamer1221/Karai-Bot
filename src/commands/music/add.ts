import { Command } from '../../structures/Command';
import { CommandContext } from '../../structures/addons/CommandAddons';
import { queue } from './play'; // Make sure to import the queue and necessary helper methods from PlayCommand
import { Song } from './play'; // Adjust this import according to your project structure
import { google } from 'googleapis';
import SpotifyWebApi from 'spotify-web-api-node';

// Initialize YouTube and Spotify APIs
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
      description: 'Adds a song or a playlist to the queue.',
      type: 'ChatInput',
      module: 'music',
      args: [
        {
          trigger: 'song',
          description: 'The Spotify URL, YouTube URL, or name of the song or playlist to add.',
          type: 'String',
          required: true
        }
      ],
      permissions: []
    });
  }

  async run(ctx: CommandContext) {
    const playlistArg = ctx.args['song'];
    let songsToAdd: Song[] = [];

    if (this.isYoutubePlaylistUrl(playlistArg)) {
      const playlistId = this.extractYoutubePlaylistId(playlistArg);
      songsToAdd = await this.fetchYoutubePlaylistSongs(playlistId);
    } else if (this.isSpotifyPlaylistUrl(playlistArg)) {
      const playlistId = this.extractSpotifyPlaylistId(playlistArg);
      songsToAdd = await this.fetchSpotifyPlaylistSongs(playlistId);
    } else {
      // Handle individual song (existing single song logic)
      // ...
    }

    const serverQueue = queue.get(ctx.guild.id);
    if (!serverQueue) {
      // Handle the case where there is no active queue
      // You might want to inform the user or start a new queue
    } else {
      songsToAdd.forEach(song => serverQueue.songs.push(song));
      ctx.reply(`${songsToAdd.length} song(s) have been added to the queue.`);
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
            image: item.snippet.thumbnails.default.url
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
    const spotifyPlaylistRegex = /https?:\/\/(?:www\.)?spotify\.com\/(?:user\/\w+\/)?playlist\/(\w+)/;
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
            image: track.album.images[0].url
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

export default AddCommand;
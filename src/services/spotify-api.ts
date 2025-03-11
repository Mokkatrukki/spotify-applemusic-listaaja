import axios from 'axios';

/**
 * Get the current user's profile
 * @param accessToken Spotify access token
 */
const getUserProfile = async (accessToken: string): Promise<any> => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Get the current user's playlists
 * @param accessToken Spotify access token
 * @param limit Number of playlists to return (default: 50)
 * @param offset Offset for pagination (default: 0)
 */
const getUserPlaylists = async (accessToken: string, limit = 50, offset = 0): Promise<any> => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/me/playlists`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit,
        offset
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    throw error;
  }
};

/**
 * Get a playlist's tracks
 * @param accessToken Spotify access token
 * @param playlistId Playlist ID
 * @param limit Number of tracks to return (default: 100)
 * @param offset Offset for pagination (default: 0)
 */
const getPlaylistTracks = async (accessToken: string, playlistId: string, limit = 100, offset = 0): Promise<any> => {
  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit,
        offset
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    throw error;
  }
};

export {
  getUserProfile,
  getUserPlaylists,
  getPlaylistTracks
}; 
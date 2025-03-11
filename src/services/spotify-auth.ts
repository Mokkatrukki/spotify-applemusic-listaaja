import querystring from 'querystring';
import axios from 'axios';

// Spotify API credentials
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.REDIRECT_URI || 'http://localhost:3000/callback';

// Add this debugging
console.log('Environment variables:');
console.log('CLIENT_ID:', CLIENT_ID ? 'Set (length: ' + CLIENT_ID.length + ')' : 'Not set');
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'Set (length: ' + CLIENT_SECRET.length + ')' : 'Not set');
console.log('REDIRECT_URI:', REDIRECT_URI);

// Scopes define the access permissions we're requesting
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'playlist-read-private',
  'playlist-read-collaborative'
];

/**
 * Generates a random string for the state parameter
 * @param length Length of the random string
 */
const generateRandomString = (length: number): string => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
};

/**
 * Creates the authorization URL for Spotify login
 */
const getAuthorizationUrl = (): { url: string, state: string } => {
  const state = generateRandomString(16);
  
  const authUrl = 'https://accounts.spotify.com/authorize?' + 
    querystring.stringify({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPES.join(' '),
      redirect_uri: REDIRECT_URI,
      state: state,
      show_dialog: true
    });
  
  return { url: authUrl, state };
};

/**
 * Exchanges the authorization code for access and refresh tokens
 * @param code The authorization code returned from Spotify
 */
const exchangeCodeForTokens = async (code: string): Promise<any> => {
  try {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      params: {
        code: code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const response = await axios(authOptions);
    return response.data;
  } catch (error) {
    console.error('Error exchanging code for tokens:', error);
    throw error;
  }
};

/**
 * Refreshes the access token using the refresh token
 * @param refreshToken The refresh token
 */
const refreshAccessToken = async (refreshToken: string): Promise<any> => {
  try {
    const authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      method: 'post',
      params: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      },
      headers: {
        'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };

    const response = await axios(authOptions);
    return response.data;
  } catch (error) {
    console.error('Error refreshing access token:', error);
    throw error;
  }
};

export {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken
}; 
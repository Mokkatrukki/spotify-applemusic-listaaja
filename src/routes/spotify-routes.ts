import express, { Request, Response } from 'express';
import { getUserProfile, getUserPlaylists, getPlaylistTracks } from '../services/spotify-api';
import { refreshAccessToken, getAuthorizationUrl } from '../services/spotify-auth';
import stateStore from '../services/state-store';

const router = express.Router();

// Middleware to check if the user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.session || !req.session.tokens) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Get the current user's profile
router.get('/me', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const profile = await getUserProfile(req.session.tokens.access_token);
    res.json(profile);
  } catch (error: any) {
    // If the token is expired, try to refresh it
    if (error.response && error.response.status === 401) {
      try {
        const newTokens = await refreshAccessToken(req.session.tokens.refresh_token);
        req.session.tokens.access_token = newTokens.access_token;
        
        // Try again with the new token
        const profile = await getUserProfile(req.session.tokens.access_token);
        res.json(profile);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
    } else {
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }
});

// Get the current user's playlists
router.get('/playlists', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const playlists = await getUserPlaylists(req.session.tokens.access_token, limit, offset);
    res.json(playlists);
  } catch (error: any) {
    // If the token is expired, try to refresh it
    if (error.response && error.response.status === 401) {
      try {
        const newTokens = await refreshAccessToken(req.session.tokens.refresh_token);
        req.session.tokens.access_token = newTokens.access_token;
        
        // Try again with the new token
        const playlists = await getUserPlaylists(
          req.session.tokens.access_token, 
          parseInt(req.query.limit as string) || 50, 
          parseInt(req.query.offset as string) || 0
        );
        res.json(playlists);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
    } else {
      res.status(500).json({ error: 'Failed to fetch playlists' });
    }
  }
});

// Get a playlist's tracks
router.get('/playlists/:id/tracks', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const playlistId = req.params.id;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const tracks = await getPlaylistTracks(req.session.tokens.access_token, playlistId, limit, offset);
    res.json(tracks);
  } catch (error: any) {
    // If the token is expired, try to refresh it
    if (error.response && error.response.status === 401) {
      try {
        const newTokens = await refreshAccessToken(req.session.tokens.refresh_token);
        req.session.tokens.access_token = newTokens.access_token;
        
        // Try again with the new token
        const tracks = await getPlaylistTracks(
          req.session.tokens.access_token, 
          req.params.id,
          parseInt(req.query.limit as string) || 100, 
          parseInt(req.query.offset as string) || 0
        );
        res.json(tracks);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        res.status(401).json({ error: 'Session expired. Please log in again.' });
      }
    } else {
      res.status(500).json({ error: 'Failed to fetch playlist tracks' });
    }
  }
});

// Add this route to your spotify-routes.ts file
router.get('/login-url', (req: Request, res: Response) => {
  const { url, state } = getAuthorizationUrl();
  
  // Store the state in the stateStore
  stateStore[state] = true;
  
  console.log('Generated login URL with state:', state);
  console.log('Current stateStore after login-url:', Object.keys(stateStore));
  
  res.json({ url });
});

export default router; 
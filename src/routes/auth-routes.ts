import express, { Request, Response } from 'express';
import { getAuthorizationUrl, exchangeCodeForTokens } from '../services/spotify-auth';
import stateStore from '../services/state-store';

const router = express.Router();

// Login route - redirects to Spotify authorization page
router.get('/login', (req: Request, res: Response) => {
  console.log('Login route accessed');
  const { url, state } = getAuthorizationUrl();
  
  console.log('Authorization URL:', url);
  console.log('State:', state);
  
  // Store the state for validation when the user is redirected back
  stateStore[state] = true;
  console.log('Current stateStore after login:', Object.keys(stateStore));
  
  res.redirect(url);
});

// Callback route - handles the redirect from Spotify
router.get('/callback', async (req: Request, res: Response) => {
  console.log('Callback route accessed');
  console.log('Query parameters:', req.query);
  
  const code = req.query.code as string || '';
  const state = req.query.state as string || '';
  const error = req.query.error as string;

  // Check if there was an error or if the state is invalid
  if (error) {
    console.error('Error from Spotify:', error);
    return res.redirect('/?error=' + error);
  }
  
  if (!stateStore[state]) {
    console.error('State mismatch. Expected one of:', Object.keys(stateStore));
    return res.redirect('/?error=state_mismatch');
  }

  // Clean up the state store
  delete stateStore[state];

  try {
    // Exchange the code for tokens
    const tokenData = await exchangeCodeForTokens(code);
    
    // In a real application, you would store these tokens securely
    // For this example, we'll just store them in the session
    req.session.tokens = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in
    };
    
    // Redirect to the dashboard or home page
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error in callback:', error);
    res.redirect('/?error=token_exchange_failed');
  }
});

// Logout route
router.get('/logout', (req: Request, res: Response) => {
  // Clear the session
  req.session = null;
  res.redirect('/');
});

// Add this near your other routes
router.get('/test-spotify-auth', (req: Request, res: Response) => {
  res.send(`
    <h1>Spotify Auth Test</h1>
    <p>CLIENT_ID: ${process.env.SPOTIFY_CLIENT_ID ? '✅ Set (length: ' + process.env.SPOTIFY_CLIENT_ID.length + ')' : '❌ Not set'}</p>
    <p>CLIENT_SECRET: ${process.env.SPOTIFY_CLIENT_SECRET ? '✅ Set (length: ' + process.env.SPOTIFY_CLIENT_SECRET.length + ')' : '❌ Not set'}</p>
    <p>REDIRECT_URI: ${process.env.REDIRECT_URI || '❌ Not set'}</p>
    <p>SESSION_SECRET: ${process.env.SESSION_SECRET ? '✅ Set' : '❌ Not set'}</p>
    <hr>
    <a href="/login">Try Login</a>
  `);
});

export default router; 
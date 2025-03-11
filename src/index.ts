import dotenv from 'dotenv';

// Load environment variables - this should be the first thing in your app
dotenv.config();

import express, { Request, Response } from 'express';
import path from 'path';
import cookieSession from 'cookie-session';
import authRoutes from './routes/auth-routes';
import spotifyRoutes from './routes/spotify-routes';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Session middleware
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'spotify-apple-music-secret'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// Extend the Request type to include session
declare module 'express-serve-static-core' {
  interface Request {
    session: any;
  }
}

// Routes
app.use('/', authRoutes);
app.use('/api/spotify', spotifyRoutes);

// Home route
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Dashboard route (protected)
app.get('/dashboard', (req: Request, res: Response) => {
  if (!req.session || !req.session.tokens) {
    return res.redirect('/');
  }
  
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

// API health check
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const PgSession = require('connect-pg-simple')(session);
const path = require('path');
const { pool, initDb } = require('./db');

const app = express();

// Trust Railway's proxy
app.set('trust proxy', 1);

app.use(express.json());

// Sessions stored in Postgres
app.use(session({
  store: new PgSession({ pool, tableName: 'sessions' }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: 'lax',
  },
}));

// Passport Google OAuth
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.APP_URL}/auth/google/callback`,
}, (accessToken, refreshToken, profile, done) => {
  const allowedEmails = (process.env.ALLOWED_EMAILS || '').split(',').map(e => e.trim());
  const email = profile.emails?.[0]?.value;
  if (!allowedEmails.includes(email)) {
    return done(null, false, { message: 'Unauthorized email' });
  }
  return done(null, {
    id: profile.id,
    name: profile.displayName,
    email,
    photo: profile.photos?.[0]?.value,
  });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/auth', require('./routes/auth'));
app.use('/api/records', require('./routes/records'));
app.use('/api/settings', require('./routes/settings'));

app.get('/health', (req, res) => res.json({ ok: true }));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;

initDb().then(() => {
  app.listen(PORT, () => console.log(`🚀 HostCheck running on port ${PORT}`));
}).catch(err => {
  console.error('Failed to initialize DB:', err);
  process.exit(1);
});

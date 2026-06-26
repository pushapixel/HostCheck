const express = require('express');
const passport = require('passport');
const router = express.Router();

// Kick off Google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google callback
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth` }),
  (req, res) => {
    res.redirect(process.env.FRONTEND_URL);
  }
);

// Current user
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ user: null });
  res.json({ user: req.user });
});

// Logout
router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.json({ success: true });
  });
});

module.exports = router;

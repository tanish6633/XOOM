const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('./db');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "YOUR_GOOGLE_CLIENT_SECRET",
    callbackURL: "/api/auth/google/callback",
    // We use relative URL, but in prod it might need full URL if proxy issues arise,
    // usually /api/auth/google/callback is fine if on same domain.
},
    async function (accessToken, refreshToken, profile, done) {
        try {
            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
            const googleId = profile.id;
            const displayName = profile.displayName || email.split('@')[0];

            if (!email) {
                return done(new Error("No email found in Google Profile"), null);
            }

            // Check if user exists
            const [users] = await db.execute('SELECT * FROM users WHERE google_id = ? OR email = ?', [googleId, email]);

            if (users.length > 0) {
                const user = users[0];
                // If user exists but no google_id (legacy email user), link it
                if (!user.google_id) {
                    await db.execute('UPDATE users SET google_id = ? WHERE id = ?', [googleId, user.id]);
                    user.google_id = googleId;
                }
                return done(null, user);
            } else {
                // Create new user
                // Password is null for OAuth users
                const [result] = await db.execute(
                    'INSERT INTO users (username, email, google_id, password) VALUES (?, ?, ?, NULL)',
                    [displayName, email, googleId]
                );
                const newUser = { id: result.insertId, username: displayName, email: email, google_id: googleId };
                return done(null, newUser);
            }
        } catch (err) {
            console.error("Google Auth Error:", err);
            return done(err, null);
        }
    }
));

module.exports = passport;

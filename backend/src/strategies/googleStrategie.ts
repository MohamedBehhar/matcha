import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import orm from "../lib/orm" ; // Your ORM utility

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: "http://localhost:3000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Find or create the user in the database
        const existingUser = await orm.findOne("users", {
          where: { google_id: profile.id },
        });

        if (existingUser) {
          return done(null, existingUser);
        }

        const newUser = await orm.create("users", {
          google_id: profile.id,
          email: profile.emails?.[0]?.value,
          first_name: profile.name?.givenName,
          last_name: profile.name?.familyName,
          is_verified: true, // Google accounts are verified by default
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await orm.findOne("users", { where: { id } });
  done(null, user);
});

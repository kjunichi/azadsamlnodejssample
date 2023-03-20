const express = require('express');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const bodyParser = require("body-parser");
const dotenv = require('dotenv').config();

const router = express.Router();

passport.use(new SamlStrategy(
  {
    path: '/login/callback',
    entryPoint: process.env.ENTRYPOINT,
    issuer: process.env.ISSUER,
    disableRequestedAuthnContext: "true",
    signatureAlgorithm: "sha256",
    cert: process.env.CERT //fs.readFileSync('rsacert.pem', 'utf8')

  },
  (profile, done) => {
    console.dir(profile.nameID)
    if (!profile.nameID) {
      console.log("Oops!")
      return done("Oops!")
    } else {
      profile.id = profile.nameID
      profile.username = profile['http://schemas.microsoft.com/identity/claims/displayname']
      console.dir(profile)
      return done(null, profile)
    }
  })
);

passport.serializeUser((user, cb) => {
  console.dir(user)
  process.nextTick(() => {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser((user, cb) => {
  console.dir(user)
  process.nextTick(() => {
    return cb(null, user);
  });
});

router.get("/login",
  passport.authenticate("saml", {
    failureRedirect: "/", failureFlash: true
  }), (req, res) => { res.redirect("/") })

router.post(
  "/login/callback",
  bodyParser.urlencoded({ extended: false }),
  passport.authenticate("saml", { failureRedirect: "/", failureFlash: true }),
  (req, res) => {
    console.log("zcc")
    res.redirect("/");
  }
);
router.post('/login/password', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login'
}));

router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
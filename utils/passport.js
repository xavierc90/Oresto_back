var passport = require('passport')
var localStrategy = require('passport-local').Strategy
var UserService = require('./../services/UserService')
var ConfigFile = require('../config')

const passportJWT = require("passport-jwt")
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

passport.use('login', new localStrategy({ passReqToCallback: true }, function (req, email, password, done) {
    //création du systeme de login avec comparaison des mot de passe
    UserService.loginUser(email, password, null, done)
})
)

passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: ConfigFile.secret_key,
    passReqToCallback: true
}, function (req, jwt_payload, done) {
    //Dechiffrer le token et lire les informations dedans. (_id) => Pour rechercher l'utilisateur
    UserService.findOneUserById(jwt_payload._id, null, function (err, value) {
        if (err)
            done(err)
        else if (value && value.token == "") {
            done(null, false, { message: 'Token expired' }, type_error = "no-valid")
        }
        else
          done(null, value)
    })
}))

module.exports = passport
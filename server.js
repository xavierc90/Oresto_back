const express = require('express')              
const _ = require("lodash")
const bodyParser = require('body-parser')
const Config = require ('./config')
const Logger = require('./utils/logger').pino

// Création de notre application express.js
const app = express()

// Démarrage de la database
require('./utils/database')

// Ajout de module de login
const passport = require('./utils/passport')
var session = require('express-session')

app.use(session({
    secret: Config.secret_cookie,
    resave: false, 
    saveUninitialized: true,
    cookie: { secure: true }
}))

// Passport init
app.use(passport.initialize())
app.use(passport.session())

const UserController = require('./controllers/UserController')

const DatabaseMiddleware = require('./middlewares/database')
const LoggerMiddleware = require('./middlewares/logger')

app.use(bodyParser.json(), LoggerMiddleware.addLogger)

/*--------------------- Création des routes (User - Utilisateur) ---------------------*/

// Création du endpoint /login pour connecter un utilisateur
app.post('/login', DatabaseMiddleware.checkConnection, UserController.loginUser)

// Création du endpoint /user pour l'ajout d'un utilisateur
app.post('/register', DatabaseMiddleware.checkConnection, UserController.addOneUser)

// Création du endpoint /user pour la récupération d'un utilisateur via l'id
app.get('/user/:id', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), UserController.findOneUserById)

// Création du endpoint /user pour la modification d'un utilisateur
app.put('/user/:id', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), UserController.updateOneUser)

// Création du endpoint /user pour la suppression d'un utilisateur
app.delete('/user/:id', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), UserController.deleteOneUser)

// Création du endpoint /user pour la suppression de plusieurs utilisateurs
app.delete('/users', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), UserController.deleteManyUsers)

app.listen(Config.port, () => {
  Logger.info(`Serveur démarré sur le port ${Config.port}`)
})

module.exports = app
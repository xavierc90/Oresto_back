const express = require('express');
const cors = require('cors');  // Assurez-vous que le module cors est installé
const _ = require("lodash");
const bodyParser = require('body-parser');
const Config = require('./config');
const Logger = require('./utils/logger').pino;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Création de notre application express.js
const app = express();

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//   next();
// });

// Ajout des headers pour les requêtes (CORS)
app.use(cors({
  origin: 'http://localhost:3000', // autoriser votre frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires'],
}));


// Démarrage de la database
require('./utils/database');

// Ajout de module de login
const passport = require('./utils/passport');
var session = require('express-session');

// Configuration Swagger
const swaggerOptions = require('./swagger.json');
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(session({
  secret: Config.secret_cookie,
  resave: false, 
  saveUninitialized: true,
  cookie: { secure: true }
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

const UserController = require('./controllers/UserController');
const CompanyController = require('./controllers/CompanyController');
const TableController = require('./controllers/TableController');

const DatabaseMiddleware = require('./middlewares/database');
const LoggerMiddleware = require('./middlewares/logger');

app.use(bodyParser.json(), LoggerMiddleware.addLogger);

/*--------------------- Création des routes (User - Utilisateur) ---------------------*/

// Création du endpoint /register_manager pour l'ajout d'un manager
app.post('/register_manager', DatabaseMiddleware.checkConnection, UserController.addOneManager);

// Création du endpoint /login_manager pour connecter un manager
app.post('/login_manager', DatabaseMiddleware.checkConnection, UserController.loginManager);

// Création du endpoint /register pour l'ajout d'un utilisateur
app.post('/register', DatabaseMiddleware.checkConnection, UserController.addOneUser);

// Création du endpoint /login pour connecter un utilisateur
app.post('/login', DatabaseMiddleware.checkConnection, UserController.loginUser);

// Création du endpoint /add_users pour l'ajout de plusieurs utilisateurs
app.post('/add_users', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', {session : false }), UserController.addManyUsers);

// Création du endpoint /find_user/:id pour la récupération d'un utilisateur par son id
app.get('/find_user/:id', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', {session : false }), UserController.findOneUserById);

// Création du endpoint /find_user pour la récupération d'un utilisateur
app.get('/find_user', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', {session : false }), UserController.findOneUser);

// Création du endpoint /users_by_filters pour la récupération de plusieurs utilisateurs
app.get('/users_by_filters', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', {session : false }), UserController.findManyUsers);

// Création du endpoint /find_users pour la récupération de plusieurs utilisateurs par id
app.get('/find_users', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', {session : false }), UserController.findManyUsersById);

// Création du endpoint /edit_user pour la modification d'un utilisateur
app.put('/edit_user/:id', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), UserController.updateOneUser);

// Création du endpoint /delete_user pour la suppression d'un utilisateur
app.delete('/delete_user/:id', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), UserController.deleteOneUser);

// Création du endpoint /delete_users pour la suppression de plusieurs utilisateurs
app.delete('/delete_users', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), UserController.deleteManyUsers);

/*--------------------- Création des routes (Company - Restaurants) ---------------------*/

// Création du endpoint /add_company pour l'ajout d'un restaurant
app.post('/add_company/', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), CompanyController.addOneCompany);

// Création du endpoint /add_companies pour l'ajout de plusieurs restaurants
app.post('/add_companies', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), CompanyController.addManyCompanies);

// Création du endpoint /find_company/:id pour la recherche de restaurants avex filtres
app.get('/find_company/:id', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), CompanyController.findOneCompanyById);

// Création du endpoint /companies_by_filters pour la recherche de restaurants avex filtres
app.get('/companies_by_filters', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), CompanyController.findManyCompanies);

/*--------------------- Création des routes (Table - Tables restaurant) ---------------------*/

app.post('/add_table/', DatabaseMiddleware.checkConnection, passport.authenticate('jwt', { session: false }), TableController.addOneTable);

app.listen(Config.port, () => {
  Logger.info(`Serveur démarré sur le port ${Config.port}`);
});

module.exports = app;

const UserService = require("../services/UserService");
const LoggerHttp = require("../utils/logger").http;
const passport = require("passport");

// La fonction permet d'ajouter un manager
module.exports.addOneManager = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Création d'un utilisateur");
  const ManagerRole = {...req.body, role: "manager"};
  UserService.addOneUser(ManagerRole, null, function (err, value) {
    if (err && err.type_error == "no found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "validator") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "duplicate") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(value);
    }
  });
};

// la fonction pour gérer l'authentification manager depuis UserService
module.exports.loginManager = function(req, res, next) {
  const { email, password } = req.body;

  UserService.loginUser(email, password, null, (err, user) => {
    if (err) {
      res.statusCode = 401;
      return res.send({ msg: "Authentication required.", type_error: "unauthorized" });
    }
    if (user.role !== "manager") {
      res.statusCode = 403;
      return res.send({ msg: "Accès refusé. Vous devez être un manager pour vous connecter.", type_error: "forbidden" });
    }
    res.statusCode = 200;
    return res.send(user);
  });
};


/**
 * @swagger
 * /register:
 *   post:
 *     summary: Create a new user (Register)
 *     description: Create a new user with the provided details.
 *     tags: 
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *          $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/MongoError'
 */

// La fonction permet d'ajouter un utilisateur
module.exports.addOneUser = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Création d'un utilisateur");
  UserService.addOneUser(req.body, null, function (err, value) {
    if (err && err.type_error == "no found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "validator") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "duplicate") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(value);
    }
  });
};

/**
 * @swagger
 * /add_users:
 *   post:
 *     summary: Create many users
 *     description: Create many users with the provided details.
 *     tags: 
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Users are created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       405:
 *          $ref: '#/components/responses/ValidationError'
 */
// La fonction permet d'ajouter plusieurs utilisateurs
module.exports.addManyUsers = function (req, res) {
  req.log.info("Création de plusieurs utilisateurs");
  UserService.addManyUsers(req.body, null, function (err, value) {
    if (err) {
      res.statusCode = 405;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

/**
* @swagger
* /login:
*    post:
*      summary: Login user
*      description: Login user with the provided details.
*      tags:
*        - User
*      requestBody:
*        required: true
*        content:
*          application/json:
*            schema:
*              $ref: '#/components/schemas/Login'
*      responses:
*        200:
*          description: Login successfully.
*          content:
*            application/json:
*              schema:
*                $ref: '#/components/schemas/User'
*        404:
*          $ref: '#/components/responses/NotFound'
*        405:
*          $ref: '#/components/responses/ValidationError'
*        500:
*          $ref: '#/components/responses/InternalError'
*/

// la fonction pour gérer l'authentification depuis UserService
module.exports.loginUser = function(req, res, next) {
  const {email, password } = req.body;
  UserService.loginUser(email, password, null, (err, user) => {
    if (err) {
      res.statusCode = 401;
      return res.send({ msg: err.msg, type_error: err.type_error });
    }
    res.statusCode = 200;
    return res.send(user);
  });
};


// Déconnecter un utilisateur
module.exports.logoutUser = function(req, res) {
  req.log.info("Déconnexion d'un utilisateur");
  UserService.updateOneUser(req.user_id, {token: ""}, null, function(err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404
      res.send(err)
    }
    else if (err && err.type_error == "validator") {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "duplicate") {
      res.statusCode = 405
      res.send(err)
    }
    else {
      res.statusCode = 201
      res.send ({message : "L'utilisateur est déconnecté"})
    }
  })
}

/**
 * @swagger
 * /find_user/{id}:
 *   get:
 *     summary: Find one user by Id
 *     description: Find one user with the Id_ provided.
 *     tags: 
 *       - User
 *     security:
 *       - bearerAuth: []
 *     parameters: 
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User finded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       405:
 *          $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/MongoError'
 */
// La fonction permet de chercher un utilisateur
module.exports.findOneUserById = function (req, res) {
  req.log.info("Recherche d'un utilisateur par son id");
  UserService.findOneUserById(req.params.id, null, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de chercher un utilisateur par les champs autorisés
module.exports.findOneUser = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Recherche d'un utilisateur par un champ autorisé");
  let fields = req.query.fields;
  if (fields && !Array.isArray(fields)) fields = [fields];
  UserService.findOneUser(fields, req.query.value, null, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de chercher plusieurs utilisateurs avec pagination
module.exports.findManyUsers = function(req, res) {
  req.log.info("Chercher plusieurs utilisateurs");
  let page = req.query.page;
  let pageSize = req.query.pageSize;
  let search = req.query.q;

  UserService.findManyUsers(search, page, pageSize, function(err, value) {
      if (err && err.type_error === "no-valid") {
          res.statusCode = 405;
          res.send(err);
      } else if (err && err.type_error === "error-mongo") {
          res.statusCode = 500;
          res.send(err);
      } else {
          res.statusCode = 200;
          res.send(value);
      }
  });
};

// La fonction permet de chercher plusieurs clients avec pagination
module.exports.findManyClients = function(req, res) {
  req.log.info("Chercher plusieurs clients");
  let page = req.query.page;
  let pageSize = req.query.pageSize;
  let search = req.query.q;

  UserService.findManyClients(search, page, pageSize, function(err, value) {
      if (err && err.type_error === "no-valid") {
          res.statusCode = 405;
          res.send(err);
      } else if (err && err.type_error === "error-mongo") {
          res.statusCode = 500;
          res.send(err);
      } else {
          res.statusCode = 200;
          res.send(value);
      }
  });
};

// La fonction permet de trouver plusieurs utilisateurs.
module.exports.findManyUsersById = function(req, res) {
  req.log.info("Chercher plusieurs utilisateurs")
  let userId = req.query.id;
  if (userId && !Array.isArray(userId))
    userId = [userId]

  UserService.findManyUsersById(userId,null, function(err, value) {
    if (err && err.type_error === "no-found") {
      res.statusCode = 404
      res.send(err)
    } 
    else if (err && err.type_error == "no-valid") {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500
      res.send(err)
    }
    else {
      res.statusCode = 200
      res.send(value)
    }
  });
};

// La fonction permet de modifier un utilisateur

module.exports.updateOneUser = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Modification d'un utilisateur");
  UserService.updateOneUser(
    req.params.id,
    req.body,
    null,
    function (err, value) {
  //    console.log(err, value);
      if (err && err.type_error == "no-found") {
        res.statusCode = 404;
        res.send(err);
      } else if (
        err &&
        (err.type_error == "no-valid" ||
          err.type_error == "validator" ||
          err.type_error == "duplicate")
      ) {
        res.statusCode = 405;
        res.send(err);
      } else if (err && err.type_error == "error-mongo") {
        res.statusCode = 500;
      } else {
        res.statusCode = 200;
        res.send(value);
      }
    }
  );
};

// La fonction permet de supprimer un utilisateur
module.exports.deleteOneUser = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Suppression d'un utilisateur");
  UserService.deleteOneUser(req.params.id, null, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de supprimer plusieurs utilisateurs
module.exports.deleteManyUsers = function (req, res) {
  LoggerHttp(req, res);
  req.log.info("Suppression de plusieurs utilisateur");
  var arg = req.query.id;
  if (arg && !Array.isArray(arg)) arg = [arg];
  UserService.deleteManyUsers(arg, null, function (err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && err.type_error == "no-valid") {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
    } else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

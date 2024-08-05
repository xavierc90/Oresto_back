const CompanyService = require('../services/CompanyService')

// La fonction permet d'ajouter un restaurant.
module.exports.addOneCompany = function(req, res) {
  req.log.info("Création d'un restaurant");

  if (req.user.role !== 'manager') {
    return res.status(403).send({ 
      msg: "Vous n'êtes pas autorisé à créer une entreprise.",
      type_error: "not-authorized"
    });
  }

  var options = { user: req.user };
  CompanyService.addOneCompany(req.body, options, function(err, value) {
    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    }
    else if (err && err.type_error == "validator") {
      res.statusCode = 405;
      res.send(err);
    }
    else if (err && err.type_error == "duplicate") {
      res.statusCode = 405;
      res.send(err);
    } else {
      res.statusCode = 201;
      res.send(value);
    }
  });
};

// La fonction permet d'ajouter plusieurs restaurants.
module.exports.addManyCompanies = function(req, res) {
  req.log.info("Création de plusieurs restaurants")

    // Vérifier le rôle de l'utilisateur
    if (req.user.role !== 'manager') {
      return res.status(403).send({ 
        msg: "Vous n'êtes pas autorisé à créer une entreprise.",
        type_error: "not-authorized"
      });
    }
  
  var options = { user: req.user };  
  CompanyService.addManyCompanies(req.body,options, function(err, value) {
    if (err) {
      res.statusCode = 405
      res.send(err)
    }
    else {
      res.statusCode = 201
      res.send(value)
    }
  })
}

// La fonction permet de rechercher un restaurant.
module.exports.findOneCompany = function(req, res) {
  req.log.info("Chercher un restaurant")
  let companyFields = req.query.fields
  if (companyFields && !Array.isArray(companyFields))
    companyFields = [companyFields]
  var opts = { populate: req.query.populate }
  CompanyService.findOneCompany(companyFields, req.query.value, opts, function(err, value) {
    if (err && err.type_error == "no-found") {
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
  })
}

// La fonction permet de rechercher plusieurs restaurants.
module.exports.findManyCompanies = function(req, res) {
  req.log.info("Chercher plusieurs restaurants")
  let page = req.query.page
  let pageSize = req.query.pageSize
  let search = req.query.q
  var opts = { populate: req.query.populate }
  CompanyService.findManyCompanies(search, page, pageSize, opts, function(err, value) {
    if (err && err.type_error == "no-valid") {
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
  })
}

// La fonction permet de chercher un restaurant par son id.
module.exports.findOneCompanyById = function(req, res) {
  req.log.info("Recherche d'un article par son id")
  var opts = { populate: req.query.populate }
  CompanyService.findOneCompanyById(req.params.id, opts, function(err, value) {
    if (err && err.type_error == "no-found") {
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
  })
}

// La fonction permet de trouver plusieurs restaurants par leur id.
module.exports.findManyCompaniesById = function(req, res) {
  req.log.info("Chercher plusieurs restaurants")
  let companyId = req.query.id;
  if (companyId && !Array.isArray(companyId))
    companyId = [companyId]
  var opts = {populate: req.query.populate}
  CompanyService.findManyCompaniesById(companyId, opts, function(err, value) {
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

// La fonction permet de supprimer un restaurant.
module.exports.deleteOneCompany = function(req, res) {
  req.log.info("Suppression d'un restaurant")
  CompanyService.deleteOneCompany(req.params.id,null, function(err, value) {
    if (err && err.type_error == "no-found") {
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
  })
}

// La fonction permet de supprimer plusieurs restaurants.
module.exports.deleteManyCompanies = function(req, res) {
  req.log.info("Suppresssion de plusieurs restaurants")
  let companyId = req.query.id;
  if (companyId && !Array.isArray(companyId))
    companyId = [companyId]

  CompanyService.deleteManyCompanies(companyId,null, function(err, value) {
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

// La fonction permet de modifier un restaurant.
module.exports.updateOneCompany = function(req, res) {
  req.log.info("Modification d'un restaurant")

  CompanyService.updateOneCompany(req.params.id, req.body,null, function(err, value) {

    if (err && err.type_error == "no-found") {
      res.statusCode = 404;
      res.send(err);
    } else if (err && (err.type_error == "no-valid" || err.type_error == "validator" || err.type_error == "duplicate")) {
      res.statusCode = 405;
      res.send(err);
    } else if (err && err.type_error == "error-mongo") {
      res.statusCode = 500;
      res.send(err);
    }else {
      res.statusCode = 200;
      res.send(value);
    }
  });
};

// La fonction permet de modifier plusieurs restaurants.
module.exports.updateManyCompanies = function(req, res) {
  req.log.info("Modification de plusieurs restaurants")
  let companyId = req.query.id;
  if (companyId && !Array.isArray(companyId))
    companyId = [companyId]

  const updateData = req.body;

  CompanyService.updateManyCompanies(companyId, updateData,null, function(err, value) {
    if (err && err.type_error === "no-found") {
      res.statusCode = 404
      res.send(err)
    } 
    else if (err && (err.type_error == "no-valid" || err.type_error == "validator" || err.type_error == "duplicate")) {
      res.statusCode = 405
      res.send(err)
    }
    else if (err && err.type_error == "duplicate") {
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
}
  
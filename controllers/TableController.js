const TableService = require('../services/TableService');

// La fonction permet d'ajouter une nouvelle table.
module.exports.addOneTable = function(req, res) {
  req.log.info("Création d'une table");

  if (req.user.role !== 'manager') {
    return res.status(403).send({ 
      msg: "Vous n'êtes pas autorisé à créer une table.",
      type_error: "not-authorized"
    });
  }
  const options = { user: req.user };
  TableService.addOneTable(req.body, options, function(err, value) {
    if (err) {
      let statusCode = 500;
      if (err.type_error === "validator") {
        statusCode = 400;
      } else if (err.type_error === "not-authorized") {
        statusCode = 403;
      }
      return res.status(statusCode).send(err);
    }
    res.status(200).send(value);
  });
};

// La fonction permet de récupérer toutes les tables avec pagination.
module.exports.findManyTables = function(req, res) {
    req.log.info("Chercher plusieurs tables")
    let page = req.query.page
    let pageSize = req.query.pageSize
    let search = req.query.q
    var opts = { populate: req.query.populate }
    TableService.findManyTables(search, page, pageSize, opts, function(err, value) {
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

// La fonction permet de rechercher une table par son ID.
module.exports.findOneTableById = function(req, res) {
    req.log.info("Recherche d'une table par son id")
    var opts = { populate: req.query.populate }
    TableService.findOneTableById(req.params.id, opts, function(err, value) {
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
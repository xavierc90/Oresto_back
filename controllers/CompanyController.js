const CompanyService = require('../services/CompanyService')

// La fonction permet d'ajouter un restaurant.
module.exports.addOneCompany = function(req, res) {
  req.log.info("Création d'un restaurant")
  var options = {user: req.user}
  CompanyService.addOneCompany(req.body,null, function(err, value) {
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
    }else {
      res.statusCode = 201
      res.send(value)
    }
  })
}

// La fonction permet d'ajouter plusieurs restaurants.
module.exports.addManyCompanies = function(req, res) {
  req.log.info("Création de plusieurs restaurants")
  CompanyService.addManyCompanies(req.body,null, function(err, value) {
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

// La fonction permet de rechercher plusieurs restaurants.
module.exports.findManyCompanies = function(req, res) {
  req.log.info("Chercher plusieurs articles")
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
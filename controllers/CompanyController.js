const CompanyService = require('../services/CompanyService')

// La fonction permet d'ajouter un article.
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

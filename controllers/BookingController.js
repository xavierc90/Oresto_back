const Bookingervice = require('../services/BookingService')

// La fonction permet d'ajouter une réservation.
module.exports.addOneBooking = function(req, res) {
  req.log.info("Création d'une réservation")
  var options = {user: req.user}
  BookingService.addOneBooking(req.body,null, function(err, value) {
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

// La fonction permet d'ajouter plusieurs réservations.
module.exports.addManyBookings = function(req, res) {
  req.log.info("Création de plusieurs réservations")
  BookingService.addManyBookings(req.body,null, function(err, value) {
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

module.exports.findOneBooking = function(req, res) {
  req.log.info("Chercher une réservation")
  let bookingFields = req.query.fields
  if (bookingFields && !Array.isArray(bookingFields))
    bookingFields = [bookingFields]
  var opts = { populate: req.query.populate }
  BookingService.findOneBooking(bookingFields, req.query.value, opts, function(err, value) {
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

module.exports.findManyBookings = function(req, res) {
  req.log.info("Chercher plusieurs réservations")
  let page = req.query.page
  let pageSize = req.query.pageSize
  let search = req.query.q
  var opts = { populate: req.query.populate }
  BookingService.findManyBookings(search, page, pageSize, opts, function(err, value) {
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

module.exports.findOneBookingById = function(req, res) {
  req.log.info("Recherche d'une réservation par son id")
  var opts = { populate: req.query.populate }
  BookingService.findOneBookingById(req.params.id, opts, function(err, value) {
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

// La fonction permet de trouver plusieurs réservations.
module.exports.findManyBookingsById = function(req, res) {
  req.log.info("Chercher plusieurs réservations")
  let bookingId = req.query.id;
  if (bookingId && !Array.isArray(bookingId))
    bookingId = [bookingId]
  var opts = {populate: req.query.populate}
  BookingService.findManyBookingsById(bookingId, opts, function(err, value) {
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

// La fonction permet de supprimer une réservation.
module.exports.deleteOneBooking = function(req, res) {
  req.log.info("Suppression d'une réservation")
  BookingService.deleteOneBooking(req.params.id,null, function(err, value) {
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

// La fonction permet de supprimer plusieurs réservations.
module.exports.deleteManyBookings = function(req, res) {
  req.log.info("Suppresssion de plusieurs réservations")
  let bookingId = req.query.id;
  if (bookingId && !Array.isArray(bookingId))
    bookingId = [bookingId]

  BookingService.deleteManyBookings(bookingId,null, function(err, value) {
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

// La fonction permet de modifier une réservation.
module.exports.updateOneBooking = function(req, res) {
  req.log.info("Modification d'une réservation")

  BookingService.updateOneBooking(req.params.id, req.body,null, function(err, value) {

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

// La fonction permet de modifier plusieurs réservations.
module.exports.updateManyBookings = function(req, res) {
  req.log.info("Modification de plusieurs réservations")
  let bookingId = req.query.id;
  if (bookingId && !Array.isArray(bookingId))
    bookingId = [bookingId]

  const updateData = req.body;

  BookingService.updateManyBookings(bookingId, updateData,null, function(err, value) {
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
  
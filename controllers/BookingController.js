const Bookingervice = require('../services/BookingService')
const TableService = require('../services/TableService')

// La fonction permet d'ajouter une réservation.
// Fonction du contrôleur pour ajouter une réservation
module.exports.addOneBooking = function (req, res) {
  const bookingData = req.body; // Récupération directe des données de la réservation depuis le corps de la requête

  // Appel de la fonction de service pour ajouter une réservation
  Bookingervice.addOneBooking(bookingData, (err, booking) => {
      if (err) {
          // Gestion des erreurs : renvoie un code de statut approprié en fonction de l'erreur
          if (err.type_error === "validator") {
              return res.status(400).send(err);
          }
          return res.status(500).send(err);
      }
      // Succès : renvoie la réservation créée avec un statut 201 (Created)
      res.status(201).send(booking);
  });
};

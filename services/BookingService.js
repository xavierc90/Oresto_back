
const BookingSchema = require('../schemas/Booking')
const Table = require('../schemas/Table')
const _ = require('lodash')
const async = require('async')
const mongoose = require('mongoose')

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

// Ajouter une réservation
module.exports.addOneBooking = async function (bookingData, callback) {
    try {
        const newBooking = new Booking(bookingData);

        const validationError = newBooking.validateSync();
        if (validationError) {
            console.log("Validation Error:", validationError);  // Ajoutez des logs ici pour voir les détails en console
            return callback({
                message: "Validation failed",
                errors: validationError.errors,
                type_error: "validation_error"
            });
        }

        await newBooking.save();
        callback(null, newBooking);
    } catch (error) {
        console.error("Error in addOneBooking:", error);  // Log any unexpected errors.
        callback({
            message: "Error creating booking",
            type_error: "unknown_error",
            error: error.message || String(error)  // Assurez-vous de convertir l'erreur en string si nécessaire
        });
    }
};
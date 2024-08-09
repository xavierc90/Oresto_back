
const BookingSchema = require('../schemas/Booking')
const Table = require('../schemas/Table')
const _ = require('lodash')
const async = require('async')
const mongoose = require('mongoose')
const moment = require('moment');

const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);

// Ajouter une réservation
module.exports.addOneBooking = async function (bookingData, callback) {
    try {
        // Convertir la date sélectionnée et la date actuelle au début de leur journée respective
        const selectedDate = moment(bookingData.date_selected).startOf('day');
        const today = moment().startOf('day');

        if (selectedDate.isBefore(today)) {
            return callback({
                message: "Impossible de réserver une table à une date antérieure.",
                type_error: "invalid_date"
            });
        }

        const newBooking = new Booking(bookingData);

        const validationError = newBooking.validateSync();
        if (validationError) {
            console.log("Validation Error:", validationError);
            return callback({
                message: "Validation failed",
                errors: validationError.errors,
                type_error: "validation_error"
            });
        }

        await newBooking.save();
        const populatedBooking = await Booking.findById(newBooking._id)
            .populate('user_id')
            .exec();

        callback(null, populatedBooking);  // Return the populated booking
    } catch (error) {
        console.error("Error in addOneBooking:", error);
        callback({
            message: "Error creating booking",
            type_error: "unknown_error",
            error: error.message || String(error)
        });
    }
};
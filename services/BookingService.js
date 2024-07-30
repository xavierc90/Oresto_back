const BookingSchema = require('../schemas/Booking')
const _ = require('lodash')
const async = require('async')
const mongoose = require('mongoose')

const Booking = mongoose.model('Booking', BookingSchema)

module.exports.addOneBooking = async function (bookingData, options, callback) {
    try {
        if (options && options.user) {
            bookingData.user_id = options.user._id;
        }
        const newBooking = new Booking(bookingData);
        const errors = newBooking.validateSync();
        if (errors) {
            // Rassembler les messages d'erreur
            const text = Object.keys(errors.errors).map((key) => {
                return errors.errors[key].message;
            }).join(' ');

            const fieldsWithError = _.transform(Object.keys(errors.errors), (result, key) => {
                result[key] = errors.errors[key].message;
            }, {});
            const err = {
                msg: text,
                fields_with_error: Object.keys(errors.errors),
                fields: fieldsWithError,
                type_error: 'validator'
            };
            return callback(err);
        }
        await newBooking.save();
        callback(null, newBooking.toObject());
    } catch (error) {
        callback(error);
    }
}

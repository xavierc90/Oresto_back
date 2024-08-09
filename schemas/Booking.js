const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

var BookingSchema = new mongoose.Schema({
    company_id: {
        type: ObjectId,
        ref: 'Company',
        required: true
    },
    table_id: {
        type: ObjectId,
        ref: 'Table',
        required: true
    },
    user_id: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    date_selected: {
        type: Date,
        default: Date.now,
        required: true
    },
    time_selected: {
        type: String,
        enum: ['12:00', '12:15', '12:30', '12:45', '13:00', '13:15', '13:30', '13:45', '14:00'],
        required: true,
    },
    nbr_persons: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['waiting', 'confirmed', 'canceled', 'archived'],
        default: 'waiting'
    },
    created_at: {
      type: Date,
      default: Date.now
    }
});

// Virtual for user details
BookingSchema.virtual('userInfo', {
    ref: 'User', // The model to use
    localField: 'user_id', // The field on the Booking model
    foreignField: '_id', // The field on the User model
    justOne: true // Returns just one user (not an array)
});

// To include virtuals in output
BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Booking', BookingSchema);
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

var BookingSchema = mongoose.Schema({
    user_id: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    table_id: {
        type: ObjectId,
        ref: 'Table',
        required
    },
    company_id: {
        type: ObjectId,
        ref: 'Company',
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    nbr_persons: {
        type: Number,
        required: true
    },
    table_number: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: false,
        enum: [
            "waiting",
            "confirmed",
            "canceled",
            "archived"
        ],
        default: "waiting"
    },
    created_at: {
      type: Date,
      default: Date.now
    }
})

// module.exports = mongoose.model('Booking', BookingSchema);
module.exports = BookingSchema
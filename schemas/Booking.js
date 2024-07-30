const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

var BookingSchema = mongoose.Schema({
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
    date_selected: {
        type: Date,
        default: Date.now,
        required: true
    },
    nbr_persons: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
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

module.exports = mongoose.model('Booking', BookingSchema);
const UserSchema = require('./User');
const mongoose = require('mongoose');
const moment = require('moment');
const ObjectId = mongoose.Schema.Types.ObjectId;

const BookingSchema = new mongoose.Schema({
    date_selected: {
        type: Date,
        default: Date.now,
        required: true,
        validate: {
            validator: function(value) {
                return moment(value).startOf('day').isSameOrAfter(moment().startOf('day'));
            },
            message: props => `The booking date cannot be in the past.`
        }
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
    },
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
    }
});

BookingSchema.index({ company_id: 1, table_id: 1, date_selected: 1, time_selected: 1 }, { unique: true });

  UserSchema.virtual('user',{
    ref:'User',
    localField : '_id',
    foreignField:'user_id',
  })

// To include virtuals in output
BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true });

module.exports = BookingSchema;

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var CompanySchema = mongoose.Schema({
  user_id: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  postal_code: {
    type: String,
    required: false    
  },
  city: {
    type: String,
    required: false
  },
  country: {
    type: String,
    required: false
  },
  phone_number: {
    type: Number,
    required: false
  },
  email: {
    type: String,
    required: false
  },
  status: {
    type: String,
    required: false,
    enum: [
      "opened",
      "closed"
    ],
    default: "opened"
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = CompanySchema
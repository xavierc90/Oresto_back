const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var CompanySchema = mongoose.Schema({
  openhour_id: {
    type: ObjectId,
    ref: 'OpenHour',
    required: true
  },
  name: {
    type: String,
    index: true,
    unique: true,
    required: true
  },
  address: {
    type: String,
    required: false
  },
  postal_code: {
    type: Number,
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
    required: true
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

module.exports = mongoose.model('Company', CompanySchema);

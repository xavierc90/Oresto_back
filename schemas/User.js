const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

var UserSchema = mongoose.Schema({
  company_id: {
    type: ObjectId,
    ref: 'Company',
    required: false
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    index: true,
    unique: true,
    required: true    
  },
  username: {
    type: String,
    index: true,
    unique: true,
    required: false
  },
  password: {
    type: String,
    required: true
  },
  phone_number: {
    type: Number,
    required: true
  },
  role: {
    type: String,
    required: false,
    enum: [
        "user",
        "manager",
        "admin"
    ],
    default: "user"
  },
  status: {
    type: String,
    required: false,
    enum: [
        "waiting",
        "active",
    ],
    default: "waiting"
  },
  token_valid: {
    type: String,
    required: false
  },
  token_reset: {
    type: String,
    required: false
  },
  token_generated_at: {
    type: Date,
    default: Date.now
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  allergens: {
    type: [String],
    required: false,
    enum: [
      "Arachides",
      "Noix",
      "Lait",
      "Œufs",
      "Poisson",
      "Crustacés",
      "Blé",
      "Soja",
      "Sésame",
      "Gluten",
      "Moutarde",
      "Céleri",
      "Sulfites",
      "Lupin",
      "Mollusques"
    ]
  }
})

module.exports = UserSchema
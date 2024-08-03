const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

var UserSchema = mongoose.Schema({
  company_id: {
    type: ObjectId,
    ref: 'Company',
    required: false
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    index: true,
    unique: true,
    required: true    
  },
  password: {
    type: String,
    required: true
  },
  phone_number: {
    type: String,
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
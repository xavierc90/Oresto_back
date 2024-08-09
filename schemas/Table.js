const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

const TableSchema = new mongoose.Schema({
  company_id: {
    type: ObjectId,
    ref: 'Company',
    required: false
  },
  created_by: {
    type: String,
    required: true
  },
  table_number: {
    type: Number,
    required: true
  },
  table_size: {
    type: Number,
    required: true,
    default: 2,
    min: 2
  },
  shape: {
    type: String,
    required: true,
    enum: ["rectangle", "square", "round"],
    default: "round"
  },
  status: {
    type: String,
    enum: ["available", "reserved", "unavailable"],
    default: "available"
  },
  index: {
    type: Number
  },
  position_x: {
    type: Number
  },
  position_y: {
    type: Number
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

// Middleware to update `updated_at` before saving
TableSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Table', TableSchema);
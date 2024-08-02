const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId


const TableSchema = mongoose.Schema({
  company_id: {
    type: ObjectId,
    ref: 'Company',
    required: true
},
  table_number: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  table_size: {
    type: Number,
    required: true,
    default: 2,
    min: 1
  },
  status: {
    type: String,
    required: true,
    enum: [
      "available",
      "reserved",
      "unavailable"
    ],
    default: "available"
  },
  index: {
    type: Number,
    required: false
  },
  position_x: {
    type: Number,
    required: false
  },
  position_y: {
    type: Number,
    required: false
  },
  shape: {
    type: String,
    required: true,
    enum: [
      "rectangle",
      "square",
      "round"
    ],
    default: "round"
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

TableSchema.index({ table_number: 1 });
TableSchema.index({ position_x: 1, position_y: 1 });

module.exports = mongoose.model('Table', TableSchema);
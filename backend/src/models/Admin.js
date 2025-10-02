const mongoose = require('mongoose');
const { Schema } = mongoose;

const adminSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  permissions: {
    canManageUsers: { type: Boolean, default: true },
    canUpdateModels: { type: Boolean, default: false },
  },
}, { timestamps: true });

module.exports = mongoose.model('Admin', adminSchema);
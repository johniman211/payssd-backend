const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    adminId: String,
    action: String,
    targetId: String,
    message: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model('AuditLog', auditLogSchema);

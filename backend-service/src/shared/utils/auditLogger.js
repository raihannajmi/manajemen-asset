const prisma = require('../../config/db');

/**
 * Write an audit entry to the audit_logs table.
 * Call this after every significant system action.
 *
 * @param {object} opts
 * @param {string|null}  opts.actorUserId   - ID of the user performing the action
 * @param {string}       opts.module        - e.g. 'RENTAL', 'BILLING', 'ASSET', 'AUTH'
 * @param {string}       opts.action        - e.g. 'CREATE', 'SUBMIT', 'VERIFY', 'APPROVE'
 * @param {string|null}  opts.entityType    - e.g. 'RentalRequest', 'Invoice', 'Payment'
 * @param {string|null}  opts.entityId      - Primary key of the affected record
 * @param {object|null}  opts.beforeJson    - Snapshot BEFORE the change
 * @param {object|null}  opts.afterJson     - Snapshot AFTER the change
 * @param {string|null}  opts.ipAddress     - req.ip
 * @param {string|null}  opts.userAgent     - req.headers['user-agent']
 */
const logAction = async ({
  actorUserId = null,
  module,
  action,
  entityType = null,
  entityId = null,
  beforeJson = null,
  afterJson = null,
  ipAddress = null,
  userAgent = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        actorUserId,
        module,
        action,
        entityType,
        entityId,
        beforeJson,
        afterJson,
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // Audit logging should NEVER break the main flow
    console.error('[AuditLogger] Failed to write audit log:', err.message);
  }
};

module.exports = { logAction };

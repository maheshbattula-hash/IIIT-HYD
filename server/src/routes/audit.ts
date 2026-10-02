import { Router, Response } from 'express';
import { queryAll } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/audit-logs - Compliance & governance ledger
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user?.role || 'COLLECTIONS_MANAGER';
    const userId = req.user?.id;

    let sql = 'SELECT * FROM audit_logs';
    const params: any[] = [];

    // Collections agent only views self activity
    if (role === 'COLLECTIONS_AGENT' && userId) {
      sql += ' WHERE user_id = ?';
      params.push(userId);
    }

    sql += ' ORDER BY timestamp DESC LIMIT 50';

    const logs = queryAll<any>(sql, params);
    res.json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

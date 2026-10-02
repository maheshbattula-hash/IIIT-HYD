import { Router, Response } from 'express';
import { queryAll } from '../db/database.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/collections - List cases with bucket and risk filters
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bucket, risk, status } = req.query;
    let sql = `
      SELECT cs.*, c.name, c.primary_phone, c.customer_segment, c.hardship_flag
      FROM collections_cases cs
      JOIN customers c ON cs.customer_id = c.customer_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (bucket) {
      sql += ' AND cs.collection_bucket LIKE ?';
      params.push(`%${bucket}%`);
    }
    if (risk) {
      sql += ' AND cs.risk_tier = ?';
      params.push(risk);
    }
    if (status) {
      sql += ' AND cs.case_status = ?';
      params.push(status);
    }

    sql += ' ORDER BY cs.days_past_due DESC';

    const cases = queryAll<any>(sql, params);
    res.json({ success: true, count: cases.length, cases });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

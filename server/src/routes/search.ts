import { Router, Response } from 'express';
import { queryAll } from '../db/database.js';
import { AuthenticatedRequest, maskCustomerPII } from '../middleware/auth.js';

const router = Router();

// GET /api/search?q=... - Global omnichannel search
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim();
    const role = req.user?.role || 'COLLECTIONS_MANAGER';

    if (!q) {
      return res.json({ success: true, results: [] });
    }

    const pattern = `%${q}%`;
    const results: any[] = [];

    // 1. Search Customers by Name, ID, Phone, PAN
    const customers = queryAll<any>(`
      SELECT c.*, cs.total_outstanding, cs.days_past_due, cs.collection_bucket
      FROM customers c
      LEFT JOIN collections_cases cs ON c.customer_id = cs.customer_id
      WHERE c.name LIKE ? OR c.customer_id LIKE ? OR c.primary_phone LIKE ? OR c.pan_number LIKE ?
      LIMIT 5
    `, [pattern, pattern, pattern, pattern]);

    for (const cust of customers) {
      const masked = maskCustomerPII(cust, role);
      results.push({
        type: 'CUSTOMER',
        id: masked.customer_id,
        title: masked.name,
        subtitle: `${masked.customer_id} • ${masked.customer_segment || 'Customer'} • DPD: ${masked.days_past_due || 0}`,
        badge: masked.collection_bucket || 'B0',
        route: `/customers/${masked.customer_id}`,
      });
    }

    // 2. Search Collections Cases
    const cases = queryAll<any>(`
      SELECT cs.*, c.name
      FROM collections_cases cs
      JOIN customers c ON cs.customer_id = c.customer_id
      WHERE cs.case_id LIKE ? OR cs.assigned_agent_id LIKE ?
      LIMIT 5
    `, [pattern, pattern]);

    for (const cs of cases) {
      results.push({
        type: 'CASE',
        id: cs.case_id,
        title: `Case ${cs.case_id} — ${cs.name}`,
        subtitle: `Outstanding: INR ${Number(cs.total_outstanding).toLocaleString('en-IN')} • DPD: ${cs.days_past_due}`,
        badge: cs.collection_bucket,
        route: `/customers/${cs.customer_id}`,
      });
    }

    // 3. Search Loan Accounts
    const loans = queryAll<any>(`
      SELECT l.*, c.name
      FROM loan_accounts l
      JOIN customers c ON l.customer_id = c.customer_id
      WHERE l.loan_account_id LIKE ? OR l.loan_type LIKE ?
      LIMIT 5
    `, [pattern, pattern]);

    for (const l of loans) {
      results.push({
        type: 'LOAN',
        id: l.loan_account_id,
        title: `${l.loan_type} (${l.loan_account_id})`,
        subtitle: `Borrower: ${l.name} • Principal: INR ${Number(l.outstanding_principal).toLocaleString('en-IN')}`,
        badge: l.status,
        route: `/customers/${l.customer_id}`,
      });
    }

    // 4. Search Cards
    const cards = queryAll<any>(`
      SELECT cd.*, c.name
      FROM card_accounts cd
      JOIN customers c ON cd.customer_id = c.customer_id
      WHERE cd.card_account_id LIKE ? OR cd.card_number_masked LIKE ?
      LIMIT 5
    `, [pattern, pattern]);

    for (const cd of cards) {
      results.push({
        type: 'CARD',
        id: cd.card_account_id,
        title: `${cd.card_type} (${cd.card_number_masked})`,
        subtitle: `Cardholder: ${cd.name} • Balance: INR ${Number(cd.current_balance).toLocaleString('en-IN')}`,
        badge: cd.status,
        route: `/customers/${cd.customer_id}`,
      });
    }

    // 5. Search Agent Notes
    const notes = queryAll<any>(`
      SELECT n.*, c.name
      FROM agent_notes n
      JOIN customers c ON n.customer_id = c.customer_id
      WHERE n.note_text LIKE ? OR n.extracted_tags LIKE ?
      LIMIT 5
    `, [pattern, pattern]);

    for (const n of notes) {
      results.push({
        type: 'NOTE',
        id: n.note_id,
        title: `Note by ${n.agent_id} on ${n.name}`,
        subtitle: n.note_text.slice(0, 75) + '...',
        badge: n.sentiment || 'NOTE',
        route: `/customers/${n.customer_id}`,
      });
    }

    res.json({ success: true, count: results.length, results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

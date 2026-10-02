import { Router, Response } from 'express';
import { queryAll, queryOne } from '../db/database.js';
import { AuthenticatedRequest, maskCustomerPII } from '../middleware/auth.js';

const router = Router();

// GET /api/customers - List customers with delinquency overview
router.get('/', (req: AuthenticatedRequest, res: Response) => {
  try {
    const role = req.user?.role || 'COLLECTIONS_MANAGER';
    const customers = queryAll<any>(`
      SELECT 
        c.customer_id, c.name, c.primary_phone, c.email, c.customer_segment,
        c.city, c.state, c.credit_bureau_score, c.hardship_flag, c.hardship_reason,
        c.data_quality_score, c.match_confidence, c.source_system, c.last_refreshed_at,
        cs.case_id, cs.case_status, cs.total_outstanding, cs.days_past_due,
        cs.collection_bucket, cs.risk_tier, cs.ptp_status, cs.ptp_date,
        cs.broken_ptp_count, cs.ptp_reliability_score, cs.assigned_strategy
      FROM customers c
      LEFT JOIN collections_cases cs ON c.customer_id = cs.customer_id
      ORDER BY cs.days_past_due DESC, cs.total_outstanding DESC
    `);

    const maskedCustomers = customers.map((c) => maskCustomerPII(c, role));
    res.json({
      success: true,
      count: maskedCustomers.length,
      customers: maskedCustomers,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/customers/:id - Complete Collections 360 view
router.get('/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const custId = req.params.id;
    const role = req.user?.role || 'COLLECTIONS_MANAGER';

    const customer = queryOne<any>(`SELECT * FROM customers WHERE customer_id = ?`, [custId]);
    if (!customer) {
      return res.status(404).json({ success: false, error: `Customer ${custId} not found` });
    }

    const cards = queryAll<any>(`SELECT * FROM card_accounts WHERE customer_id = ?`, [custId]);
    const loans = queryAll<any>(`SELECT * FROM loan_accounts WHERE customer_id = ?`, [custId]);
    const deposits = queryAll<any>(`SELECT * FROM deposit_accounts WHERE customer_id = ?`, [custId]);
    const collectionsCase = queryOne<any>(`SELECT * FROM collections_cases WHERE customer_id = ?`, [custId]);
    const contactHistory = queryAll<any>(`SELECT * FROM contact_history WHERE customer_id = ? ORDER BY timestamp DESC`, [custId]);
    const agentNotes = queryAll<any>(`SELECT * FROM agent_notes WHERE customer_id = ? ORDER BY timestamp DESC`, [custId]);
    const callTranscripts = queryAll<any>(`SELECT * FROM call_transcripts WHERE customer_id = ? ORDER BY call_date DESC`, [custId]);
    const nbaRecommendations = queryAll<any>(`SELECT * FROM nba_recommendations WHERE customer_id = ? ORDER BY created_at DESC`, [custId]);

    // Raw sources from Bronze staging for complete Data Product Lineage proof
    const rawStagingRecords = queryAll<any>(`SELECT * FROM raw_staging_customers WHERE resolved_customer_id = ?`, [custId]);

    const maskedCustomer = maskCustomerPII(customer, role);

    res.json({
      success: true,
      profile: maskedCustomer,
      financialRelationships: {
        cards,
        loans,
        deposits,
        totalCreditLimit: cards.reduce((sum, c) => sum + (c.credit_limit || 0), 0),
        totalCardDebt: cards.reduce((sum, c) => sum + (c.current_balance || 0), 0),
        totalLoanDebt: loans.reduce((sum, l) => sum + (l.outstanding_principal || 0), 0),
        totalLiquidDeposits: deposits.reduce((sum, d) => sum + (d.current_balance || 0), 0),
      },
      collectionsTelemetry: collectionsCase || null,
      interactionIntelligence: {
        contactHistory,
        agentNotes,
        callTranscripts,
      },
      nbaRecommendations,
      lineageAndQuality: {
        sourceSystem: customer.source_system,
        dataQualityScore: customer.data_quality_score,
        matchConfidence: customer.match_confidence,
        lastRefreshedAt: customer.last_refreshed_at,
        rawStagingSources: rawStagingRecords,
        dataContractVersion: '2.4.0',
        governanceStatus: 'VERIFIED_GOLDEN_RECORD',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { processNLQuery } from '../ai/nlToSqlEngine.js';
import { searchUnstructuredCollections } from '../ai/ragEngine.js';
import { generateNextBestAction, saveNBAReviewDecision } from '../ai/nbaEngine.js';
import { getAIProvider } from '../ai/aiProvider.js';
import { queryOne } from '../db/database.js';

const router = Router();

// POST /api/ai/query - Controlled NL-to-SQL + RAG query
router.post('/query', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { question, attachments, customerId } = req.body;
    if (!question || typeof question !== 'string') {
      return res.status(400).json({ success: false, error: 'Question string is required' });
    }

    const user = req.user || { id: 'USER-01', role: 'COLLECTIONS_MANAGER' };

    // 1. Process Controlled NL-to-SQL
    const nlResult = await processNLQuery(question, user);

    // 2. Perform Unstructured RAG Retrieval over notes and transcripts
    const ragSources = searchUnstructuredCollections(question, customerId);

    // 3. Incorporate uploaded context chips if provided by user
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      attachments.forEach((att: any, idx: number) => {
        ragSources.unshift({
          sourceType: 'UPLOADED_DOC',
          id: `ATT-${idx + 1}`,
          authorOrAgent: 'User Upload',
          dateOrTimestamp: new Date().toISOString(),
          snippet: att.content || att.name,
          relevanceScore: 1.0,
        });
      });
    }

    res.json({
      success: true,
      ...nlResult,
      sources: ragSources,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/agent-task - Autonomous AI Agent execution pipeline
router.post('/agent-task', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { taskType, customerId, parameters } = req.body;
    const provider = getAIProvider();

    const result = await provider.executeAgentTask(taskType || 'ANALYZE_CUSTOMER', {
      customerId: customerId || 'CUST-10245',
      ...parameters,
    });

    res.json({ success: true, execution: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/recommendation - Next Best Action generation
router.post('/recommendation', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.body;
    if (!customerId) {
      return res.status(400).json({ success: false, error: 'customerId is required' });
    }

    const recommendation = generateNextBestAction(customerId);
    res.json({ success: true, recommendation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/nba-review - Human Review approval/modification/rejection
router.post('/nba-review', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recommendationId, decision, modifiedAction, notes } = req.body;
    if (!recommendationId || !decision) {
      return res.status(400).json({ success: false, error: 'recommendationId and decision are required' });
    }

    const user = req.user || { id: 'USER-AGENT-01', role: 'COLLECTIONS_MANAGER' };
    const result = saveNBAReviewDecision(
      recommendationId,
      decision,
      user.id,
      user.role,
      modifiedAction,
      notes
    );

    res.json({ success: true, result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/briefing - Agent Assist briefing generator
router.post('/briefing', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.body;
    const custId = customerId || 'CUST-10245';

    const customer = queryOne<any>(`
      SELECT c.*, cs.total_outstanding, cs.days_past_due, cs.collection_bucket, cs.ptp_status, cs.ptp_date, cs.ptp_amount
      FROM customers c
      LEFT JOIN collections_cases cs ON c.customer_id = cs.customer_id
      WHERE c.customer_id = ?
    `, [custId]);

    const provider = getAIProvider();
    const briefing = await provider.generateAgentBriefing(customer);

    res.json({ success: true, briefing });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/ai/post-call-summary - Analyze post-call transcript
router.post('/post-call-summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transcript } = req.body;
    if (!transcript) {
      return res.status(400).json({ success: false, error: 'Transcript text is required' });
    }

    const provider = getAIProvider();
    const analysis = await provider.analyzeCallTranscript(transcript);

    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

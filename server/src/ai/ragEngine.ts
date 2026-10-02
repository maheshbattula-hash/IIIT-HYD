import { queryAll } from '../db/database.js';

export interface RetrievedSource {
  sourceType: 'AGENT_NOTE' | 'CALL_TRANSCRIPT' | 'DATA_CONTRACT' | 'UPLOADED_DOC';
  id: string;
  customerId?: string;
  authorOrAgent: string;
  dateOrTimestamp: string;
  snippet: string;
  relevanceScore: number;
}

export function searchUnstructuredCollections(query: string, customerId?: string): RetrievedSource[] {
  const q = query.toLowerCase();
  const searchTerms = q.split(/\s+/).filter((w) => w.length > 2);
  const sources: RetrievedSource[] = [];

  // 1. Search Agent Notes
  let notesSql = 'SELECT * FROM agent_notes';
  const notesParams: any[] = [];
  if (customerId) {
    notesSql += ' WHERE customer_id = ?';
    notesParams.push(customerId);
  }
  const notes = queryAll<any>(notesSql, notesParams);

  for (const n of notes) {
    const text = (n.note_text + ' ' + (n.extracted_tags || '')).toLowerCase();
    let score = 0;
    for (const term of searchTerms) {
      if (text.includes(term)) score += 1;
    }
    if (customerId && n.customer_id === customerId) score += 2;

    if (score > 0 || !query) {
      sources.push({
        sourceType: 'AGENT_NOTE',
        id: n.note_id,
        customerId: n.customer_id,
        authorOrAgent: n.agent_id,
        dateOrTimestamp: n.timestamp,
        snippet: n.note_text,
        relevanceScore: score + 0.5,
      });
    }
  }

  // 2. Search Call Transcripts
  let transcriptsSql = 'SELECT * FROM call_transcripts';
  const transcriptsParams: any[] = [];
  if (customerId) {
    transcriptsSql += ' WHERE customer_id = ?';
    transcriptsParams.push(customerId);
  }
  const transcripts = queryAll<any>(transcriptsSql, transcriptsParams);

  for (const t of transcripts) {
    const text = (t.raw_transcript + ' ' + (t.ai_summary || '') + ' ' + (t.objections_raised || '')).toLowerCase();
    let score = 0;
    for (const term of searchTerms) {
      if (text.includes(term)) score += 1;
    }
    if (customerId && t.customer_id === customerId) score += 2;

    if (score > 0 || !query) {
      sources.push({
        sourceType: 'CALL_TRANSCRIPT',
        id: t.transcript_id,
        customerId: t.customer_id,
        authorOrAgent: t.agent_id,
        dateOrTimestamp: t.call_date,
        snippet: t.ai_summary || t.raw_transcript.slice(0, 200),
        relevanceScore: score + 0.8,
      });
    }
  }

  // Sort by highest relevance score
  return sources.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5);
}

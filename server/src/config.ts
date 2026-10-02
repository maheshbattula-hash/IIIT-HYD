import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load root or server .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5080,
  nodeEnv: process.env.NODE_ENV || 'development',
  aiProvider: (process.env.AI_PROVIDER || 'mock').toLowerCase(),
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openAiApiKey: process.env.OPENAI_API_KEY || '',
  databaseFile: process.env.DATABASE_FILE || path.resolve(__dirname, '../data/collectiq.db'),
};

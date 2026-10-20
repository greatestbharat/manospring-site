import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Works for both `tsx server/src/...` and compiled `dist/server/...`
const projectRoot = path.resolve(__dirname, '../../..');
const secretsPath = path.join(projectRoot, 'secrets.json');

type LocalSecrets = {
  groqApiKey?: string;
  groqModel?: string;
};

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

/**
 * Local secrets.json is for development only.
 * On Render/production, use GROQ_API_KEY / GROQ_MODEL environment variables.
 */
function readLocalSecrets(): LocalSecrets {
  if (isProduction) {
    return {};
  }

  if (!existsSync(secretsPath)) {
    return {};
  }

  try {
    const raw = readFileSync(secretsPath, 'utf8');
    const parsed = JSON.parse(raw) as LocalSecrets;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

const local = readLocalSecrets();

export const config = {
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv,
  isProduction,
  // Production: env vars only. Local: secrets.json, then optional env override.
  groqApiKey: isProduction
    ? process.env.GROQ_API_KEY || ''
    : local.groqApiKey || process.env.GROQ_API_KEY || '',
  groqModel: isProduction
    ? process.env.GROQ_MODEL || 'openai/gpt-oss-20b'
    : local.groqModel || process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  databaseUrl: process.env.DATABASE_URL || ''
};

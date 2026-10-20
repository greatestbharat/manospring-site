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

function readLocalSecrets(): LocalSecrets {
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
  nodeEnv: process.env.NODE_ENV || 'development',
  // Prefer project-local secrets.json; host platforms can still set env vars
  groqApiKey: local.groqApiKey || process.env.GROQ_API_KEY || '',
  groqModel: local.groqModel || process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
  databaseUrl: process.env.DATABASE_URL || ''
};

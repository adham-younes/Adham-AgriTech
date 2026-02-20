import { readFileSync } from 'node:fs';

const sql = readFileSync(new URL('../supabase/policies.sql', import.meta.url), 'utf8');

const required = [
  'enable row level security',
  'service writes weather',
  'service writes irrigation',
  'service writes alerts',
  'service writes ndvi',
  'service manages external cache'
];

const missing = required.filter((token) => !sql.includes(token));

if (missing.length) {
  console.error('Missing required security policy markers:', missing.join(', '));
  process.exit(1);
}

console.log('Security policy validation passed.');

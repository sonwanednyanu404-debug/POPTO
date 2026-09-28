import fs from 'fs';
import path from 'path';
import { getDb } from './index';

async function migrate() {
  console.log('🍋 POPTO Database Migration');
  console.log('══════════════════════════════');

  const db = getDb();
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  // Execute schema
  db.exec(schema);

  console.log('✅ Schema applied successfully');
  console.log('══════════════════════════════');
  
  db.close();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});

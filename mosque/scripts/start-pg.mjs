import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

async function main() {
  console.log('Starting Embedded PostgreSQL on port 5432...');
  const dataDir = path.resolve(rootDir, '.pgdata');
  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    persistent: true,
  });

  try {
    await pg.initialise();
    console.log('PG data directory initialized.');
  } catch (e) {
    console.log('Init notice:', e.message);
  }

  await pg.start();
  console.log('PG started successfully on port 5432!');

  try {
    await pg.createDatabase('mosque');
    console.log('Database "mosque" created successfully.');
  } catch (e) {
    console.log('Create db notice:', e.message);
  }

  // Keep process alive
  setInterval(() => {}, 1000 * 60 * 60);
}

main().catch(err => {
  console.error('Fatal PG error:', err);
  process.exit(1);
});

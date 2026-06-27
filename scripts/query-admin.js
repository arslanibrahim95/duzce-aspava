import { createClient } from '@libsql/client';

const dbPath = 'file:data/app.db';
console.log('Opening database at:', dbPath);

const db = createClient({ url: dbPath });

async function run() {
  try {
    const res = await db.execute('SELECT id, email, password_hash FROM admin_users');
    console.log('Admin users:', res.rows);
  } catch (err) {
    console.error('Error:', err);
  }
}
run();

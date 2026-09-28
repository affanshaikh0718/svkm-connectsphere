const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');

async function startDb() {
  const dataDir = path.resolve(__dirname, '../postgres_data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: 5432,
    user: 'cs_user',
    password: 'cs_secret_password',
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    persistent: true,
    onLog: (msg) => {
      if (msg.includes('ready to accept connections')) {
        console.log('✅ PostgreSQL is ready on port 5432!');
      }
    },
    onError: (err) => console.error('PostgreSQL error:', err),
  });

  const isInit = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
  if (!isInit) {
    console.log('Initializing embedded PostgreSQL with UTF-8...');
    await pg.initialise();
  } else {
    const pidFile = path.join(dataDir, 'postmaster.pid');
    if (fs.existsSync(pidFile)) {
      try { fs.unlinkSync(pidFile); } catch (e) {}
    }
  }
  console.log('Starting PostgreSQL server...');
  await pg.start();

  try {
    await pg.createDatabase('connectsphere');
    console.log('✅ Database "connectsphere" created.');
  } catch (err) {
    if (err.message && err.message.includes('already exists')) {
      console.log('Database "connectsphere" already exists.');
    } else {
      console.log('Database check:', err.message);
    }
  }

  console.log('🚀 PostgreSQL is actively running. Press Ctrl+C to stop.');

  // Keep process alive
  process.on('SIGINT', async () => {
    console.log('Stopping PostgreSQL...');
    await pg.stop();
    process.exit(0);
  });
}

startDb().catch((err) => {
  console.error('Failed to run embedded PostgreSQL:', err);
  process.exit(1);
});

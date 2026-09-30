const EmbeddedPostgres = require('embedded-postgres').default;
const path = require('path');
const fs = require('fs');
const net = require('net');

function checkPortInUse(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

async function startDb() {
  const dataDir = path.resolve(__dirname, '../postgres_data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Check if PostgreSQL is already running on port 5432
  const inUse = await checkPortInUse(5432);
  if (inUse) {
    console.log('✅ PostgreSQL is already active and accepting connections on port 5432.');
    console.log('🚀 Ready! Press Ctrl+C to exit.');
    // Keep alive
    setInterval(() => {}, 10000);
    return;
  }

  // Remove any stale postmaster.pid
  const pidFile = path.join(dataDir, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try {
      fs.unlinkSync(pidFile);
      console.log('Cleaned stale postmaster.pid file.');
    } catch (e) {}
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
    onError: (err) => {
      if (err && err.code === 'ECONNRESET') {
        // Normal client disconnect, ignore
        return;
      }
      console.error('PostgreSQL notice:', err?.message || err);
    },
  });

  const isInit = fs.existsSync(path.join(dataDir, 'PG_VERSION'));
  if (!isInit) {
    console.log('Initializing embedded PostgreSQL with UTF-8...');
    await pg.initialise();
  }

  console.log('Starting PostgreSQL server...');
  await pg.start();

  try {
    await pg.createDatabase('connectsphere');
    console.log('✅ Database "connectsphere" created.');
  } catch (err) {
    if (err && err.message && err.message.includes('already exists')) {
      console.log('Database "connectsphere" already exists.');
    } else {
      console.log('Database check:', err?.message || 'ready');
    }
  }

  console.log('🚀 PostgreSQL is actively running. Press Ctrl+C to stop.');

  // Keep process alive and clean exit
  const handleExit = async () => {
    console.log('Stopping PostgreSQL...');
    try {
      await pg.stop();
    } catch (e) {}
    process.exit(0);
  };

  process.on('SIGINT', handleExit);
  process.on('SIGTERM', handleExit);
}

startDb().catch((err) => {
  console.error('Failed to run embedded PostgreSQL:', err);
  process.exit(1);
});

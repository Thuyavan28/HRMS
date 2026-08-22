import pg from 'pg';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

// Ensure fast, reliable DNS resolution for Neon cloud endpoints
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_sL4zd1ahPWgE@ep-twilight-mode-ax97fo3z-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const customLookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  dns.resolve4(hostname, (err, addresses) => {
    if (err || !addresses || addresses.length === 0) {
      return dns.lookup(hostname, options, callback);
    }
    callback(null, addresses[0], 4);
  });
};

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  lookup: customLookup,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000
});

pool.on('connect', () => {
  // Connected to Neon PostgreSQL pool
});

pool.on('error', (err) => {
  console.error('[Neon DB Error]: Unexpected error on idle client', err);
});

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      // console.log(`[Neon DB Query] Executed in ${duration}ms | rows: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    console.error(`[Neon DB Query Error]:`, error.message, `\nQuery: ${text}`);
    throw error;
  }
};

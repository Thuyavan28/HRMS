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

// Global fallback for Node's dns.lookup on *.neon.tech
const nativeLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (typeof hostname === 'string' && hostname.includes('neon.tech')) {
    return dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return nativeLookup(hostname, options, callback);
      }
      if (options && options.all) {
        return callback(null, addresses.map(addr => ({ address: addr, family: 4 })));
      }
      return callback(null, addresses[0], 4);
    });
  }
  return nativeLookup(hostname, options, callback);
};

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
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

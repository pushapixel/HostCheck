const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS technicians (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS maintenance_records (
      id SERIAL PRIMARY KEY,
      property_id INTEGER REFERENCES properties(id),
      date DATE NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      task TEXT NOT NULL,
      technician_id INTEGER REFERENCES technicians(id),
      status TEXT NOT NULL DEFAULT 'Complete' CHECK (status IN ('Scheduled', 'In Progress', 'Complete')),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      sid VARCHAR NOT NULL COLLATE "default",
      sess JSON NOT NULL,
      expire TIMESTAMP(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
    );

    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions ("expire");
  `);

  // Seed data — only insert if tables are empty
  const { rows: props } = await pool.query('SELECT COUNT(*) FROM properties');
  if (parseInt(props[0].count) === 0) {
    await pool.query(`
      INSERT INTO properties (name) VALUES ('I-4'), ('201B'), ('203B');
      INSERT INTO technicians (name) VALUES ('Bri'), ('William'), ('Judy');
      INSERT INTO categories (name) VALUES ('Deep Clean'), ('Repair'), ('Appliance');
    `);
    console.log('✅ Seed data inserted');
  }

  console.log('✅ Database initialized');
};

module.exports = { pool, initDb };

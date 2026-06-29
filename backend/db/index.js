const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS properties (
      id SERIAL PRIMARY KEY,
      owner_email TEXT NOT NULL,
      name TEXT NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(owner_email, name)
    );

    CREATE TABLE IF NOT EXISTS technicians (
      id SERIAL PRIMARY KEY,
      owner_email TEXT NOT NULL,
      name TEXT NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(owner_email, name)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      owner_email TEXT NOT NULL,
      name TEXT NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(owner_email, name)
    );

    CREATE TABLE IF NOT EXISTS maintenance_records (
      id SERIAL PRIMARY KEY,
      owner_email TEXT NOT NULL,
      property_id INTEGER REFERENCES properties(id),
      date DATE NOT NULL,
      category_id INTEGER REFERENCES categories(id),
      task TEXT,
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

    -- Migration: add owner_email to existing tables if not already present
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='properties' AND column_name='owner_email') THEN
        ALTER TABLE properties ADD COLUMN owner_email TEXT NOT NULL DEFAULT '';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='technicians' AND column_name='owner_email') THEN
        ALTER TABLE technicians ADD COLUMN owner_email TEXT NOT NULL DEFAULT '';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='owner_email') THEN
        ALTER TABLE categories ADD COLUMN owner_email TEXT NOT NULL DEFAULT '';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='maintenance_records' AND column_name='owner_email') THEN
        ALTER TABLE maintenance_records ADD COLUMN owner_email TEXT NOT NULL DEFAULT '';
      END IF;
      -- Remove NOT NULL constraint on task column
      ALTER TABLE maintenance_records ALTER COLUMN task DROP NOT NULL;
    END $$;
  `);

  // Migrate existing rows — assign to the ALLOWED_EMAILS owner if rows have no owner_email
  const ownerEmail = (process.env.ALLOWED_EMAILS || '').split(',')[0].trim();
  if (ownerEmail) {
    await pool.query(`UPDATE properties SET owner_email=$1 WHERE owner_email=''`, [ownerEmail]);
    await pool.query(`UPDATE technicians SET owner_email=$1 WHERE owner_email=''`, [ownerEmail]);
    await pool.query(`UPDATE categories SET owner_email=$1 WHERE owner_email=''`, [ownerEmail]);
    await pool.query(`UPDATE maintenance_records SET owner_email=$1 WHERE owner_email=''`, [ownerEmail]);
    console.log(`✅ Migrated existing rows to owner: ${ownerEmail}`);
  }

  // Seed data for owner — only if they have no properties yet
  if (ownerEmail) {
    const { rows: props } = await pool.query('SELECT COUNT(*) FROM properties WHERE owner_email=$1', [ownerEmail]);
    if (parseInt(props[0].count) === 0) {
      await pool.query(`
        INSERT INTO properties (owner_email, name) VALUES ($1,'I-4'),($1,'201B'),($1,'203B');
        INSERT INTO technicians (owner_email, name) VALUES ($1,'Bri'),($1,'William'),($1,'Judy');
        INSERT INTO categories (owner_email, name) VALUES ($1,'Deep Clean'),($1,'Repair'),($1,'Appliance');
      `, [ownerEmail]);
      console.log('✅ Seed data inserted');
    }
  }

  console.log('✅ Database initialized');
};

module.exports = { pool, initDb };
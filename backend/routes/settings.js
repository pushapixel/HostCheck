const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// Generic factory for the three lookup tables
const makeRoutes = (table) => {
  const r = express.Router();

  r.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY name ASC`);
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: `Failed to fetch ${table}` });
    }
  });

  r.post('/', async (req, res) => {
    try {
      const { name } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO ${table} (name) VALUES ($1) RETURNING *`,
        [name]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Name already exists' });
      res.status(500).json({ error: `Failed to create ${table.slice(0, -1)}` });
    }
  });

  r.put('/:id', async (req, res) => {
    try {
      const { name, active } = req.body;
      const { rows } = await pool.query(
        `UPDATE ${table} SET name=COALESCE($1,name), active=COALESCE($2,active) WHERE id=$3 RETURNING *`,
        [name, active, req.params.id]
      );
      res.json(rows[0]);
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Name already exists' });
      res.status(500).json({ error: `Failed to update` });
    }
  });

  r.delete('/:id', async (req, res) => {
    try {
      await pool.query(`UPDATE ${table} SET active=false WHERE id=$1`, [req.params.id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: `Failed to deactivate` });
    }
  });

  return r;
};

router.use('/properties', makeRoutes('properties'));
router.use('/technicians', makeRoutes('technicians'));
router.use('/categories', makeRoutes('categories'));

module.exports = router;

const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

const makeRoutes = (table) => {
  const r = express.Router();

  r.get('/', async (req, res) => {
    try {
      const email = req.user.email;
      const { rows } = await pool.query(
        `SELECT * FROM ${table} WHERE owner_email=$1 ORDER BY name ASC`,
        [email]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: `Failed to fetch ${table}` });
    }
  });

  r.post('/', async (req, res) => {
    try {
      const email = req.user.email;
      const { name } = req.body;
      const { rows } = await pool.query(
        `INSERT INTO ${table} (owner_email, name) VALUES ($1, $2) RETURNING *`,
        [email, name]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Name already exists' });
      res.status(500).json({ error: `Failed to create` });
    }
  });

  r.put('/:id', async (req, res) => {
    try {
      const email = req.user.email;
      const { name, active } = req.body;
      const { rows } = await pool.query(
        `UPDATE ${table} SET name=COALESCE($1,name), active=COALESCE($2,active)
         WHERE id=$3 AND owner_email=$4 RETURNING *`,
        [name, active, req.params.id, email]
      );
      res.json(rows[0]);
    } catch (err) {
      if (err.code === '23505') return res.status(409).json({ error: 'Name already exists' });
      res.status(500).json({ error: `Failed to update` });
    }
  });

  r.delete('/:id', async (req, res) => {
    try {
      const email = req.user.email;
      await pool.query(
        `UPDATE ${table} SET active=false WHERE id=$1 AND owner_email=$2`,
        [req.params.id, email]
      );
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

const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

// GET all records with joined names
router.get('/', async (req, res) => {
  try {
    const { property_id } = req.query;
    let query = `
      SELECT
        mr.id, mr.date, mr.task, mr.status, mr.notes, mr.created_at,
        p.id AS property_id, p.name AS property,
        c.id AS category_id, c.name AS category,
        t.id AS technician_id, t.name AS technician
      FROM maintenance_records mr
      JOIN properties p ON mr.property_id = p.id
      JOIN categories c ON mr.category_id = c.id
      JOIN technicians t ON mr.technician_id = t.id
    `;
    const params = [];
    if (property_id) {
      params.push(property_id);
      query += ` WHERE mr.property_id = $1`;
    }
    query += ` ORDER BY mr.date DESC, mr.created_at DESC`;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// POST new record
router.post('/', async (req, res) => {
  try {
    const { property_id, date, category_id, task, technician_id, status = 'Complete', notes } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO maintenance_records (property_id, date, category_id, task, technician_id, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [property_id, date, category_id, task, technician_id, status, notes || null]
    );
    res.status(201).json({ id: rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// PUT update record
router.put('/:id', async (req, res) => {
  try {
    const { property_id, date, category_id, task, technician_id, status, notes } = req.body;
    await pool.query(
      `UPDATE maintenance_records
       SET property_id=$1, date=$2, category_id=$3, task=$4, technician_id=$5, status=$6, notes=$7
       WHERE id=$8`,
      [property_id, date, category_id, task, technician_id, status, notes || null, req.params.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update record' });
  }
});

// DELETE record
router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM maintenance_records WHERE id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

module.exports = router;

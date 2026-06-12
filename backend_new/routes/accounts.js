const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, region, unit_name, created_at FROM accounts');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/regions', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT region, unit_name FROM accounts');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, region, unit_name FROM accounts WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const { username, password, region, unit_name } = req.body;
  try {
    const [result] = await pool.execute(
      'INSERT INTO accounts (username, password, region, unit_name) VALUES (?, ?, ?, ?)',
      [username, password, region, unit_name]
    );
    res.status(201).json({ id: result.insertId, username, region, unit_name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  const { username, password, region, unit_name } = req.body;
  try {
    const [result] = await pool.execute(
      'UPDATE accounts SET username = ?, password = ?, region = ?, unit_name = ? WHERE id = ?',
      [username, password, region, unit_name, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM accounts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
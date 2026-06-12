const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const loginService = require('../services/loginService');

router.post('/by-region', async (req, res) => {
  const { region } = req.body;
  
  try {
    const [accounts] = await pool.execute('SELECT * FROM accounts WHERE region = ?', [region]);
    
    if (accounts.length === 0) {
      return res.status(404).json({ error: '该区域未配置账号' });
    }
    
    const account = accounts[0];
    
    const loginResult = await loginService.login(account.username, account.password);
    
    if (!loginResult.success) {
      return res.status(500).json({ error: '登录失败' });
    }
    
    const data = await loginService.queryData(loginResult.cookies);
    
    await pool.execute(
      'INSERT INTO query_records (account_id, region, data, status) VALUES (?, ?, ?, ?)',
      [account.id, region, JSON.stringify(data), 'success']
    );
    
    res.json({ success: true, data, region, unit_name: account.unit_name });
  } catch (error) {
    await pool.execute(
      'INSERT INTO query_records (account_id, region, status, message) VALUES (?, ?, ?, ?)',
      [account?.id || null, region, 'failed', error.message]
    );
    res.status(500).json({ error: error.message });
  }
});

router.get('/records', async (req, res) => {
  const { region, limit = 10 } = req.query;
  
  try {
    let query = 'SELECT * FROM query_records ORDER BY query_time DESC LIMIT ?';
    let params = [limit];
    
    if (region) {
      query = 'SELECT * FROM query_records WHERE region = ? ORDER BY query_time DESC LIMIT ?';
      params = [region, limit];
    }
    
    const [rows] = await pool.execute(query, params);
    
    res.json(rows.map(row => ({
      ...row,
      data: row.data ? JSON.parse(row.data) : null
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
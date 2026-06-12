const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const loginService = require('../services/loginService');

router.post('/', async (req, res) => {
  const { region, formData } = req.body;
  
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
    
    const response = await loginService.submitForm(loginResult.cookies, formData);
    
    await pool.execute(
      'INSERT INTO submissions (account_id, region, form_data, response, status) VALUES (?, ?, ?, ?, ?)',
      [account.id, region, JSON.stringify(formData), response, 'success']
    );
    
    res.json({ success: true, response, region });
  } catch (error) {
    await pool.execute(
      'INSERT INTO submissions (account_id, region, form_data, status) VALUES (?, ?, ?, ?)',
      [account?.id || null, region, JSON.stringify(formData), 'failed']
    );
    res.status(500).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  const { region, limit = 10 } = req.query;
  
  try {
    let query = 'SELECT * FROM submissions ORDER BY submit_time DESC LIMIT ?';
    let params = [limit];
    
    if (region) {
      query = 'SELECT * FROM submissions WHERE region = ? ORDER BY submit_time DESC LIMIT ?';
      params = [region, limit];
    }
    
    const [rows] = await pool.execute(query, params);
    
    res.json(rows.map(row => ({
      ...row,
      form_data: row.form_data ? JSON.parse(row.form_data) : null
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
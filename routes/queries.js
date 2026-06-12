const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const loginService = require('../services/loginService');

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT q.*, a.username, a.region FROM query_records q JOIN accounts a ON q.account_id = a.id ORDER BY q.query_time DESC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const { captcha } = req.body;
  
  try {
    const [accounts] = await pool.execute('SELECT * FROM accounts WHERE id = ?', [accountId]);
    if (accounts.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    const account = accounts[0];
    
    await pool.execute(
      'INSERT INTO query_records (account_id, status) VALUES (?, ?)',
      [accountId, 'processing']
    );
    
    try {
      const loginResult = await loginService.login(account.username, account.password, captcha);
      
      if (!loginResult.success) {
        await pool.execute(
          'UPDATE query_records SET status = ?, message = ? WHERE account_id = ? ORDER BY query_time DESC LIMIT 1',
          ['failed', '登录失败', accountId]
        );
        return res.json({ success: false, message: '登录失败' });
      }
      
      const data = await loginService.queryData(loginResult.cookies);
      
      await pool.execute(
        'UPDATE query_records SET status = ?, data = ? WHERE account_id = ? ORDER BY query_time DESC LIMIT 1',
        ['success', JSON.stringify(data), accountId]
      );
      
      res.json({ success: true, data });
    } catch (error) {
      await pool.execute(
        'UPDATE query_records SET status = ?, message = ? WHERE account_id = ? ORDER BY query_time DESC LIMIT 1',
        ['failed', error.message, accountId]
      );
      res.json({ success: false, message: error.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM query_records WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
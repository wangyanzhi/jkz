const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const crypto = require('crypto');

const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

let sessions = {};

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const [rows] = await pool.execute('SELECT * FROM admin WHERE username = ?', [username]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const admin = rows[0];
    
    if (admin.password !== password) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const token = generateToken();
    sessions[token] = { username, expiresAt: Date.now() + 3600000 };
    
    res.json({ success: true, token, username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (token && sessions[token]) {
    delete sessions[token];
  }
  
  res.json({ success: true, message: '登出成功' });
});

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: '未授权访问' });
  }
  
  if (sessions[token].expiresAt < Date.now()) {
    delete sessions[token];
    return res.status(401).json({ error: '会话已过期，请重新登录' });
  }
  
  sessions[token].expiresAt = Date.now() + 3600000;
  req.user = sessions[token];
  next();
};

module.exports = { router, authenticate };
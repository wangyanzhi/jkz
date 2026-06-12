const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { initDatabase, pool } = require('./config/db');
const { router: adminRouter, authenticate } = require('./routes/admin');
const accountsRouter = require('./routes/accounts');
const queryRouter = require('./routes/query');
const submissionsRouter = require('./routes/submissions');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRouter);
app.use('/api/accounts', authenticate, accountsRouter);
app.use('/api/query', authenticate, queryRouter);
app.use('/api/submit', authenticate, submissionsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  console.error('Request:', req.method, req.originalUrl);
  console.error('Body:', req.body);
  res.status(500).json({ error: err.message, stack: err.stack });
});

const initAdmin = async () => {
  try {
    const [rows] = await pool.execute('SELECT * FROM admin WHERE username = ?', ['georgewang']);
    if (rows.length === 0) {
      await pool.execute('INSERT INTO admin (username, password) VALUES (?, ?)', ['georgewang', 'azsxdcp0o9i8']);
      console.log('Default admin user created');
    }
  } catch (error) {
    console.error('Failed to create admin user:', error);
  }
};

const startServer = async () => {
  await initDatabase();
  await initAdmin();
  
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
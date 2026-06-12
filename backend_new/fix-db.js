const mysql = require('mysql2/promise');
require('dotenv').config();

const fixDatabase = async () => {
  console.log('=== 修复数据库字符集 ===');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });
    
    console.log('✅ 连接成功');
    console.log('');
    
    console.log('1. 修改数据库字符集...');
    await connection.query(`ALTER DATABASE ${process.env.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ 数据库字符集已修改为 utf8mb4');
    console.log('');
    
    await connection.query(`USE ${process.env.DB_NAME}`);
    
    console.log('2. 修改 admin 表字符集...');
    await connection.query(`ALTER TABLE admin CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ admin 表已修改');
    console.log('');
    
    console.log('3. 修改 accounts 表字符集...');
    await connection.query(`ALTER TABLE accounts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ accounts 表已修改');
    console.log('');
    
    console.log('4. 修改 query_records 表字符集...');
    await connection.query(`ALTER TABLE query_records CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ query_records 表已修改');
    console.log('');
    
    console.log('5. 修改 submissions 表字符集...');
    await connection.query(`ALTER TABLE submissions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log('✅ submissions 表已修改');
    console.log('');
    
    console.log('=== 验证修复 ===');
    const [dbCharset] = await connection.execute("SELECT @@character_set_database, @@collation_database");
    console.log(`数据库字符集: ${dbCharset[0]['@@character_set_database']}`);
    console.log(`排序规则: ${dbCharset[0]['@@collation_database']}`);
    console.log('');
    
    console.log('=== 测试中文插入 ===');
    const testData = {
      username: '测试用户',
      password: 'test123',
      region: '测试区域',
      unit_name: '测试单位'
    };
    
    const [result] = await connection.execute(
      'INSERT INTO accounts (username, password, region, unit_name) VALUES (?, ?, ?, ?)',
      [testData.username, testData.password, testData.region, testData.unit_name]
    );
    
    console.log(`✅ 中文插入成功，ID: ${result.insertId}`);
    console.log('');
    
    console.log('=== 查询测试数据 ===');
    const [rows] = await connection.execute('SELECT * FROM accounts WHERE id = ?', [result.insertId]);
    console.log('查询结果:', JSON.stringify(rows[0], null, 2));
    console.log('');
    
    console.log('=== 清理测试数据 ===');
    await connection.execute('DELETE FROM accounts WHERE id = ?', [result.insertId]);
    console.log('✅ 测试数据已删除');
    
    await connection.end();
    console.log('');
    console.log('=== 修复完成 ===');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
};

fixDatabase();
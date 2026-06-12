const mysql = require('mysql2/promise');
require('dotenv').config();

const checkDatabase = async () => {
  console.log('=== 数据库配置检查 ===');
  console.log(`主机: ${process.env.DB_HOST}`);
  console.log(`用户: ${process.env.DB_USER}`);
  console.log(`数据库: ${process.env.DB_NAME}`);
  console.log('');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    console.log('✅ 连接成功');
    console.log('');
    
    console.log('=== 数据库字符集 ===');
    const [dbCharset] = await connection.execute("SELECT @@character_set_database, @@collation_database");
    console.log(`字符集: ${dbCharset[0]['@@character_set_database']}`);
    console.log(`排序规则: ${dbCharset[0]['@@collation_database']}`);
    console.log('');
    
    console.log('=== accounts 表结构 ===');
    const [accountsTable] = await connection.execute("DESCRIBE accounts");
    console.log('字段名 | 类型 | 是否为空 | 默认值 | 额外');
    console.log('----------------------------------------');
    accountsTable.forEach(row => {
      console.log(`${row.Field} | ${row.Type} | ${row.Null} | ${row.Default || '-'} | ${row.Extra || '-'}`);
    });
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
    console.log('=== 检查完成 ===');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error('错误详情:', error);
    process.exit(1);
  }
};

checkDatabase();
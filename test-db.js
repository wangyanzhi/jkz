const mysql = require('mysql2/promise');
require('dotenv').config();

const testConnection = async () => {
  console.log('测试数据库连接...');
  console.log(`主机: ${process.env.DB_HOST}`);
  console.log(`用户: ${process.env.DB_USER}`);
  console.log(`密码: ${process.env.DB_PASSWORD ? '******' : '空'}`);
  console.log(`数据库: ${process.env.DB_NAME}`);
  console.log('');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectTimeout: 10000
    });
    
    console.log('✅ 连接成功！');
    
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ 数据库 ${process.env.DB_NAME} 创建成功`);
    
    await connection.end();
    console.log('✅ 测试完成');
  } catch (error) {
    console.log('❌ 连接失败:');
    console.log(`   错误码: ${error.code}`);
    console.log(`   错误号: ${error.errno}`);
    console.log(`   SQL状态: ${error.sqlState}`);
    console.log(`   错误信息: ${error.sqlMessage || error.message}`);
    process.exit(1);
  }
};

testConnection();
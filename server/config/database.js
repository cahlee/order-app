const { Pool } = require('pg')
require('dotenv').config()

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'order_app',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
})

// 데이터베이스 연결 테스트
pool.on('connect', () => {
  console.log('PostgreSQL 데이터베이스에 연결되었습니다.')
})

pool.on('error', (err) => {
  console.error('PostgreSQL 연결 오류:', err)
  process.exit(-1)
})

// 연결 테스트 함수
async function testConnection() {
  try {
    const result = await pool.query('SELECT NOW()')
    console.log('데이터베이스 연결 성공:', result.rows[0].now)
    return true
  } catch (error) {
    console.error('데이터베이스 연결 실패:', error.message)
    return false
  }
}

module.exports = {
  pool,
  testConnection
}


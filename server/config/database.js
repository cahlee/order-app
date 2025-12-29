const { Pool } = require('pg')
require('dotenv').config()

// DATABASE_URL이 있으면 사용, 없으면 개별 환경 변수 사용
let poolConfig

if (process.env.DATABASE_URL) {
  // Render.com 등에서 제공하는 DATABASE_URL 사용
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Render.com은 항상 SSL 필요
  }
} else {
  // 개별 환경 변수 사용
  // Render.com 환경에서는 SSL이 필요하므로, 프로덕션 환경이거나 DB_HOST에 render.com이 포함되면 SSL 사용
  const isRenderDb = process.env.DB_HOST && process.env.DB_HOST.includes('render.com')
  const needsSSL = process.env.NODE_ENV === 'production' || isRenderDb
  
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'order_app',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    ssl: needsSSL ? { rejectUnauthorized: false } : false
  }
}

const pool = new Pool(poolConfig)

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


const { Pool } = require('pg')
require('dotenv').config()

async function createDatabase() {
  // 먼저 기본 postgres 데이터베이스에 연결
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: 'postgres', // 기본 데이터베이스
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  })

  const dbName = process.env.DB_NAME || 'order_app'

  try {
    console.log('PostgreSQL에 연결 중...')
    
    // 데이터베이스 존재 여부 확인
    const checkDbResult = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    )

    if (checkDbResult.rows.length > 0) {
      console.log(`데이터베이스 '${dbName}'가 이미 존재합니다.`)
    } else {
      // 데이터베이스 생성
      console.log(`데이터베이스 '${dbName}' 생성 중...`)
      await adminPool.query(`CREATE DATABASE ${dbName}`)
      console.log(`데이터베이스 '${dbName}' 생성 완료!`)
    }

    await adminPool.end()

    // 이제 생성된 데이터베이스에 연결하여 테이블 생성
    const appPool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: dbName,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    })

    console.log(`'${dbName}' 데이터베이스에 연결 중...`)
    
    // 테이블 생성 SQL 실행
    const fs = require('fs')
    const path = require('path')
    const createTableSQL = fs.readFileSync(
      path.join(__dirname, 'create-database.sql'),
      'utf8'
    )

    // 주석 제거 및 SQL 문 분리
    const statements = createTableSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log('테이블 생성 중...')
    for (const statement of statements) {
      if (statement) {
        try {
          await appPool.query(statement)
          console.log(`  ✓ 실행: ${statement.substring(0, 50)}...`)
        } catch (error) {
          // IF NOT EXISTS로 인한 오류는 무시
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`  - 이미 존재: ${statement.substring(0, 50)}...`)
          } else {
            console.error(`  ✗ 오류: ${error.message}`)
            console.error(`    SQL: ${statement.substring(0, 100)}...`)
          }
        }
      }
    }
    console.log('테이블 생성 완료!')

    // 초기 데이터 삽입
    const initDataSQL = fs.readFileSync(
      path.join(__dirname, 'init-data.sql'),
      'utf8'
    )

    // 주석 제거 및 SQL 문 분리
    const initStatements = initDataSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log('초기 데이터 삽입 중...')
    for (const statement of initStatements) {
      if (statement) {
        try {
          await appPool.query(statement)
          console.log(`  ✓ 실행: ${statement.substring(0, 60)}...`)
        } catch (error) {
          console.error(`  ✗ 오류: ${error.message}`)
          console.error(`    SQL: ${statement.substring(0, 100)}...`)
        }
      }
    }
    console.log('초기 데이터 삽입 완료!')

    await appPool.end()
    console.log('데이터베이스 설정이 완료되었습니다!')
    process.exit(0)
  } catch (error) {
    console.error('오류 발생:', error.message)
    console.error(error)
    process.exit(1)
  }
}

createDatabase()


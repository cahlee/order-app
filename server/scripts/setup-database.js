const { pool } = require('../config/database')
const fs = require('fs')
const path = require('path')

async function setupDatabase() {
  try {
    // SQL 파일 읽기
    const createTableSQL = fs.readFileSync(
      path.join(__dirname, 'create-database.sql'),
      'utf8'
    )
    const initDataSQL = fs.readFileSync(
      path.join(__dirname, 'init-data.sql'),
      'utf8'
    )

    // SQL 문을 세미콜론으로 분리하여 실행
    const createStatements = createTableSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    console.log('테이블 생성 중...')
    for (const statement of createStatements) {
      if (statement) {
        await pool.query(statement)
      }
    }
    console.log('테이블 생성 완료!')

    // 초기 데이터 삽입
    console.log('초기 데이터 삽입 중...')
    const initStatements = initDataSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    for (const statement of initStatements) {
      if (statement) {
        await pool.query(statement)
      }
    }
    console.log('초기 데이터 삽입 완료!')

    console.log('데이터베이스 설정이 완료되었습니다.')
    process.exit(0)
  } catch (error) {
    console.error('데이터베이스 설정 중 오류 발생:', error)
    process.exit(1)
  }
}

setupDatabase()


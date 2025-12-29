/**
 * Render.com 배포 후 데이터베이스 초기화 스크립트
 * 
 * 사용 방법:
 * 1. Render.com 대시보드에서 백엔드 서비스의 "Shell" 탭 열기
 * 2. 다음 명령 실행:
 *    node scripts/init-db-on-render.js
 */

const { pool } = require('../config/database')
const fs = require('fs')
const path = require('path')

async function initDatabase() {
  const client = await pool.connect()
  
  try {
    console.log('데이터베이스 초기화 시작...')
    
    await client.query('BEGIN')
    
    // create-database.sql 파일 읽기
    const createDbPath = path.join(__dirname, 'create-database.sql')
    const createDbSql = fs.readFileSync(createDbPath, 'utf8')
    
    // SQL 문장들을 세미콜론으로 분리하고 실행
    const statements = createDbSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log('테이블 생성 중...')
    for (const statement of statements) {
      if (statement) {
        try {
          await client.query(statement)
          console.log(`  ✓ 실행 완료`)
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.warn('SQL 실행 경고:', error.message)
          }
        }
      }
    }
    
    // init-data.sql 파일 읽기
    const initDataPath = path.join(__dirname, 'init-data.sql')
    const initDataSql = fs.readFileSync(initDataPath, 'utf8')
    
    // DELETE 문장들 실행
    const deleteStatements = initDataSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.startsWith('DELETE'))
    
    console.log('기존 데이터 삭제 중...')
    for (const statement of deleteStatements) {
      if (statement) {
        try {
          await client.query(statement)
        } catch (error) {
          console.warn('DELETE 실행 경고:', error.message)
        }
      }
    }
    
    // INSERT 문장들 실행
    const insertStatements = initDataSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.startsWith('INSERT'))
    
    console.log('초기 데이터 삽입 중...')
    for (const statement of insertStatements) {
      if (statement) {
        try {
          await client.query(statement)
        } catch (error) {
          if (!error.message.includes('duplicate key')) {
            console.warn('INSERT 실행 경고:', error.message)
          }
        }
      }
    }
    
    await client.query('COMMIT')
    
    console.log('데이터베이스 초기화 완료!')
    
    // 데이터 확인
    const menuCount = await pool.query('SELECT COUNT(*) FROM menus')
    const optionCount = await pool.query('SELECT COUNT(*) FROM options')
    console.log(`메뉴: ${menuCount.rows[0].count}개`)
    console.log(`옵션: ${optionCount.rows[0].count}개`)
    
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('데이터베이스 초기화 오류:', error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

initDatabase()


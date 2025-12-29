/**
 * Render.com 데이터베이스 스키마 생성 스크립트
 * 
 * 사용 방법:
 * 1. server/.env 파일에 Render 데이터베이스 정보 설정
 * 2. 다음 명령 실행:
 *    node scripts/setup-render-db.js
 */

const { Pool } = require('pg')
require('dotenv').config()
const fs = require('fs')
const path = require('path')

async function setupRenderDatabase() {
  // DATABASE_URL 또는 개별 환경 변수 사용
  let poolConfig

  console.log('환경 변수 확인 중...')
  if (process.env.DATABASE_URL) {
    console.log('✓ DATABASE_URL 사용')
    poolConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    }
  } else if (process.env.DB_HOST) {
    console.log('✓ 개별 환경 변수 사용')
    console.log(`  Host: ${process.env.DB_HOST}`)
    console.log(`  Port: ${process.env.DB_PORT || 5432}`)
    console.log(`  Database: ${process.env.DB_NAME}`)
    console.log(`  User: ${process.env.DB_USER}`)
    poolConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: { rejectUnauthorized: false } // Render는 항상 SSL 필요
    }
  } else {
    console.error('❌ 오류: DATABASE_URL 또는 DB_HOST 환경 변수가 설정되지 않았습니다.')
    console.error('   server/.env 파일을 확인하세요.')
    process.exit(1)
  }

  const pool = new Pool(poolConfig)
  
  let client
  try {
    client = await pool.connect()
  } catch (error) {
    console.error('\n❌ 데이터베이스 연결 실패:', error.message)
    console.error('\n문제 해결 방법:')
    console.error('1. server/.env 파일에 올바른 데이터베이스 정보가 있는지 확인')
    console.error('2. Render.com에서 Internal Database URL을 사용하는 경우 DATABASE_URL 설정')
    console.error('3. 외부 접속이 필요한 경우 External Database URL 사용')
    console.error('4. 네트워크 연결 확인')
    process.exit(1)
  }

  try {
    console.log('Render 데이터베이스에 연결 중...')
    
    // 연결 테스트
    const testResult = await client.query('SELECT NOW()')
    console.log('✓ 데이터베이스 연결 성공:', testResult.rows[0].now)
    
    // 1. 테이블 생성 (트랜잭션 없이 각 문장을 개별 실행)
    console.log('\n📋 테이블 생성 중...')
    const createDbPath = path.join(__dirname, 'create-database.sql')
    const createDbSql = fs.readFileSync(createDbPath, 'utf8')
    
    // 주석 제거 및 SQL 문장 분리
    const lines = createDbSql.split('\n')
    const cleanedLines = lines
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
    
    // 세미콜론으로 분리하되, 여러 줄에 걸친 문장도 처리
    const statements = cleanedLines
      .split(';')
      .map(s => s.trim().replace(/\s+/g, ' '))
      .filter(s => s.length > 0)
    
    // 테이블 생성과 인덱스 생성을 분리
    const tableStatements = statements.filter(s => s.toUpperCase().includes('CREATE TABLE'))
    const indexStatements = statements.filter(s => s.toUpperCase().includes('CREATE INDEX'))
    
    // 먼저 테이블 생성
    for (const statement of tableStatements) {
      if (statement) {
        try {
          await client.query(statement + ';')
          // IF NOT EXISTS를 제외하고 테이블 이름 추출
          const match = statement.match(/CREATE TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/i) || 
                       statement.match(/CREATE TABLE\s+(\w+)/i)
          const tableName = match ? match[1] : '테이블'
          console.log(`  ✓ 테이블: ${tableName}`)
        } catch (error) {
          if (error.message.includes('already exists')) {
            const match = statement.match(/CREATE TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/i) || 
                         statement.match(/CREATE TABLE\s+(\w+)/i)
            const tableName = match ? match[1] : '테이블'
            console.log(`  - 이미 존재: ${tableName}`)
          } else {
            console.error(`  ✗ 오류: ${error.message}`)
            console.error(`    SQL: ${statement.substring(0, 100)}...`)
            // 테이블 생성 실패는 치명적이므로 계속 진행
          }
        }
      }
    }
    
    // 그 다음 인덱스 생성
    for (const statement of indexStatements) {
      if (statement) {
        try {
          await client.query(statement + ';')
          // IF NOT EXISTS를 제외하고 인덱스 이름 추출
          const match = statement.match(/CREATE INDEX\s+IF\s+NOT\s+EXISTS\s+(\w+)/i) || 
                       statement.match(/CREATE INDEX\s+(\w+)/i)
          const indexName = match ? match[1] : '인덱스'
          console.log(`  ✓ 인덱스: ${indexName}`)
        } catch (error) {
          if (error.message.includes('already exists')) {
            const match = statement.match(/CREATE INDEX\s+IF\s+NOT\s+EXISTS\s+(\w+)/i) || 
                         statement.match(/CREATE INDEX\s+(\w+)/i)
            const indexName = match ? match[1] : '인덱스'
            console.log(`  - 이미 존재: ${indexName}`)
          } else {
            console.warn(`  ⚠ 인덱스 경고: ${error.message}`)
          }
        }
      }
    }
    
    console.log('✓ 테이블 생성 완료!')
    
    // 2. 초기 데이터 삽입
    console.log('\n📦 초기 데이터 삽입 중...')
    const initDataPath = path.join(__dirname, 'init-data.sql')
    const initDataSql = fs.readFileSync(initDataPath, 'utf8')
    
    // 주석 제거
    const cleanedInitData = initDataSql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim().length > 0)
      .join('\n')
    
    // DELETE 문장들 실행
    const deleteStatements = cleanedInitData
      .split(';')
      .map(s => s.trim())
      .filter(s => s.toUpperCase().startsWith('DELETE'))
    
    for (const statement of deleteStatements) {
      if (statement) {
        try {
          await client.query(statement + ';')
          const match = statement.match(/DELETE FROM\s+(\w+)/i)
          const tableName = match ? match[1] : '데이터'
          console.log(`  ✓ ${tableName} 기존 데이터 삭제`)
        } catch (error) {
          // 테이블이 없어도 무시 (첫 실행 시)
          if (!error.message.includes('does not exist')) {
            console.warn(`  ⚠ DELETE 경고: ${error.message}`)
          }
        }
      }
    }
    
    // INSERT 문장들 실행
    const insertStatements = cleanedInitData
      .split(';')
      .map(s => s.trim())
      .filter(s => s.toUpperCase().startsWith('INSERT') && s.length > 10)
    
    console.log(`  INSERT 문장 ${insertStatements.length}개 발견`)
    for (const statement of insertStatements) {
      if (statement) {
        try {
          await client.query(statement + ';')
          const match = statement.match(/INSERT INTO\s+(\w+)/i)
          const tableName = match ? match[1] : '데이터'
          console.log(`  ✓ ${tableName} 데이터 삽입`)
        } catch (error) {
          if (error.message.includes('duplicate key')) {
            console.log(`  - 중복 데이터 건너뜀`)
          } else {
            console.warn(`  ⚠ INSERT 경고: ${error.message}`)
            console.warn(`    SQL: ${statement.substring(0, 100)}...`)
          }
        }
      }
    }
    
    console.log('✓ 초기 데이터 삽입 완료!')
    
    // 3. 데이터 확인
    console.log('\n📊 데이터 확인 중...')
    const menuCount = await pool.query('SELECT COUNT(*) as count FROM menus')
    const optionCount = await pool.query('SELECT COUNT(*) as count FROM options')
    const menuList = await pool.query('SELECT id, name, stock FROM menus ORDER BY id')
    
    console.log(`  메뉴: ${menuCount.rows[0].count}개`)
    menuList.rows.forEach(menu => {
      console.log(`    - ${menu.name} (재고: ${menu.stock}개)`)
    })
    console.log(`  옵션: ${optionCount.rows[0].count}개`)
    
    console.log('\n✅ 데이터베이스 스키마 생성 완료!')
    
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

setupRenderDatabase()


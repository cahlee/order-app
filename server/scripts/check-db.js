const { pool } = require('../config/database')

async function checkDatabase() {
  try {
    // 테이블 목록 조회
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log('생성된 테이블:')
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })

    // 메뉴 데이터 확인
    const menusResult = await pool.query('SELECT COUNT(*) as count FROM menus')
    console.log(`\n메뉴 데이터: ${menusResult.rows[0].count}개`)

    // 옵션 데이터 확인
    const optionsResult = await pool.query('SELECT COUNT(*) as count FROM options')
    console.log(`옵션 데이터: ${optionsResult.rows[0].count}개`)

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('오류 발생:', error.message)
    process.exit(1)
  }
}

checkDatabase()


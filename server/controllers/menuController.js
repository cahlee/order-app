const { pool } = require('../config/database')

// GET /api/menus - 메뉴 목록 조회
async function getMenus(req, res) {
  try {
    // 메뉴와 옵션을 함께 조회
    const menusQuery = `
      SELECT 
        m.id,
        m.name,
        m.description,
        m.price,
        m.image,
        m.stock,
        m.created_at,
        m.updated_at
      FROM menus m
      ORDER BY m.id
    `
    
    const menusResult = await pool.query(menusQuery)
    
    // 각 메뉴에 대한 옵션 조회
    const menus = await Promise.all(
      menusResult.rows.map(async (menu) => {
        const optionsQuery = `
          SELECT id, name, price
          FROM options
          WHERE menu_id = $1
          ORDER BY id
        `
        const optionsResult = await pool.query(optionsQuery, [menu.id])
        
        return {
          id: menu.id,
          name: menu.name,
          description: menu.description,
          price: menu.price,
          image: menu.image,
          stock: menu.stock,
          options: optionsResult.rows.map(opt => ({
            id: opt.id,
            name: opt.name,
            price: opt.price
          }))
        }
      })
    )
    
    res.json(menus)
  } catch (error) {
    console.error('메뉴 조회 오류:', error)
    res.status(500).json({ 
      error: '메뉴 조회 중 오류가 발생했습니다.',
      message: error.message 
    })
  }
}

// PATCH /api/menus/:menuId/stock - 재고 수량 조정
async function updateStock(req, res) {
  try {
    const { menuId } = req.params
    const { change } = req.body
    
    if (change === undefined || change === null) {
      return res.status(400).json({ error: 'change 값이 필요합니다.' })
    }
    
    // 현재 재고 확인
    const currentStockResult = await pool.query(
      'SELECT stock FROM menus WHERE id = $1',
      [menuId]
    )
    
    if (currentStockResult.rows.length === 0) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' })
    }
    
    const currentStock = currentStockResult.rows[0].stock
    const newStock = Math.max(0, currentStock + change)
    
    // 재고 업데이트
    const updateResult = await pool.query(
      'UPDATE menus SET stock = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, stock',
      [newStock, menuId]
    )
    
    res.json({
      id: updateResult.rows[0].id,
      name: updateResult.rows[0].name,
      stock: updateResult.rows[0].stock
    })
  } catch (error) {
    console.error('재고 조정 오류:', error)
    res.status(500).json({ 
      error: '재고 조정 중 오류가 발생했습니다.',
      message: error.message 
    })
  }
}

module.exports = {
  getMenus,
  updateStock
}


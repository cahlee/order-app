const { pool } = require('../config/database')

// POST /api/orders - 주문 생성
async function createOrder(req, res) {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    const { items, totalAmount } = req.body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '주문 항목이 필요합니다.' })
    }
    
    if (totalAmount === undefined || totalAmount === null) {
      return res.status(400).json({ error: '총 금액이 필요합니다.' })
    }
    
    // 재고 확인 및 차감
    for (const item of items) {
      const stockResult = await client.query(
        'SELECT stock FROM menus WHERE id = $1',
        [item.menuId]
      )
      
      if (stockResult.rows.length === 0) {
        await client.query('ROLLBACK')
        return res.status(404).json({ error: `메뉴 ID ${item.menuId}를 찾을 수 없습니다.` })
      }
      
      const currentStock = stockResult.rows[0].stock
      if (currentStock < item.quantity) {
        await client.query('ROLLBACK')
        return res.status(409).json({ 
          error: '재고가 부족합니다.',
          menuId: item.menuId,
          available: currentStock,
          requested: item.quantity
        })
      }
      
      // 재고 차감
      await client.query(
        'UPDATE menus SET stock = stock - $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [item.quantity, item.menuId]
      )
    }
    
    // 주문 생성
    const orderResult = await client.query(
      `INSERT INTO orders (order_date, status, total_amount)
       VALUES (CURRENT_TIMESTAMP, 'received', $1)
       RETURNING id, order_date, status, total_amount`,
      [totalAmount]
    )
    
    const orderId = orderResult.rows[0].id
    
    // 주문 상세 항목 생성
    const orderItems = []
    for (const item of items) {
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, item_price)
         VALUES ($1, $2, $3, $4)
         RETURNING id, menu_id, quantity, item_price`,
        [orderId, item.menuId, item.quantity, item.itemPrice]
      )
      
      const orderItemId = itemResult.rows[0].id
      
      // 옵션 저장
      const options = []
      if (item.optionIds && item.optionIds.length > 0) {
        for (const optionId of item.optionIds) {
          await client.query(
            'INSERT INTO order_item_options (order_item_id, option_id) VALUES ($1, $2)',
            [orderItemId, optionId]
          )
          
          // 옵션 정보 조회
          const optionResult = await client.query(
            'SELECT id, name, price FROM options WHERE id = $1',
            [optionId]
          )
          if (optionResult.rows.length > 0) {
            options.push(optionResult.rows[0])
          }
        }
      }
      
      // 메뉴 이름 조회
      const menuResult = await client.query(
        'SELECT name FROM menus WHERE id = $1',
        [item.menuId]
      )
      
      orderItems.push({
        id: orderItemId,
        menuId: item.menuId,
        menuName: menuResult.rows[0].name,
        quantity: item.quantity,
        itemPrice: item.itemPrice,
        options: options
      })
    }
    
    await client.query('COMMIT')
    
    res.status(201).json({
      id: orderId,
      orderDate: orderResult.rows[0].order_date,
      status: orderResult.rows[0].status,
      totalAmount: orderResult.rows[0].total_amount,
      items: orderItems
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('주문 생성 오류:', error)
    res.status(500).json({ 
      error: '주문 생성 중 오류가 발생했습니다.',
      message: error.message 
    })
  } finally {
    client.release()
  }
}

// GET /api/orders - 주문 목록 조회
async function getOrders(req, res) {
  try {
    const ordersResult = await pool.query(
      `SELECT id, order_date, status, total_amount, created_at, updated_at
       FROM orders
       ORDER BY order_date DESC`
    )
    
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        // 주문 상세 항목 조회
        const itemsResult = await pool.query(
          `SELECT oi.id, oi.menu_id, oi.quantity, oi.item_price, m.name as menu_name
           FROM order_items oi
           JOIN menus m ON oi.menu_id = m.id
           WHERE oi.order_id = $1`,
          [order.id]
        )
        
        const items = await Promise.all(
          itemsResult.rows.map(async (item) => {
            // 옵션 조회
            const optionsResult = await pool.query(
              `SELECT o.name
               FROM order_item_options oio
               JOIN options o ON oio.option_id = o.id
               WHERE oio.order_item_id = $1`,
              [item.id]
            )
            
            return {
              menuName: item.menu_name,
              quantity: item.quantity,
              itemPrice: item.item_price,
              options: optionsResult.rows.map(opt => opt.name)
            }
          })
        )
        
        return {
          id: order.id,
          orderDate: order.order_date,
          status: order.status,
          totalAmount: order.total_amount,
          items: items
        }
      })
    )
    
    res.json(orders)
  } catch (error) {
    console.error('주문 목록 조회 오류:', error)
    res.status(500).json({ 
      error: '주문 목록 조회 중 오류가 발생했습니다.',
      message: error.message 
    })
  }
}

// GET /api/orders/:orderId - 주문 상세 조회
async function getOrderById(req, res) {
  try {
    const { orderId } = req.params
    
    const orderResult = await pool.query(
      `SELECT id, order_date, status, total_amount, created_at, updated_at
       FROM orders
       WHERE id = $1`,
      [orderId]
    )
    
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }
    
    const order = orderResult.rows[0]
    
    // 주문 상세 항목 조회
    const itemsResult = await pool.query(
      `SELECT oi.id, oi.menu_id, oi.quantity, oi.item_price, m.name as menu_name
       FROM order_items oi
       JOIN menus m ON oi.menu_id = m.id
       WHERE oi.order_id = $1`,
      [orderId]
    )
    
    const items = await Promise.all(
      itemsResult.rows.map(async (item) => {
        // 옵션 조회
        const optionsResult = await pool.query(
          `SELECT o.id, o.name, o.price
           FROM order_item_options oio
           JOIN options o ON oio.option_id = o.id
           WHERE oio.order_item_id = $1`,
          [item.id]
        )
        
        return {
          menuId: item.menu_id,
          menuName: item.menu_name,
          quantity: item.quantity,
          itemPrice: item.item_price,
          options: optionsResult.rows
        }
      })
    )
    
    res.json({
      id: order.id,
      orderDate: order.order_date,
      status: order.status,
      totalAmount: order.total_amount,
      items: items
    })
  } catch (error) {
    console.error('주문 상세 조회 오류:', error)
    res.status(500).json({ 
      error: '주문 상세 조회 중 오류가 발생했습니다.',
      message: error.message 
    })
  }
}

// PATCH /api/orders/:orderId/status - 주문 상태 변경
async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params
    const { status } = req.body
    
    const validStatuses = ['received', 'in_production', 'completed']
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: '유효하지 않은 상태입니다.',
        validStatuses: validStatuses
      })
    }
    
    // 현재 주문 상태 확인
    const currentOrderResult = await pool.query(
      'SELECT status FROM orders WHERE id = $1',
      [orderId]
    )
    
    if (currentOrderResult.rows.length === 0) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' })
    }
    
    const currentStatus = currentOrderResult.rows[0].status
    
    // 상태 전환 검증
    const validTransitions = {
      'received': ['in_production'],
      'in_production': ['completed'],
      'completed': []
    }
    
    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(409).json({ 
        error: '유효하지 않은 상태 전환입니다.',
        currentStatus: currentStatus,
        requestedStatus: status
      })
    }
    
    // 상태 업데이트
    const updateResult = await pool.query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, status, updated_at`,
      [status, orderId]
    )
    
    res.json({
      id: updateResult.rows[0].id,
      status: updateResult.rows[0].status,
      updatedAt: updateResult.rows[0].updated_at
    })
  } catch (error) {
    console.error('주문 상태 변경 오류:', error)
    res.status(500).json({ 
      error: '주문 상태 변경 중 오류가 발생했습니다.',
      message: error.message 
    })
  }
}

// GET /api/orders/stats - 주문 통계 조회
async function getOrderStats(req, res) {
  try {
    const statsResult = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'received') as received,
        COUNT(*) FILTER (WHERE status = 'in_production') as in_production,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM orders`
    )
    
    const stats = statsResult.rows[0]
    
    res.json({
      total: parseInt(stats.total),
      received: parseInt(stats.received),
      inProduction: parseInt(stats.in_production),
      completed: parseInt(stats.completed)
    })
  } catch (error) {
    console.error('주문 통계 조회 오류:', error)
    res.status(500).json({ 
      error: '주문 통계 조회 중 오류가 발생했습니다.',
      message: error.message 
    })
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getOrderStats
}


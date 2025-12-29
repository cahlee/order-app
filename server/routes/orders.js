const express = require('express')
const router = express.Router()
const orderController = require('../controllers/orderController')

// POST /api/orders - 주문 생성
router.post('/', orderController.createOrder)

// GET /api/orders - 주문 목록 조회
router.get('/', orderController.getOrders)

// GET /api/orders/stats - 주문 통계 조회
router.get('/stats', orderController.getOrderStats)

// GET /api/orders/:orderId - 주문 상세 조회
router.get('/:orderId', orderController.getOrderById)

// PATCH /api/orders/:orderId/status - 주문 상태 변경
router.patch('/:orderId/status', orderController.updateOrderStatus)

module.exports = router


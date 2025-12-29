const express = require('express')
const router = express.Router()
const menuController = require('../controllers/menuController')

// GET /api/menus - 메뉴 목록 조회
router.get('/', menuController.getMenus)

// PATCH /api/menus/:menuId/stock - 재고 수량 조정
router.patch('/:menuId/stock', menuController.updateStock)

module.exports = router


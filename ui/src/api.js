const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// 메뉴 API
export const getMenus = async () => {
  const response = await fetch(`${API_BASE_URL}/menus`)
  if (!response.ok) {
    throw new Error('메뉴 조회 실패')
  }
  return response.json()
}

// 재고 조정 API
export const updateStock = async (menuId, change) => {
  const response = await fetch(`${API_BASE_URL}/menus/${menuId}/stock`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ change }),
  })
  if (!response.ok) {
    throw new Error('재고 조정 실패')
  }
  return response.json()
}

// 주문 생성 API
export const createOrder = async (orderData) => {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '주문 생성 실패')
  }
  return response.json()
}

// 주문 목록 조회 API
export const getOrders = async () => {
  const response = await fetch(`${API_BASE_URL}/orders`)
  if (!response.ok) {
    throw new Error('주문 목록 조회 실패')
  }
  return response.json()
}

// 주문 상세 조회 API
export const getOrderById = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`)
  if (!response.ok) {
    throw new Error('주문 상세 조회 실패')
  }
  return response.json()
}

// 주문 상태 변경 API
export const updateOrderStatus = async (orderId, status) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '주문 상태 변경 실패')
  }
  return response.json()
}

// 주문 통계 조회 API
export const getOrderStats = async () => {
  const response = await fetch(`${API_BASE_URL}/orders/stats`)
  if (!response.ok) {
    throw new Error('주문 통계 조회 실패')
  }
  return response.json()
}


import { useState, useEffect, useMemo } from 'react'
import './App.css'
import Header from './components/Header'
import MenuItem from './components/MenuItem'
import ShoppingCart from './components/ShoppingCart'
import AdminDashboard from './components/AdminDashboard'
import InventoryStatus from './components/InventoryStatus'
import OrderStatus from './components/OrderStatus'
import * as api from './api'

function App() {
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'
  
  // 메뉴 데이터
  const [menus, setMenus] = useState([])
  const [menusLoading, setMenusLoading] = useState(true)
  
  // 메뉴 데이터 로드
  useEffect(() => {
    const loadMenus = async () => {
      try {
        const menuData = await api.getMenus()
        // 옵션 ID를 문자열로 변환 (프런트엔드 호환성)
        const formattedMenus = menuData.map(menu => ({
          ...menu,
          options: menu.options.map(opt => ({
            id: String(opt.id),
            name: opt.name,
            price: opt.price
          }))
        }))
        setMenus(formattedMenus)
      } catch (error) {
        console.error('메뉴 로드 오류:', error)
        alert('메뉴를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setMenusLoading(false)
      }
    }
    loadMenus()
  }, [])

  // 장바구니 상태
  const [cart, setCart] = useState([])

  // 장바구니에 아이템 추가
  const addToCart = (menu, selectedOptions) => {
    const optionIds = selectedOptions.sort().join(',')
    const cartItemKey = `${menu.id}-${optionIds}`
    
    // 옵션 이름 배열 생성
    const optionNames = selectedOptions
      .map(optId => {
        const option = menu.options.find(opt => opt.id === optId)
        return option ? option.name : ''
      })
      .filter(name => name)

    // 총 가격 계산
    const basePrice = menu.price
    const optionsPrice = selectedOptions.reduce((sum, optId) => {
      const option = menu.options.find(opt => opt.id === optId)
      return sum + (option ? option.price : 0)
    }, 0)
    const totalPrice = basePrice + optionsPrice

    // 기존 아이템 찾기
    const existingItemIndex = cart.findIndex(item => item.key === cartItemKey)

    if (existingItemIndex >= 0) {
      // 수량 증가
      const newCart = [...cart]
      newCart[existingItemIndex].quantity += 1
      setCart(newCart)
    } else {
      // 새 아이템 추가
      const newItem = {
        key: cartItemKey,
        menuId: menu.id,
        menuName: menu.name,
        optionNames: optionNames,
        price: totalPrice,
        quantity: 1
      }
      setCart([...cart, newItem])
    }
  }

  // 장바구니 아이템 제거
  const removeFromCart = (itemKey) => {
    setCart(cart.filter(item => item.key !== itemKey))
  }

  // 장바구니 아이템 수량 조정
  const updateQuantity = (itemKey, change) => {
    const newCart = cart.map(item => {
      if (item.key === itemKey) {
        const newQuantity = item.quantity + change
        if (newQuantity <= 0) {
          return null // 삭제
        }
        return { ...item, quantity: newQuantity }
      }
      return item
    }).filter(item => item !== null)
    
    setCart(newCart)
  }

  // 총 금액 계산
  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  // 주문하기
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    
    try {
      // API 형식으로 주문 데이터 변환
      const orderItems = cart.map(item => {
        // 옵션 ID를 숫자로 변환
        const optionIds = item.optionNames.map(optName => {
          const menu = menus.find(m => m.id === item.menuId)
          if (menu) {
            const option = menu.options.find(opt => opt.name === optName)
            return option ? parseInt(option.id) : null
          }
          return null
        }).filter(id => id !== null)
        
        return {
          menuId: item.menuId,
          quantity: item.quantity,
          optionIds: optionIds,
          itemPrice: item.price
        }
      })
      
      const orderData = {
        items: orderItems,
        totalAmount: calculateTotal()
      }
      
      // API 호출
      await api.createOrder(orderData)
      
      // 메뉴 데이터 새로고침 (재고 업데이트)
      const menuData = await api.getMenus()
      const formattedMenus = menuData.map(menu => ({
        ...menu,
        options: menu.options.map(opt => ({
          id: String(opt.id),
          name: opt.name,
          price: opt.price
        }))
      }))
      setMenus(formattedMenus)
      
      // 주문 목록 새로고침
      await loadOrders()
      
      alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
      setCart([])
    } catch (error) {
      console.error('주문 생성 오류:', error)
      alert(error.message || '주문 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
    }
  }

  // 관리자 화면 상태
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [orderStats, setOrderStats] = useState({
    total: 0,
    received: 0,
    inProduction: 0,
    completed: 0
  })
  
  // 주문 목록 로드
  const loadOrders = async () => {
    try {
      const orderData = await api.getOrders()
      const formattedOrders = orderData.map(order => ({
        id: order.id,
        date: new Date(order.orderDate),
        items: order.items,
        total: order.totalAmount,
        status: order.status
      }))
      setOrders(formattedOrders)
    } catch (error) {
      console.error('주문 목록 로드 오류:', error)
    }
  }
  
  // 주문 통계 로드
  const loadOrderStats = async () => {
    try {
      const stats = await api.getOrderStats()
      setOrderStats(stats)
    } catch (error) {
      console.error('주문 통계 로드 오류:', error)
    }
  }
  
  // 재고 데이터는 menus에서 가져옴
  useEffect(() => {
    if (menus.length > 0) {
      setInventory(menus.map(menu => ({
        id: menu.id,
        name: menu.name,
        stock: menu.stock
      })))
    }
  }, [menus])
  
  // 관리자 화면 진입 시 데이터 로드
  useEffect(() => {
    if (currentView === 'admin') {
      loadOrders()
      loadOrderStats()
    }
  }, [currentView])

  // 재고 조정
  const updateInventory = async (menuId, change) => {
    try {
      await api.updateStock(menuId, change)
      
      // 메뉴 데이터 새로고침
      const menuData = await api.getMenus()
      const formattedMenus = menuData.map(menu => ({
        ...menu,
        options: menu.options.map(opt => ({
          id: String(opt.id),
          name: opt.name,
          price: opt.price
        }))
      }))
      setMenus(formattedMenus)
    } catch (error) {
      console.error('재고 조정 오류:', error)
      alert('재고 조정 중 오류가 발생했습니다.')
    }
  }

  // 주문 상태 변경
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus)
      
      // 주문 목록 및 통계 새로고침
      await loadOrders()
      await loadOrderStats()
    } catch (error) {
      console.error('주문 상태 업데이트 오류:', error)
      alert(error.message || '주문 상태 업데이트 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="App">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      {currentView === 'order' ? (
        <>
          <div className="menu-section">
            <h2>메뉴</h2>
            {menusLoading ? (
              <p>메뉴를 불러오는 중...</p>
            ) : (
              <div className="menu-grid">
                {menus.map(menu => (
                  <MenuItem
                    key={menu.id}
                    menu={menu}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </div>
          <ShoppingCart
            cart={cart}
            total={calculateTotal()}
            onRemove={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onOrder={handleOrder}
          />
        </>
      ) : (
        <div className="admin-section">
          <AdminDashboard stats={orderStats} />
          <InventoryStatus 
            inventory={inventory} 
            onUpdateInventory={updateInventory}
          />
          <OrderStatus 
            orders={orders}
            onUpdateStatus={updateOrderStatus}
          />
        </div>
      )}
    </div>
  )
}

export default App

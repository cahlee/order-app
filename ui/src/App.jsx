import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import MenuItem from './components/MenuItem'
import ShoppingCart from './components/ShoppingCart'

function App() {
  // 메뉴 데이터
  const [menus] = useState([
    {
      id: 1,
      name: '아메리카노(ICE)',
      price: 4000,
      description: '에스프레소에 물을 넣어 만든 시원한 커피',
      image: '/images/americano-ice.jpg',
      options: [
        { id: 'shot', name: '샷 추가', price: 500 },
        { id: 'syrup', name: '시럽 추가', price: 0 }
      ]
    },
    {
      id: 2,
      name: '아메리카노(HOT)',
      price: 4000,
      description: '에스프레소에 물을 넣어 만든 따뜻한 커피',
      image: '/images/americano-hot.jpg',
      options: [
        { id: 'shot', name: '샷 추가', price: 500 },
        { id: 'syrup', name: '시럽 추가', price: 0 }
      ]
    },
    {
      id: 3,
      name: '카페라떼',
      price: 5000,
      description: '에스프레소와 스팀 밀크의 조화',
      image: '/images/caffe-latte.jpg',
      options: [
        { id: 'shot', name: '샷 추가', price: 500 },
        { id: 'syrup', name: '시럽 추가', price: 0 }
      ]
    }
  ])

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
  const handleOrder = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
    setCart([])
  }

  return (
    <div className="App">
      <Header />
      <div className="menu-section">
        <h2>메뉴</h2>
        <div className="menu-grid">
          {menus.map(menu => (
            <MenuItem
              key={menu.id}
              menu={menu}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </div>
      <ShoppingCart
        cart={cart}
        total={calculateTotal()}
        onRemove={removeFromCart}
        onUpdateQuantity={updateQuantity}
        onOrder={handleOrder}
      />
    </div>
  )
}

export default App

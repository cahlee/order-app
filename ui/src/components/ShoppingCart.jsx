import './ShoppingCart.css'

function ShoppingCart({ cart, total, onRemove, onUpdateQuantity, onOrder }) {
  return (
    <div className="shopping-cart">
      <h2 className="cart-title">장바구니</h2>
      <div className="cart-content">
        {cart.length === 0 ? (
          <p className="empty-cart">장바구니가 비어있습니다.</p>
        ) : (
          <>
            <div className="cart-items-section">
              {cart.map(item => (
                <div key={item.key} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">
                      {item.menuName}
                      {item.optionNames.length > 0 && ` (${item.optionNames.join(', ')})`}
                    </span>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                    <button
                      className="quantity-button"
                      onClick={() => onUpdateQuantity(item.key, -1)}
                      aria-label="수량 감소"
                    >
                      −
                    </button>
                    <span className="quantity-display" aria-label={`수량: ${item.quantity}`}>
                      {item.quantity}
                    </span>
                    <button
                      className="quantity-button"
                      onClick={() => onUpdateQuantity(item.key, 1)}
                      aria-label="수량 증가"
                    >
                      +
                    </button>
                    </div>
                    <span className="cart-item-price">
                      {(item.price * item.quantity).toLocaleString()}원
                    </span>
                    <button
                      className="remove-button"
                      onClick={() => onRemove(item.key)}
                      aria-label={`${item.menuName} 삭제`}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="cart-summary-section">
              <div className="cart-summary">
                <div className="total-amount">
                  <span className="total-label">총 금액</span>
                  <span className="total-price">{total.toLocaleString()}원</span>
                </div>
                <button 
                  className="order-button" 
                  onClick={onOrder}
                  aria-label="주문하기"
                >
                  주문하기
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart


import './OrderStatus.css'

function OrderStatus({ orders, onUpdateStatus }) {
  const formatDate = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  const formatOrderItems = (items) => {
    return items.map(item => {
      const options = item.optionNames.length > 0 
        ? ` (${item.optionNames.join(', ')})` 
        : ''
      return `${item.menuName}${options} x ${item.quantity}`
    }).join(', ')
  }

  const getStatusButton = (order) => {
    if (order.status === 'received') {
      return (
        <button
          className="status-button start-production"
          onClick={() => onUpdateStatus(order.id, 'in_production')}
          aria-label="제조 시작"
        >
          제조 시작
        </button>
      )
    } else if (order.status === 'in_production') {
      return (
        <button
          className="status-button complete"
          onClick={() => onUpdateStatus(order.id, 'completed')}
          aria-label="제조 완료"
        >
          제조 완료
        </button>
      )
    }
    return (
      <span className="status-completed">제조 완료</span>
    )
  }

  const getStatusLabel = (status) => {
    const labels = {
      received: '주문 접수',
      in_production: '제조 중',
      completed: '제조 완료'
    }
    return labels[status] || status
  }

  return (
    <div className="order-status">
      <h2 className="order-title">주문 현황</h2>
      <div className="order-list">
        {orders.length === 0 ? (
          <p className="empty-orders">주문이 없습니다.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-info">
                <div className="order-header">
                  <span className="order-date">{formatDate(order.date)}</span>
                  <span className="order-status-badge">{getStatusLabel(order.status)}</span>
                </div>
                <div className="order-items">{formatOrderItems(order.items)}</div>
                <div className="order-total">{order.total.toLocaleString()}원</div>
              </div>
              <div className="order-actions">
                {getStatusButton(order)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default OrderStatus


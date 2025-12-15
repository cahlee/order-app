import './InventoryStatus.css'

function InventoryStatus({ inventory, onUpdateInventory }) {
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: '#ef4444' }
    if (stock < 5) return { text: '주의', color: '#f59e0b' }
    return { text: '정상', color: '#10b981' }
  }

  return (
    <div className="inventory-status">
      <h2 className="inventory-title">재고 현황</h2>
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>메뉴명</th>
              <th>재고 수량</th>
              <th>상태</th>
              <th>조정</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => {
              const status = getStockStatus(item.stock)
              return (
                <tr key={item.id} className="inventory-row">
                  <td className="inventory-menu-name">{item.name}</td>
                  <td className="stock-amount">{item.stock}개</td>
                  <td>
                    <span className="stock-status" style={{ color: status.color }}>
                      {status.text}
                    </span>
                  </td>
                  <td>
                    <div className="inventory-controls">
                      <button
                        className="inventory-button minus"
                        onClick={() => onUpdateInventory(item.id, -1)}
                        disabled={item.stock === 0}
                        aria-label={`${item.name} 재고 감소`}
                      >
                        −
                      </button>
                      <button
                        className="inventory-button plus"
                        onClick={() => onUpdateInventory(item.id, 1)}
                        aria-label={`${item.name} 재고 증가`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventoryStatus


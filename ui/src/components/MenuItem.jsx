import { useState } from 'react'
import './MenuItem.css'

function MenuItem({ menu, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])
  const [imageError, setImageError] = useState(false)

  const handleOptionChange = (optionId) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId))
    } else {
      setSelectedOptions([...selectedOptions, optionId])
    }
  }

  const handleAddToCart = () => {
    onAddToCart(menu, selectedOptions)
    setSelectedOptions([])
  }

  return (
    <div className="menu-item-card">
      <div className="menu-image-container">
        {menu.image && !imageError ? (
          <img 
            src={menu.image} 
            alt={menu.name}
            className="menu-image"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="menu-image-placeholder">
            <div className="placeholder-x">✕</div>
          </div>
        )}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menu.name}</h3>
        <p className="menu-price">{menu.price.toLocaleString()}원</p>
        <p className="menu-description">{menu.description}</p>
        <div className="menu-options">
          {menu.options.map(option => (
            <label key={option.id} className="option-checkbox">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={() => handleOptionChange(option.id)}
              />
              <span>
                {option.name} {option.price > 0 && `(+${option.price.toLocaleString()}원)`}
              </span>
            </label>
          ))}
        </div>
        <button className="add-to-cart-button" onClick={handleAddToCart}>
          담기
        </button>
      </div>
    </div>
  )
}

export default MenuItem


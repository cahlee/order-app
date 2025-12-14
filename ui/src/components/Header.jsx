import './Header.css'

function Header({ currentView, onViewChange }) {
  return (
    <header className="header">
      <div className="logo">COZY</div>
      <div className="nav-buttons">
        <button 
          className={`nav-button ${currentView === 'order' ? 'active' : ''}`}
          onClick={() => onViewChange('order')}
        >
          주문하기
        </button>
        <button 
          className={`nav-button ${currentView === 'admin' ? 'active' : ''}`}
          onClick={() => onViewChange('admin')}
        >
          관리자
        </button>
      </div>
    </header>
  )
}

export default Header


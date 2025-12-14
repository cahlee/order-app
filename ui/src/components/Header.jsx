import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="logo">COZY</div>
      <div className="nav-buttons">
        <button className="nav-button active">주문하기</button>
        <button className="nav-button">관리자</button>
      </div>
    </header>
  )
}

export default Header


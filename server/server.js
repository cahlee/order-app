const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { testConnection } = require('./config/database')

const app = express()
const PORT = process.env.PORT || 3000

// 미들웨어
// CORS 설정: 프런트엔드 URL 허용
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://order-app-frontend-5zc8.onrender.com', // 프런트엔드 URL (하드코딩)
  'http://localhost:5173', // 로컬 개발용
  'http://localhost:3000', // 로컬 개발용
  'http://localhost:65173' // 로컬 개발용 (Vite 포트)
].filter(Boolean) // undefined 제거

const corsOptions = {
  origin: function (origin, callback) {
    // 개발 환경에서는 모든 origin 허용
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true)
    }
    
    // origin이 없으면 (같은 도메인 요청, Postman 등) 허용
    if (!origin) {
      return callback(null, true)
    }
    
    // 허용된 origin 목록에 있으면 허용
    if (allowedOrigins.some(allowed => origin === allowed)) {
      callback(null, true)
    } else {
      console.warn(`CORS 차단: ${origin}`)
      callback(new Error('CORS 정책에 의해 차단되었습니다.'))
    }
  },
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: '커피 주문 앱 API 서버',
    version: '1.0.0'
  })
})

// API 라우트
app.use('/api/menus', require('./routes/menus'))
app.use('/api/orders', require('./routes/orders'))

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ 
    error: '서버 내부 오류가 발생했습니다.',
    message: err.message 
  })
})

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ 
    error: '요청한 리소스를 찾을 수 없습니다.' 
  })
})

// 서버 시작
app.listen(PORT, async () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`http://localhost:${PORT}`)
  
  // 데이터베이스 연결 테스트
  await testConnection()
})

module.exports = app


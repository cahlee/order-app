# 커피 주문 앱 - 백엔드 서버

Express.js를 사용한 RESTful API 서버입니다.

## 개발 환경 설정

```bash
# 의존성 설치
npm install

# 데이터베이스 설정 (최초 1회만 실행)
# 먼저 PostgreSQL에서 'order_app' 데이터베이스를 생성해야 합니다:
# CREATE DATABASE order_app;

# 테이블 생성 및 초기 데이터 삽입
npm run setup-db

# 개발 서버 실행
npm run dev

# 프로덕션 서버 실행
npm start
```

## 환경 변수 설정

`.env` 파일이 이미 생성되어 있습니다. 필요에 따라 환경 변수를 수정하세요.

기본 설정:
- `PORT=3000` - 서버 포트 번호

데이터베이스 설정이 필요한 경우 주석을 해제하고 값을 입력하세요.

## API 엔드포인트

### 메뉴 관련
- `GET /api/menus` - 메뉴 목록 조회

### 주문 관련
- `POST /api/orders` - 주문 생성
- `GET /api/orders` - 주문 목록 조회
- `GET /api/orders/:orderId` - 주문 상세 조회
- `PATCH /api/orders/:orderId/status` - 주문 상태 변경
- `GET /api/orders/stats` - 주문 통계 조회

### 재고 관련
- `PATCH /api/menus/:menuId/stock` - 재고 수량 조정

## 기술 스택

- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL 클라이언트)
- CORS
- dotenv

## 프로젝트 구조

```
server/
├── server.js          # 서버 진입점
├── routes/            # API 라우트 (추후 생성)
├── controllers/       # 컨트롤러 (추후 생성)
├── models/           # 데이터 모델 (추후 생성)
├── middleware/        # 미들웨어 (추후 생성)
└── config/           # 설정 파일 (추후 생성)
```


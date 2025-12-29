# Render 데이터베이스 스키마 생성 가이드

## 방법 1: 로컬에서 실행 (External Database URL 사용)

Render.com의 PostgreSQL은 기본적으로 외부 접속이 제한되어 있습니다. 로컬에서 접속하려면 **External Database URL**을 사용해야 합니다.

### 1. Render.com에서 External Database URL 가져오기

1. Render.com 대시보드 → PostgreSQL 서비스 선택
2. "Connections" 탭에서 **External Database URL** 복사
   - 형식: `postgresql://user:password@host:port/dbname?sslmode=require`

### 2. server/.env 파일 설정

```env
# 방법 1: DATABASE_URL 사용 (권장)
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require

# 방법 2: 개별 환경 변수 사용
DB_HOST=your-external-host.render.com
DB_PORT=5432
DB_NAME=order_app
DB_USER=your_user
DB_PASSWORD=your_password
```

### 3. 스크립트 실행

```bash
cd server
node scripts/setup-render-db.js
```

## 방법 2: Render.com Shell에서 실행 (권장)

로컬에서 접속이 안 되는 경우, Render.com의 백엔드 서비스 Shell에서 실행하는 것이 더 안전합니다.

### 1. Render.com 대시보드 접속

1. 백엔드 Web Service 선택
2. "Shell" 탭 클릭

### 2. 스크립트 실행

```bash
node scripts/init-db-on-render.js
```

이 방법은 Internal Database URL을 자동으로 사용하므로 연결 문제가 없습니다.

## 방법 3: SQL 직접 실행

Render.com PostgreSQL 서비스의 "Connect" 탭에서 SQL을 직접 실행할 수도 있습니다.

### 1. create-database.sql 실행

`server/scripts/create-database.sql` 파일의 내용을 복사하여 실행

### 2. init-data.sql 실행

`server/scripts/init-data.sql` 파일의 내용을 복사하여 실행

## 문제 해결

### 연결 오류 (EAI_FAIL, getaddrinfo)

- **원인**: External Database URL을 사용하지 않았거나, 네트워크 문제
- **해결**: 
  1. Render.com에서 External Database URL 확인
  2. `sslmode=require` 파라미터 포함 확인
  3. 방법 2 (Render Shell) 사용 권장

### SSL 오류

- **원인**: SSL 설정 누락
- **해결**: `sslmode=require` 파라미터 추가 또는 `ssl: { rejectUnauthorized: false }` 설정

### 권한 오류

- **원인**: 데이터베이스 사용자 권한 부족
- **해결**: Render.com에서 생성한 사용자는 기본적으로 모든 권한이 있습니다. 문제가 지속되면 Render 지원팀에 문의하세요.


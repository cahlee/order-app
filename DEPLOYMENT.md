# Render.com 배포 가이드

이 문서는 커피 주문 앱을 Render.com에 배포하는 방법을 설명합니다.

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 배포

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인 후 "New +" 버튼 클릭

2. **PostgreSQL 서비스 생성**
   - "PostgreSQL" 선택
   - 설정:
     - **Name**: `order-app-db` (원하는 이름)
     - **Database**: `order_app`
     - **User**: `postgres` (기본값)
     - **Region**: 가장 가까운 지역 선택
     - **PostgreSQL Version**: 최신 버전
     - **Plan**: Free tier 선택 (또는 유료 플랜)
   - "Create Database" 클릭

3. **데이터베이스 정보 저장**
   - 생성 후 표시되는 정보를 복사해두세요:
     - **Internal Database URL**: `postgresql://user:password@host:port/dbname`
     - **External Database URL**: 외부 접속용 (선택사항)
     - **Host**: 데이터베이스 호스트
     - **Port**: 포트 번호 (기본 5432)
     - **Database**: 데이터베이스 이름
     - **User**: 사용자 이름
     - **Password**: 비밀번호

4. **데이터베이스 초기화**
   - 로컬에서 `server/scripts/create-db.js`를 실행하여 테이블 생성
   - 또는 Render.com의 PostgreSQL 서비스에서 직접 SQL 실행

### 2단계: 백엔드 서버 배포

1. **GitHub 저장소 준비**
   - 프로젝트를 GitHub에 푸시
   - `server` 폴더가 루트에 있는지 확인

2. **Web Service 생성**
   - Render.com 대시보드에서 "New +" → "Web Service" 선택
   - GitHub 저장소 연결

3. **서비스 설정**
   - **Name**: `order-app-api` (원하는 이름)
   - **Region**: 데이터베이스와 같은 지역 선택
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `server` (백엔드 폴더)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free tier 선택

4. **환경 변수 설정**
   - "Environment" 섹션에서 다음 변수 추가:
     ```
     NODE_ENV=production
     PORT=10000
     DATABASE_URL=<Internal Database URL>
     FRONTEND_URL=<프런트엔드 URL (나중에 설정)>
     ```
   - 또는 개별 환경 변수 사용:
     ```
     NODE_ENV=production
     PORT=10000
     DB_HOST=<데이터베이스 호스트>
     DB_PORT=5432
     DB_NAME=order_app
     DB_USER=<데이터베이스 사용자>
     DB_PASSWORD=<데이터베이스 비밀번호>
     ```
   - **참고**: `server/config/database.js`는 `DATABASE_URL`과 개별 환경 변수 모두 지원합니다.

5. **데이터베이스 초기화 스크립트 실행**
   - 배포 후 "Shell" 탭에서 다음 명령 실행:
     ```bash
     node scripts/init-db-on-render.js
     ```
   - 또는 로컬에서 실행:
     ```bash
     npm run create-db
     ```

### 3단계: 프런트엔드 배포

1. **Static Site로 배포 (권장)**
   - Render.com 대시보드에서 "New +" → "Static Site" 선택
   - GitHub 저장소 연결

2. **서비스 설정**
   - **Name**: `order-app` (원하는 이름)
   - **Branch**: `main` (또는 기본 브랜치)
   - **Root Directory**: `ui` (프런트엔드 폴더)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist` (Vite 빌드 출력 폴더)

3. **환경 변수 설정**
   - "Environment" 섹션에서 API URL 설정:
     ```
     VITE_API_URL=https://order-app-api.onrender.com
     ```
   - **참고**: `ui/src/api.js`는 이미 환경 변수를 사용하도록 설정되어 있습니다.
   - 배포된 백엔드 URL로 변경하세요 (예: `https://order-app-api.onrender.com`)

4. **API URL 업데이트**
   - 배포된 백엔드 URL로 프런트엔드 API URL 변경

## 중요 사항

### 백엔드 설정 확인
- `server/config/database.js`가 `DATABASE_URL` 환경 변수도 지원하는지 확인
- CORS 설정이 프런트엔드 도메인을 허용하는지 확인

### 프런트엔드 설정 확인
- `ui/src/api.js`에서 환경 변수를 사용하도록 수정
- 빌드 시 API URL이 올바르게 설정되는지 확인

### 데이터베이스 초기화
- 배포 후 반드시 데이터베이스 초기화 스크립트 실행
- 또는 SQL 스크립트를 직접 실행

### 무료 플랜 제한사항
- Render.com 무료 플랜은 15분간 요청이 없으면 서비스가 sleep 상태가 됩니다
- 첫 요청 시 깨어나는데 시간이 걸릴 수 있습니다
- 프로덕션 환경에서는 유료 플랜 사용을 권장합니다

## 배포 후 확인사항

1. 백엔드 API가 정상 작동하는지 확인
   - `https://order-app-api.onrender.com/` 접속
   - `https://order-app-api.onrender.com/api/menus` 접속

2. 프런트엔드가 백엔드와 통신하는지 확인
   - 프런트엔드 URL 접속
   - 메뉴 목록이 표시되는지 확인
   - 주문 기능이 작동하는지 확인

3. 데이터베이스 연결 확인
   - 백엔드 로그에서 데이터베이스 연결 메시지 확인
   - 관리자 화면에서 주문 목록이 표시되는지 확인


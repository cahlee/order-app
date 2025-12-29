# 프런트엔드 Render.com 배포 가이드

## 사전 준비

1. **백엔드 URL 확인**
   - 배포된 백엔드 서비스 URL을 확인하세요
   - 예: `https://order-app-p5x5.onrender.com`
   - API 엔드포인트: `https://order-app-p5x5.onrender.com/api`

2. **GitHub 저장소 확인**
   - 프런트엔드 코드가 GitHub에 푸시되어 있는지 확인
   - `ui` 폴더가 루트에 있는지 확인

## 코드 수정 사항

### ✅ 이미 완료된 수정

1. **`ui/src/api.js`**
   - 환경 변수 `VITE_API_URL` 사용하도록 설정됨
   - 기본값: `http://localhost:3000/api` (개발 환경)

### 추가 수정 필요 없음

현재 코드는 배포 준비가 완료되었습니다!

## Render.com 배포 과정

### 1단계: Static Site 생성

1. **Render.com 대시보드 접속**
   - https://dashboard.render.com 접속
   - 로그인 후 "New +" 버튼 클릭

2. **Static Site 선택**
   - "Static Site" 선택

3. **GitHub 저장소 연결**
   - "Connect account" 또는 "Connect repository" 클릭
   - GitHub 계정 연결 (처음인 경우)
   - 저장소 선택: `cahlee/order-app`

### 2단계: 서비스 설정

다음 설정을 입력하세요:

- **Name**: `order-app` (또는 원하는 이름)
- **Branch**: `main` (또는 기본 브랜치)
- **Root Directory**: `ui` ⚠️ **중요: 반드시 `ui`로 설정**
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist` ⚠️ **중요: Vite 빌드 출력 폴더**

### 3단계: 환경 변수 설정

"Environment" 섹션에서 다음 환경 변수를 추가:

```
VITE_API_URL=https://order-app-p5x5.onrender.com/api
```

⚠️ **주의**: 
- `https://order-app-p5x5.onrender.com`을 실제 백엔드 URL로 변경하세요
- `/api`는 포함해야 합니다
- `VITE_` 접두사가 필수입니다 (Vite 환경 변수 규칙)

### 4단계: 배포 시작

1. "Create Static Site" 버튼 클릭
2. 배포가 자동으로 시작됩니다
3. 빌드 로그를 확인하세요

### 5단계: 배포 확인

1. **빌드 성공 확인**
   - 로그에서 "Build successful" 메시지 확인
   - 오류가 있으면 로그 확인

2. **사이트 접속**
   - 배포 완료 후 제공되는 URL로 접속
   - 예: `https://order-app.onrender.com`

3. **기능 테스트**
   - 메뉴 목록이 표시되는지 확인
   - 주문 기능이 작동하는지 확인
   - 관리자 화면이 정상 작동하는지 확인

## 문제 해결

### 빌드 실패

**오류**: `npm install` 실패
- **원인**: Node.js 버전 문제
- **해결**: Render.com에서 Node.js 버전을 명시적으로 설정
  - 환경 변수 추가: `NODE_VERSION=18` (또는 16, 20)

**오류**: `vite build` 실패
- **원인**: 의존성 문제
- **해결**: 
  1. 로컬에서 `npm install && npm run build` 테스트
  2. `package-lock.json`이 최신인지 확인

### API 연결 실패

**증상**: 메뉴가 로드되지 않음, CORS 오류
- **원인**: 백엔드 CORS 설정 문제 또는 API URL 오류
- **해결**:
  1. `VITE_API_URL` 환경 변수가 올바른지 확인
  2. 백엔드 서버의 CORS 설정 확인
  3. 브라우저 개발자 도구에서 네트워크 오류 확인

### 빌드는 성공했지만 페이지가 표시되지 않음

**원인**: `Publish Directory` 설정 오류
- **해결**: `dist` 폴더로 설정되어 있는지 확인

## 배포 후 업데이트

코드를 수정한 후:

1. GitHub에 푸시
   ```bash
   git add .
   git commit -m "Update frontend"
   git push
   ```

2. Render.com이 자동으로 재배포를 시작합니다
3. 배포 완료까지 약 2-3분 소요

## 환경 변수 변경

환경 변수를 변경하려면:

1. Render.com 대시보드 → Static Site 선택
2. "Environment" 탭 클릭
3. 환경 변수 수정 또는 추가
4. "Save Changes" 클릭
5. 자동으로 재배포 시작

## 참고사항

- **무료 플랜**: Static Site는 무료로 제공됩니다
- **빌드 시간**: 보통 2-5분 소요
- **캐시**: 환경 변수 변경 시 자동으로 재빌드됩니다
- **도메인**: Render.com에서 제공하는 무료 도메인 사용 가능


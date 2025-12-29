import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 65173, // 프런트엔드 개발 서버 포트
    host: true, // 외부 접근 허용 (선택사항)
  },
})


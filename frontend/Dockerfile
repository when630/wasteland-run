# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# 패키지 매니저 파일 복사 (package.json 및 package-lock.json 등)
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사 및 빌드
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Nginx 커스텀 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 1단계에서 빌드된 정적 파일들을 Nginx의 HTML 폴더로 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Railway가 $PORT 환경변수를 주입하므로 envsubst로 nginx.conf에 치환
EXPOSE 80

CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp && mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]

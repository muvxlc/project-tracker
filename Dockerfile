# ==========================================
# Stage 1: Build Stage (เตรียมและ Build โค้ด)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# [แก้ไข] ติดตั้ง dependencies ทั้งหมด (รวม devDeps) เพื่อใช้ในการ Build
RUN npm ci

# Copy source code ทั้งหมดเข้าไปเพื่อทำการ Build
COPY . .

# สั่ง Build โครงสร้างจำลองของ Nuxt (ผลลัพธ์จะได้โฟลเดอร์ .output)
RUN npm run build

# ==========================================
# Stage 2: Production Stage (รันแอปจริง)
# ==========================================
FROM node:22-alpine

# Install dumb-init
RUN apk add --no-cache dumb-init

WORKDIR /app

# [แก้ไข] คัดลอกโฟลเดอร์ .output ทั้งยวงมาจาก builder stage
# โฟลเดอร์ .output จะมี node_modules ภายในตัวที่ย่อส่วนมาให้แล้วสำหรับรันเซิร์ฟเวอร์
COPY --from=builder /app/.output ./.output

# คัดลอก package.json มาเผื่อไว้ (สำหรับจัดการ metadata หรือ script เสริมในอนาคตถ้ามี)
COPY --from=builder /app/package*.json ./

# Create non-root user และกำหนดสิทธิ์โฟลเดอร์ /app
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check (ยิงไปที่ภายในของโครงสร้าง .output)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start app ด้วยการชี้เข้าไปที่โฟลเดอร์ .output/server/index.mjs
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", ".output/server/index.mjs"]

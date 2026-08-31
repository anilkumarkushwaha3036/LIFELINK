# Multi-Stage Production Dockerfile
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

ENV NODE_ENV=development

# Copy frontend package definitions
COPY frontend/package*.json ./

# Install all frontend build dependencies
RUN npm install

# Copy frontend source code
COPY frontend/ ./

# Compile React Vite frontend into /app/frontend/dist static bundle
RUN npm run build


# ---- Stage 2: Backend & Production Unified Runtime ----
FROM node:20-alpine

WORKDIR /app/backend

# Copy backend package definitions
COPY backend/package*.json ./

# Clean install all production dependencies in Node 20 environment
RUN npm install --omit=dev

# Copy backend application source code and environment config
COPY backend/ ./

# Copy compiled frontend assets from Stage 1 into the location expected by Express server
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Ensure the uploads directory exists for donor document verification
RUN mkdir -p /app/backend/uploads

# Build-time verification: Asserts Express and core libraries resolve properly
RUN node -e "require('express'); require('mongoose'); require('socket.io'); require('dotenv'); console.log('✅ Backend modules verified successfully!');"

# Production environment defaults
ENV PORT=5000 \
    NODE_ENV=production \
    CLIENT_URL=http://localhost:5000

# Expose server port
EXPOSE 5000

# Start the unified full-stack application
CMD ["node", "server.js"]

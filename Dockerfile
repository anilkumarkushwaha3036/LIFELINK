# ---- Stage 1: Frontend Build ----
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files first (layer caching optimization)
COPY frontend/package*.json ./

# Install all frontend dependencies (including dev deps needed for Vite build)
RUN npm install

# Copy all frontend source files
COPY frontend/ ./

# Build the Vite application for production
# VITE_API_URL is not needed — the frontend is served from the same Express origin
RUN npm run build


# ---- Stage 2: Backend & Production Environment ----
FROM node:18-alpine

# Set working directory
WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install ONLY production dependencies (keeps image lean)
RUN npm install --omit=dev

# Copy all backend source files (including new middleware/errorMiddleware.js)
COPY backend/ ./

# Copy the compiled frontend bundle from Stage 1 into the
# location expected by server.js: path.join(__dirname, '../frontend/dist')
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create uploads directory (for donor verification documents)
RUN mkdir -p /app/backend/uploads

# Expose the application port
EXPOSE 5000

# Set NODE_ENV so server.js serves the frontend static bundle
ENV NODE_ENV=production

# Start the unified Express server
CMD ["node", "server.js"]

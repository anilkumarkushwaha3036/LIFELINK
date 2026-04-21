# ---- Stage 1: Frontend Build ----
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package.json
COPY frontend/package*.json ./

# Install dependencies
RUN npm install

# Copy all frontend files
COPY frontend/ ./

# Build the Vite application for production
RUN npm run build


# ---- Stage 2: Backend & Production Environment ----
FROM node:18-alpine

WORKDIR /app/backend

# Copy backend package.json
COPY backend/package*.json ./

# Install only production dependencies for a lighter image
RUN npm install --production

# Copy all backend files
COPY backend/ ./

# Copy the compiled frontend files from Stage 1 into the location expected by server.js
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose the backend port
EXPOSE 5000

# Set environment to production so server.js knows to serve frontend files
ENV NODE_ENV=production

# Start the combined server
CMD ["npm", "start"]

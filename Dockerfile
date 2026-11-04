# ========================================================
# REDDY AI STUDIO - Production Dockerfile for Render.com
# Includes Node.js 20, Python 3, FFmpeg 6/7+, and TrueType Fonts
# ========================================================

FROM node:20-bookworm-slim

# Install system dependencies: FFmpeg, Python, pip, and multilingual fonts
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    python3 \
    python3-pip \
    fonts-dejavu-core \
    fonts-freefont-ttf \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root and backend packages
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install root, backend and frontend dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy entire application code
COPY . .

# Build frontend production bundle (Vite)
RUN cd frontend && npm run build

# Create uploads and exports directories
RUN mkdir -p backend/uploads backend/exports backend/data

# Expose Render PORT
ENV PORT=10000
ENV NODE_ENV=production
EXPOSE 10000

# Start unified server
CMD ["node", "backend/src/server.js"]

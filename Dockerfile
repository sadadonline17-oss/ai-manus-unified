# AI Manus Unified - Multi-stage Dockerfile
# ==========================================
# Production-ready container for the AI Manus Unified platform.

# =============================================================================
# Stage 1: Python Backend Builder
# =============================================================================
FROM python:3.11-slim as backend-builder

WORKDIR /app/backend

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# =============================================================================
# Stage 2: Frontend Builder
# =============================================================================
FROM node:20-alpine as frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# =============================================================================
# Stage 3: Production Runtime
# =============================================================================
FROM python:3.11-slim as runtime

# Labels
LABEL maintainer="AI Manus Unified Team"
LABEL version="1.0.0"
LABEL description="AI Manus Unified - Visual Workflow Automation Platform"

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright for browser automation
RUN pip install playwright && playwright install chromium

# Copy Python packages from builder
COPY --from=backend-builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copy backend source
COPY backend/ ./backend/

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy configuration files
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create necessary directories
RUN mkdir -p /app/logs /app/data /app/sandbox

# Environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONPATH=/app/backend
ENV LOG_LEVEL=INFO

# Expose ports
EXPOSE 8000 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
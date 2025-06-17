# Firecrawl Service - Combined Stack
FROM node:22-alpine

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    git \
    curl \
    bash \
    redis \
    docker \
    docker-compose

# Set working directory
WORKDIR /app

# Copy Firecrawl repository
COPY firecrawl-repo/ ./firecrawl/

# Copy service wrapper
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/
COPY scripts/ ./scripts/

# Install wrapper dependencies
RUN npm ci --only=production

# Install Firecrawl dependencies
WORKDIR /app/firecrawl
RUN npm ci --only=production

# Build Firecrawl
RUN npm run build || echo "No build script found"

# Return to app directory
WORKDIR /app

# Build service wrapper
RUN npm run build || echo "No build script found"

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S firecrawl -u 1001 -G nodejs

# Change ownership
RUN chown -R firecrawl:nodejs /app
USER firecrawl

# Expose ports
EXPOSE 3002 6379

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3002/health || exit 1

# Start the service
CMD ["npm", "start"]
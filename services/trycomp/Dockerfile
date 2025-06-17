# TryComp.ai Service - AI Code Comparison
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/

# Build TypeScript
RUN npm run build || echo "No build script found"

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S trycomp -u 1001 -G nodejs

# Change ownership
RUN chown -R trycomp:nodejs /app
USER trycomp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the service
CMD ["npm", "start"]
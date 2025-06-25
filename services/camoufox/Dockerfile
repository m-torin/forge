# Camoufox Service - Stealth Browser Automation
FROM mcr.microsoft.com/playwright:v1.53.1-jammy

# Install Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs

# Install Rust for optimization features
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install additional dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Install browsers
RUN npx playwright install chromium firefox webkit
RUN npx playwright install-deps

# Copy source code
COPY src/ ./src/
COPY scripts/ ./scripts/

# Build TypeScript
RUN npm run build || echo "No build script found"

# Create non-root user for security
RUN groupadd -r camoufox && useradd -r -g camoufox -G audio,video camoufox
RUN mkdir -p /home/camoufox/Downloads /app && \
    chown -R camoufox:camoufox /home/camoufox /app

# Switch to non-root user
USER camoufox

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start the service
CMD ["npm", "start"]
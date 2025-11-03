# Backend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
# Install production dependencies without running arbitrary lifecycle scripts
RUN npm ci --omit=dev --ignore-scripts

# Copy application files
# Copy only necessary application files
COPY Controller ./Controller
COPY Middleware ./Middleware
COPY Models ./Models
COPY Services ./Services
COPY Routes ./Routes
COPY server.js ./server.js
COPY package.json ./package.json
COPY package-lock.json ./package-lock.json

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('node:http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
# Use non-root user provided by the base image for better security
USER node

CMD ["node", "server.js"]

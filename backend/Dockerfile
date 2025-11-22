# BodhyaAI Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:5000/api/auth/me', (r) => {if (r.statusCode !== 401 && r.statusCode !== 200) process.exit(1)})"

# Start application
CMD ["npm", "start"]

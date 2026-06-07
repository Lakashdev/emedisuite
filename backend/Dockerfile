FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Generate Prisma client for linux
RUN npx prisma generate

# Create uploads dir
RUN mkdir -p uploads

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]

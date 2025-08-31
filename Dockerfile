# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install deps (include devDeps for build)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage with nginx
FROM nginx:alpine AS runner
WORKDIR /usr/share/nginx/html

# Remove default nginx assets
RUN rm -rf ./*

# Copy built assets
COPY --from=builder /app/dist .

# Copy nginx config if needed
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files from client directory
COPY client/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code from client directory
COPY client/ .

# Build argument for API URL with default value
ARG VITE_API_URL=https://innocore-system-inno-api.jixesu.easypanel.host
ENV VITE_API_URL=$VITE_API_URL

# Clean cache and build the application
RUN rm -rf node_modules/.vite && npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config from client directory
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

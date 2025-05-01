# Build Stage
FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm i @carbon/react
RUN npm install
COPY . .
RUN npm run build

# Production Stage
#FROM docker.io/nginx:alpine
#FROM registry.access.redhat.com/ubi9/nginx-122
FROM nginx:1.25-alpine


# Create writable temp directories
RUN mkdir -p /tmp/nginx/client_temp /tmp/nginx/proxy_temp /tmp/nginx/fastcgi_temp /tmp/nginx/uwsgi_temp /tmp/nginx/scgi_temp \
    && chown -R nginx:nginx /tmp/nginx

# Copy the custom nginx.conf
COPY nginx.conf /etc/nginx/nginx.conf

# Use a non-root user explicitly (OpenShift random UID will be assigned)
USER 1001

# Expose the default NGINX port
EXPOSE 8080

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]

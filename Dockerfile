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
FROM registry.access.redhat.com/ubi9/nginx-122
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

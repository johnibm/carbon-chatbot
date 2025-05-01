# Build Stage
FROM node:20 AS builder

WORKDIR /app
COPY package*.json ./
RUN npm i @carbon/react
RUN npm install carbon-components
RUN npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

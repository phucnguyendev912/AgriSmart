# Stage 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["/bin/sh", "-c", "find /usr/share/nginx/html -type f -name '*.js' -exec sed -i \"s|__PLACEHOLDER_VITE_API_URL__|$VITE_API_URL|g\" {} + && nginx -g 'daemon off;'"]

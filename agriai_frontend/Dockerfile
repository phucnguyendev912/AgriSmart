# Stage 1: Build the React application
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

ARG REACT_APP_GOOGLE_CLIENT_ID
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

COPY . .

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["/bin/sh", "-c", "find /usr/share/nginx/html -type f -name '*.js' -exec sed -i \"s|__PLACEHOLDER_GOOGLE_CLIENT_ID__|$REACT_APP_GOOGLE_CLIENT_ID|g\" {} + && nginx -g 'daemon off;'"]

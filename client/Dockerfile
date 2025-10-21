FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build   

# Runtime stage (nginx)
FROM nginx:1.27-alpine
# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html
# Copy our nginx config 
COPY client/app.conf /etc/nginx/conf.d/default.conf
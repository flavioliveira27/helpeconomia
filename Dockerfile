# Stage 1: Base (Dependências)
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Development (Ambiente Local)
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Stage 3: Build (Compilação para Produção)
FROM base AS build
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 4: Production (Nginx)
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

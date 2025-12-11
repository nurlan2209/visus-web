FROM node:22 AS build
WORKDIR /app

ARG VITE_API_URL
ARG VITE_MEDIA_URL
ARG VITE_GOOGLE_SCRIPT_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_MEDIA_URL=${VITE_MEDIA_URL}
ENV VITE_GOOGLE_SCRIPT_URL=${VITE_GOOGLE_SCRIPT_URL}

COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./
COPY index.html ./
COPY src ./src
COPY public ./public

RUN npm ci
RUN npm run build


FROM nginx:1.27 AS runner
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

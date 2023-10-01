FROM node:lts as build
WORKDIR /usr/src/app
RUN sh -c '[ -z "$http_proxy" ] || ( npm config set proxy $http_proxy; npm config set https-proxy $http_proxy )'
COPY package.json package-lock.json ./
RUN npm install
COPY ./vite.config.ts ./vite.demo.config.ts ./extensions.json ./tsconfig.json ./tsconfig.node.json ./
COPY ./packages ./packages
RUN npm run build
RUN npm run build:demo

FROM nginx:stable-alpine
ARG TARGET_PROJECT="lens-demo"
ENV NGINX_PORT=80 NGINX_DEPLOYMENT_CONTEXT=/
COPY nginx.conf /etc/nginx/templates/demo.nginx.conf.template
COPY --from=build /usr/src/app/dist/demo /usr/share/nginx/html

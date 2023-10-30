FROM node:lts as build
ARG TARGET_ENVIRONMENT="staging"
WORKDIR /usr/src/app
RUN sh -c '[ -z "$http_proxy" ] || ( npm config set proxy $http_proxy; npm config set https-proxy $http_proxy )'
COPY package.json package-lock.json ./
RUN npm install
COPY ./vite.config.ts ./vite.demo.config.ts ./extensions.json ./tsconfig.json ./tsconfig.node.json ./
COPY ./packages ./packages
RUN VITE_TARGET_ENVIRONMENT=${TARGET_ENVIRONMENT} npm run build
RUN VITE_TARGET_ENVIRONMENT=${TARGET_ENVIRONMENT} npm run build:demo

FROM nginx:stable-alpine
COPY --from=build /usr/src/app/dist/demo /usr/share/nginx/html

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
COPY --from=build /usr/src/app/dist/demo /usr/share/nginx/html

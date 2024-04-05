FROM node:18.19.0 AS build-step
ARG API_URL
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV REACT_APP_API_URL=${API_URL}
RUN echo ${API_URL}
RUN npm run build

FROM nginx:1.18-alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build-step /build/dist /react-app/build

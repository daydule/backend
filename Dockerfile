FROM node:14.21.0-slim

WORKDIR /usr/src/app/
COPY ./ /usr/src/app/

RUN npm ci

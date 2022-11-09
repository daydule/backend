FROM node:14.21.0-slim

WORKDIR /usr/arc/app/
COPY ./ /usr/arc/app/

RUN npm ci

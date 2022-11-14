FROM node:14.21.0-slim

WORKDIR /daydule/

COPY ./package*.json ./
RUN npm ci

COPY ./wait-for-db-container.sh ./

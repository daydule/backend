FROM node:14.21.0-slim

WORKDIR /daydule/
COPY ./package*.json ./
COPY ./wait-for-db-container.sh ./

RUN npm ci

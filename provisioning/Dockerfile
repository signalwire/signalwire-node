FROM node:11-alpine

WORKDIR /app

COPY . .

RUN npm cache clean --force && npm install

EXPOSE 9000

CMD npm run start:dev

FROM node:11-alpine

WORKDIR /home/node/app

COPY . .

RUN npm install

COPY provisioning/index.html ./dist/es5/

EXPOSE 9000

CMD npm run start:dev

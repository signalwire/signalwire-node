FROM node:11-alpine

WORKDIR /home/node/app

COPY . .

RUN npm install

RUN mkdir -p dist/es5
RUN ln -sf ../../provisioning/index.html dist/es5/index.html

EXPOSE 9000

CMD npm run start:dev

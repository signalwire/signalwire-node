FROM node:11-alpine
WORKDIR /home/node/app

COPY ./package* ./
RUN npm install

COPY . .

RUN npm run clean-build
CMD npm run test:web && \
  npm run test:node

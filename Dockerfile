FROM node:11-alpine
WORKDIR /home/node/app

COPY ./package* ./
RUN npm install && \
    npm cache clean --force
    
COPY . .

RUN npm run build-ts
CMD npm test


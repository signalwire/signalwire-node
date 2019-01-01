FROM node:11-alpine
WORKDIR /home/node/app
# Install deps
COPY ./package* ./
RUN npm install && \
    npm cache clean --force && \
    npm run build-ts
COPY . .
# Start the app
CMD npm test


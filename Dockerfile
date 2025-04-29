FROM node:18-alpine

RUN apk add --no-cache \
    ffmpeg \
    imagemagick \
    webp \
    bash

WORKDIR /usr/src/app

COPY package.json ./

RUN npm install --production

COPY . .

RUN mkdir -p ./sessions ./temp

ENV PORT=8000
EXPOSE ${PORT}

CMD ["npm", "start"]

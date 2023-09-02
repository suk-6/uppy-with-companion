FROM node:18.17

LABEL maintainer="https://suk.kr"

WORKDIR /usr/src/app

COPY . .

RUN corepack yarn install && corepack yarn cache clean

CMD ["corepack", "yarn", "start"]
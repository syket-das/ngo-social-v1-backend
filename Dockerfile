FROM node:lts-alpine

WORKDIR /etc/app

COPY package.json .
COPY yarn.lock .

COPY prisma ./prisma

RUN yarn install --frozen-lockfile


COPY . .


CMD ["yarn", "start"]



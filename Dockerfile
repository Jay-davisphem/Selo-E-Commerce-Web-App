# syntax=docker/dockerfile:1

FROM node:lts-alpine3.17

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production
RUN npm install -g nodemon

COPY . .

CMD ["npm", "start"]

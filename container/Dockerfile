FROM node:alpine

ADD asc.tar.gz /asc

WORKDIR /asc

RUN npm install --production

ENV NODE_ENV="production" MONGODB_HOST="mongodb" MONGODB_NAME="ASC"

EXPOSE 3033


ENTRYPOINT ["node"]
CMD ["server/index.js"]

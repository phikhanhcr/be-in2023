FROM node:18-alpine3.17 AS builder

WORKDIR /app

RUN apk --no-cache add \
    g++ make python3 git \
    && yarn global add node-gyp@9.4.0 \
    && rm -rf /var/cache/apk/*

ADD package.json yarn.lock /app/
RUN yarn --pure-lockfile
ADD . /app
RUN yarn build
RUN yarn --pure-lockfile --prod

FROM node:18-alpine3.17

EXPOSE 3001

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

WORKDIR /app

RUN apk --no-cache add curl && rm -rf /var/cache/apk/*

COPY --from=builder /app .
CMD ["npm", "run", "docker:start"]
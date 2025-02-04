FROM docker.io/library/node:22-alpine

WORKDIR /usr/app
COPY ./ ./

RUN npm ci
RUN npm run build

ENV PORT=8080

CMD ["node", ".output/server/index.mjs"]
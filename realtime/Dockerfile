FROM node:22-alpine

ARG SOURCE_COMMIT=dev
ENV NODE_ENV=production \
    BUILD_SHA=$SOURCE_COMMIT \
    PORT=8787 \
    DATABASE_PATH=/data/rooms.sqlite

WORKDIR /app
COPY realtime/package.json realtime/package-lock.json ./
RUN npm ci --omit=dev
COPY realtime/src ./src
RUN mkdir -p /data && chown node:node /data

USER node
EXPOSE 8787
CMD ["node", "src/server.js"]

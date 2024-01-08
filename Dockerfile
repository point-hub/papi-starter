FROM node:20
RUN npm install -g bun
USER node
WORKDIR /home/node/app

COPY --chown=node:node package.json bun.lockb ./
RUN bun install --frozen-lock
COPY --chown=node:node . .

ENV NODE_ENV=production
EXPOSE 3000 3001
CMD ["bun", "run", "start"]
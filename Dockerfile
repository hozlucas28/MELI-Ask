FROM dhi.io/node:24-alpine-dev

RUN apk add --no-cache curl

COPY . .

RUN corepack enable pnpm
RUN pnpm install --frozen-lockfile

ENTRYPOINT ["pnpm", "start"]

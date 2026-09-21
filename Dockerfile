FROM dhi.io/node:24-alpine-dev

RUN apk add --no-cache curl

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json

RUN corepack enable pnpm
RUN pnpm install --filter MELI-Ask --frozen-lockfile

COPY tsconfig.json ./
COPY src ./src

ENTRYPOINT ["pnpm", "start"]

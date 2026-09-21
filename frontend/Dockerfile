FROM dhi.io/node:24-alpine-dev

RUN apk add --no-cache curl

WORKDIR /app/frontend

COPY frontend/package.json frontend/pnpm-lock.yaml ./

RUN corepack enable pnpm
RUN pnpm install --frozen-lockfile

COPY frontend ./

EXPOSE 5173

ENTRYPOINT ["pnpm", "dev", "--host", "0.0.0.0"]

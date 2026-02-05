FROM node:20-slim AS build
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
COPY apps/docs/ apps/docs/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter './packages/**' run build
RUN pnpm --filter lit-ui-docs run build

FROM nginx:alpine
COPY apps/docs/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/apps/docs/dist /usr/share/nginx/html
EXPOSE 8080

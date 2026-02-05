FROM node:20-slim AS build
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/ packages/
COPY apps/landing/ apps/landing/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter './packages/**' run build
RUN pnpm --filter lit-ui-landing run build

FROM nginx:alpine
COPY apps/landing/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/apps/landing/dist /usr/share/nginx/html
EXPOSE 8080

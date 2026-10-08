FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@11.25.0
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN cp deploy/vite.server.config.ts vite.config.ts \
    && cp deploy/sqlite.ts db/index.ts \
    && pnpm exec tsc --noEmit --incremental false \
    && pnpm exec vinext build

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATABASE_PATH=/data/marathon.sqlite VINEXT_TRUST_PROXY=1
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
COPY --from=build /app/drizzle ./drizzle
COPY --from=build /app/package.json ./package.json
RUN mkdir /data && chown node:node /data
USER node
EXPOSE 3000
HEALTHCHECK --interval=5s --timeout=4s --start-period=20s --retries=12 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/results').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "node_modules/vinext/dist/cli.js", "start", "--hostname", "0.0.0.0", "--port", "3000"]

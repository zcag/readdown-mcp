FROM node:20-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY tsconfig.json ./
COPY src/ src/
RUN npx tsc

FROM node:20-slim
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/dist/ dist/
LABEL org.opencontainers.image.source="https://github.com/zcag/readdown-mcp"
LABEL org.opencontainers.image.description="MCP server for converting web pages to clean LLM-optimized Markdown"
LABEL io.modelcontextprotocol.server.name="io.github.zcag/readdown-mcp"
ENTRYPOINT ["node", "dist/index.js"]

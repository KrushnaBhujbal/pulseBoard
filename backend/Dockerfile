FROM node:18-alpine

WORKDIR /app

# Copy package files first (Docker layer caching — only re-installs if package.json changed)
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY src/ ./src/

EXPOSE 3001

CMD ["node", "src/index.js"]
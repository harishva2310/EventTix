FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies and clean npm cache
RUN npm ci --only=production && \
    npm cache clean --force

COPY . .

# Use non-root user for security
USER node

EXPOSE 8091

CMD ["npm", "start"]

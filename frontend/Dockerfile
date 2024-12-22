FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Use volume mount for source code instead of COPY
# This allows for hot-reloading
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
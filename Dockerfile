# Base Image
FROM node:20-alpine

# Working Directory
WORKDIR /app

# Copy Package Files
COPY package*.json ./

# Install Production Dependencies
RUN npm ci --only=production

# Copy Application Code
COPY . .

# Expose Port
EXPOSE 3000

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start Application
CMD ["node", "server.js"]


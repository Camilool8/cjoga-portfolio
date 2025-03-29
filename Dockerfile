# Build stage for the React frontend
FROM node:20-alpine AS frontend-build

# Set working directory for frontend build
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy frontend source code
COPY . .

# Build the React app
RUN npm run build

# Build stage for the final image with both frontend and backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy the built frontend from the first stage
COPY --from=frontend-build /app/dist ./dist

# Copy server files
COPY server ./server
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Set environment to production
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start the unified server
CMD ["node", "server/index.js"]
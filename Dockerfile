# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
# Copy frontend package files
COPY frontend/package*.json ./
RUN npm install
# Copy frontend source and build
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
# Copy backend package files
COPY backend/package*.json ./
RUN npm install
# Copy backend source and build
COPY backend/ ./
RUN npm run build

# Stage 3: Setup the production environment
FROM node:20-alpine
WORKDIR /app/backend

# Set environment to production
ENV NODE_ENV=production

# Copy backend package files and install only production dependencies
COPY --from=backend-builder /app/backend/package*.json ./
RUN npm install --omit=dev

# Copy backend compiled code
COPY --from=backend-builder /app/backend/dist ./dist

# Copy frontend build output to be served by the backend
COPY --from=frontend-builder /app/frontend/dist ./public

# Expose the default port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]

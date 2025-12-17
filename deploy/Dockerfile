# --- Stage 1: Build and run Node.js full-stack app ---
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy only package files first (for better cache)
COPY ./temp/package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the app
COPY ./temp ./

# Environment setup
ENV NODE_ENV=production

# Expose your app port
EXPOSE 3333

# Run your app (adjust if main file differs)
CMD ["node", "index.js"]
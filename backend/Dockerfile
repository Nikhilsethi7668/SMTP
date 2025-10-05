# -----------------------------
# Base image
# -----------------------------
FROM node:20-alpine

# -----------------------------
# Set working directory
# -----------------------------
WORKDIR /usr/src/app

# -----------------------------
# Copy package files & install dependencies
# -----------------------------
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production

# -----------------------------
# Copy backend source code
# -----------------------------
COPY . .

# -----------------------------
# Expose ports
# -----------------------------
# Express API
EXPOSE 5000
# Policy Engine TCP
EXPOSE 10030

# -----------------------------
# Set environment variables (can override with .env)
# -----------------------------
ENV NODE_ENV=production

# -----------------------------
# Start backend
# -----------------------------
CMD ["node", "src/index.js"]

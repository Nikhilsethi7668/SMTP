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

RUN npm ci

# -----------------------------
# Copy frontend source code
# -----------------------------
COPY . .

# -----------------------------
# Expose Vite dev server port
# -----------------------------
EXPOSE 5173

# -----------------------------
# Environment variables for dev
# -----------------------------
ENV NODE_ENV=development

# -----------------------------
# Start Vite dev server
# -----------------------------
CMD ["npm", "run", "dev", "--", "--host"]

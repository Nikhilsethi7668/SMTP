# -----------------------------
# Base image
# -----------------------------
FROM node:20-bullseye

# -----------------------------
# Set working directory
# -----------------------------
WORKDIR /usr/src/app

# -----------------------------
# Copy package files only
# -----------------------------
COPY package.json ./

# -----------------------------
# Install all dependencies fresh
# -----------------------------
RUN npm i

# -----------------------------
# Copy the rest of the frontend source code
# -----------------------------
COPY . .

# -----------------------------
# Expose Vite dev server port
# -----------------------------
EXPOSE 5173

# -----------------------------
# Set environment variables
# -----------------------------
ENV NODE_ENV=development

# -----------------------------
# Start Vite dev server
# -----------------------------
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

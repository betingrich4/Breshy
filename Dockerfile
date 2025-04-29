FROM node:18-alpine

# Install required system dependencies
RUN apk add --no-cache \
    ffmpeg \
    imagemagick \
    webp \
    bash \
    python3 \
    make \
    g++

# Create and set working directory
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install --production

# Copy all application files
COPY . .

# Create directory for sessions
RUN mkdir -p ./sessions ./temp

# Set environment variables
ENV PORT=8000

# Expose the application port
EXPOSE ${PORT}

# Start the application
CMD ["npm", "start"]

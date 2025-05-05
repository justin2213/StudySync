# Use Node.js 20 LTS as base image
FROM node:20

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose the port the app will run on
EXPOSE 3001

# Start the app
CMD ["npm", "start"]
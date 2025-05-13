FROM node:18-slim

WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy application code
COPY . .

# Expose the port the app runs on
EXPOSE 8080

# Set the command to start the application
CMD ["npm", "start"]

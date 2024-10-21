# Use Node.js official image as a base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Serve the built app using a simple HTTP server
RUN npm install -g serve
CMD ["npm", "run", "start"]

# Expose the port the app runs on
EXPOSE 5173

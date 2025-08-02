FROM node:20-alpine
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install && npm audit fix 

# Copy the source code to the container
COPY . . 

# Build the TypeScript application 
RUN npm run build

# Start the application in development mode
CMD ["npm", "run", "start"]

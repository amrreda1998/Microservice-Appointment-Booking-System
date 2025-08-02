# Dockerfile for Auth Service
FROM node:20-alpine
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Copy Prisma files first to leverage Docker cache
COPY prisma ./prisma/

# Install dependencies
RUN npm install && npm audit fix 

# Generate Prisma Client
RUN npx prisma generate

# Copy the source code to the container
COPY . . 

# Build the TypeScript application 
RUN npm run build


# Start the application in development mode
CMD ["npm", "run", "start"]

FROM node:22-alpine

# Install necessary development packages
RUN apk add --no-cache python3 make g++ curl

WORKDIR /usr/src/app

# Copy only the necessary files to leverage Docker cache for faster builds
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app files (after installing dependencies)
COPY . .

# Build the app before starting
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
FROM node:22-alpine

# Install necessary development packages
RUN apk add --no-cache python3 make g++ curl

# Install Nest CLI globally
RUN npm install -g @nestjs/cli

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Build the app before starting
RUN npm run build

EXPOSE 3001

CMD ["npm", "run", "start:prod"]

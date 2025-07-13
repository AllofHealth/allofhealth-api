FROM node:22-alpine

# Install necessary development packages and IPFS dependencies
RUN apk add --no-cache python3 make g++ curl wget tar bash

# Install Nest CLI globally
RUN npm install -g @nestjs/cli

# Install IPFS
RUN wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz && \
    tar -xzf kubo_v0.24.0_linux-amd64.tar.gz && \
    cd kubo && \
    ./install.sh && \
    cd .. && \
    rm -rf kubo kubo_v0.24.0_linux-amd64.tar.gz

# Initialize IPFS (this will be done at runtime)
# RUN ipfs init

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Build the app before starting
RUN npm run build && ls -la dist

# Copy the IPFS startup script
COPY scripts/start-with-ipfs.sh ./
RUN chmod +x start-with-ipfs.sh

EXPOSE 3001

CMD ["./start-with-ipfs.sh"]

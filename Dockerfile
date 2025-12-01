# FROM node:22-alpine

# # Install necessary development packages and IPFS dependencies
# RUN apk add --no-cache python3 make g++ curl wget tar bash

# # Install Nest CLI globally
# RUN npm install -g @nestjs/cli

# # Install IPFS
# RUN wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz && \
#     tar -xzf kubo_v0.24.0_linux-amd64.tar.gz && \
#     cd kubo && \
#     ./install.sh && \
#     cd .. && \
#     rm -rf kubo kubo_v0.24.0_linux-amd64.tar.gz

# # Initialize IPFS (this will be done at runtime)
# # RUN ipfs init

# WORKDIR /usr/src/app

# COPY package*.json ./
# RUN npm install

# COPY .env .env

# COPY . .

# # Build the app before starting
# RUN npm run build && ls -la dist

# # Copy the IPFS startup script
# COPY scripts/start-with-ipfs.sh ./
# RUN chmod +x start-with-ipfs.sh

# EXPOSE 3000

# CMD ["./start-with-ipfs.sh"]
FROM node:22-slim


# Accept Sentry auth token as build argument
ARG SENTRY_AUTH_TOKEN

# Install necessary development packages and IPFS dependencies
RUN apt-get update && apt-get install -y \
    python3 make g++ curl wget tar bash ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install Nest CLI globally
RUN npm install -g @nestjs/cli

# Install IPFS (Kubo)
RUN wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz && \
    tar -xzf kubo_v0.24.0_linux-amd64.tar.gz && \
    cd kubo && \
    ./install.sh && \
    cd .. && \
    rm -rf kubo kubo_v0.24.0_linux-amd64.tar.gz

RUN npm install -g pm2

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY .env .env
COPY . .


# Set Sentry auth token environment variable for build
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

# Build the app
RUN npm run build

# Copy and allow execution of the IPFS startup script
COPY scripts/start-with-ipfs.sh ./start-with-ipfs.sh
RUN chmod +x start-with-ipfs.sh

EXPOSE 3000
EXPOSE 8080
EXPOSE 5001

VOLUME /root/.ipfs

ENTRYPOINT ["./start-with-ipfs.sh"]
# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

AllOfHealth API is a comprehensive blockchain-powered digital health platform built on NestJS that integrates with the Lisk blockchain and IPFS for decentralized storage. The API manages medical records, user authentication, and a gamified reward system with smart contracts.

## Architecture Overview

### Core Technologies
- **Backend Framework**: NestJS (Node.js) with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Blockchain**: Lisk blockchain for smart contracts and token rewards
- **Storage**: IPFS (Kubo) for decentralized medical record storage
- **Caching**: Redis for caching and Bull queues
- **Encryption**: AES-256-CBC for medical record encryption
- **Authentication**: JWT with role-based access control

### Module Structure
The codebase follows a modular architecture with these key modules:

- **Authentication & Authorization**: Multi-role system (Patient, Doctor, Hospital, Pharmacy, Admin)
- **Medical Records Management**: IPFS-based storage with blockchain-secured access control
- **Approval System**: Patient-controlled data sharing with healthcare providers
- **Health Journal**: Personal health tracking and journaling
- **Reward System**: Gamified token rewards for daily health activities
- **Admin Management**: Super admin and system admin roles with permission management
- **Contract Integration**: Lisk blockchain smart contract interactions
- **IPFS Integration**: Decentralized storage with automatic daemon management

### Database Configuration
- **ORM**: Drizzle ORM with PostgreSQL
- **Config Location**: `drizzle.config.ts` (as per user rules)
- **Database Name**: `knowdb` (Neon database as per user rules)
- **Migration**: Run `npm run migrate` or `node migrate.js`

## Common Development Commands

### Project Setup
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Create uploads directory
mkdir uploads

# Run database migrations
npm run migrate

# Generate database schema
npm run generate
```

### Development Mode
```bash
# Start with IPFS integration (recommended)
./scripts/start-with-ipfs.sh

# Development with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

### Database Operations
```bash
# Generate Drizzle migrations
npm run generate

# Run migrations
npm run migrate

# Alternative migration command
node migrate.js

# Start Drizzle Studio (database GUI)
npm run studio
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e

# Debug tests
npm run test:debug
```

### Code Quality
```bash
# Lint and fix code
npm run lint

# Format code with Prettier
npm run format

# Build the project
npm run build
```

### IPFS Operations
```bash
# Test IPFS functionality
curl -X POST http://localhost:5001/api/v0/version

# Access IPFS WebUI (when running)
# http://localhost:5001/webui

# Access IPFS Gateway (when running)  
# http://localhost:8080
```

### Docker Operations
```bash
# Build Docker image
docker build -t allofhealth-api .

# Run with all services (API + IPFS)
docker run -p 3001:3001 -p 5001:5001 -p 8080:8080 allofhealth-api
```

## Development Workflow

### Key File Locations
- **Main Application**: `src/main.ts`
- **App Module**: `src/app.module.ts` 
- **Database Schema**: `src/schemas/schema.ts`
- **Drizzle Config**: `drizzle.config.ts`
- **Migrations**: `drizzle/migrations/`
- **Modules**: `src/modules/` (auth, admin, records, etc.)
- **Shared Services**: `src/shared/` (drizzle, queues, utils)

### Architecture Patterns
- **Modular Design**: Each feature is a self-contained module
- **Dependency Injection**: NestJS DI container for service management
- **Queue System**: Bull queues for async token minting and rewards
- **Event-Driven**: Event emitters for task completion tracking
- **Database First**: Drizzle ORM with schema-first approach
- **Microservice Ready**: Modular structure supports future microservice extraction

### Environment Configuration
Key environment variables required:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret
- `IPFS_HOST`, `IPFS_PORT`, `IPFS_PROTOCOL`: IPFS configuration
- `RECORD_ENCRYPTION_KEY`: AES-256-CBC encryption key for medical records
- `DAILY_TARGET`: Number of tasks required for daily reward (default: 5)
- `REWARD_AMOUNT`: Token amount per daily completion (default: 0.01)

### Security Considerations
- All medical records are encrypted with AES-256-CBC before IPFS storage
- Patient data access requires blockchain-based approval system
- Role-based access control with JWT authentication
- Smart contract integration for transparent reward distribution
- Comprehensive audit trails for compliance requirements

### Testing Strategy
- Unit tests for individual services and utilities
- Integration tests for module interactions
- E2E tests for complete API workflows
- Database tests with Drizzle ORM
- IPFS integration tests for storage functionality

## API Documentation

- **Swagger UI**: Available at `http://localhost:3001/api` when running
- **Base URL**: `http://localhost:3001/api` (note the `/api` prefix)
- **Authentication**: JWT tokens in Authorization header

## Useful Debugging

### Queue Monitoring
The application uses Bull queues for async operations. Monitor queue status through Redis or implement a queue dashboard for production.

### IPFS Debugging
- Check IPFS logs: `cat /tmp/ipfs.log`
- Verify IPFS daemon: `curl -X POST http://localhost:5001/api/v0/version`
- Access WebUI for file inspection: `http://localhost:5001/webui`

### Database Debugging
- Use Drizzle Studio: `npm run studio`
- Check connection with direct PostgreSQL client
- Review migration status in database

# AllOf Health - Blockchain-Powered Digital Health Platform

<p align="center">
  <img src="https://via.placeholder.com/300x120/4A90E2/FFFFFF?text=AllOf+Health" alt="AllOf Health Logo" />
</p>

<p align="center">
  <strong>A comprehensive blockchain-powered digital health platform built on the Lisk blockchain that revolutionizes medical record management, prescription handling, and healthcare collaboration with IPFS-powered decentralized storage.</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## 🚀 Vision

To create a unified, patient-controlled digital health ecosystem that eliminates data silos, empowers healthcare stakeholders, and improves patient outcomes through secure, transparent, and accessible medical record management with decentralized storage.

## ✨ Key Value Propositions

- **🔐 Simplified Web3 Onboarding**: Streamlined user registration process that abstracts blockchain complexity
- **👥 Multi-Role Access Control**: Tailored interfaces for patients, doctors, hospitals, pharmacies, and administrators
- **🔗 Blockchain Security**: Immutable record storage with smart contract-based access permissions on Lisk blockchain
- **🌐 Decentralized Storage**: IPFS integration for secure, distributed medical data storage
- **🏥 Integrated Healthcare Ecosystem**: Complete platform combining medical records, telemedicine, and pharmacy coordination

## 🎯 Target Users

### Primary Personas
- **👤 Patients**: Complete medical history access and data sharing control
- **👨‍⚕️ Doctors**: Comprehensive patient data and efficient prescription management
- **🏥 Hospital Administrators**: Streamlined operations and compliance management
- **💊 Pharmacists**: Secure prescription verification and inventory management
- **⚙️ System Administrators**: Platform security and user access management

## 📋 Features

### 🌟 Core Features (Implemented)

#### Authentication & User Management
- ✅ Multi-role registration system (Patient, Doctor, Hospital, Pharmacy, Admin)
- ✅ Document-based identity verification with file upload
- ✅ Role-based access control (RBAC)
- ✅ JWT token-based authentication
- ✅ Web3 wallet integration (Lisk blockchain)
- ✅ Account abstraction service for simplified Web3 onboarding
- ✅ User profile management and updates

#### Admin Management System
- ✅ Super admin creation and management
- ✅ System admin role management
- ✅ Permission management system
- ✅ Practitioner verification workflows
- ✅ Admin authentication and access control

#### Patient Portal
- ✅ Comprehensive approval management for data access
- ✅ Patient-controlled access permissions
- ✅ Healthcare provider directory access
- ✅ Personal health journaling system
- ✅ Medical record access control

#### Doctor Interface
- ✅ Patient record access with permission system
- ✅ Approval management system for patient data access
- ✅ Enhanced patient information display with full names
- ✅ Doctor profile and verification status
- ✅ Paginated doctor directory
- ✅ Collaborative approval workflows

#### Health Journaling System
- ✅ Personal health journal entries
- ✅ Journal entry management and retrieval
- ✅ Patient-owned health data tracking
- ✅ Secure journal storage

#### Medical Record Management
- ✅ Blockchain-based approval system for data access
- ✅ Patient-controlled access permissions
- ✅ Doctor approval workflows (create, fetch, accept, reject)
- ✅ Smart contract integration for secure access control
- ✅ Comprehensive audit trails for all access requests
- ✅ IPFS integration for decentralized storage

#### IPFS Integration
- ✅ Decentralized file storage system
- ✅ IPFS daemon management
- ✅ Custom IPFS client implementation
- ✅ Medical record storage on IPFS
- ✅ Automatic IPFS initialization and configuration

### 🔄 In Progress Features

- 🔄 Advanced patient portal features
- 🔄 Digital prescription writing tools
- 🔄 Telemedicine consultation platform
- 🔄 Enhanced security features and audit logging
- 🔄 Real-time notifications system
- 🔄 Medical records retrieval interface

### 🔮 Advanced Features (Planned)

- **🔑 One-Time Prescription Keys**: Unique secure keys for prescription access with automatic expiration
- **🤝 Real-Time Collaboration**: Live communication tools for healthcare teams
- **📊 Health Analytics**: AI-powered health insights and recommendations
- **🌐 Interoperability**: HL7 FHIR compliance for seamless data exchange
- **📱 Mobile Applications**: React Native apps for iOS and Android

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL (primary), Redis (caching)
- **Blockchain**: Lisk SDK for custom blockchain functionality
- **Storage**: IPFS (InterPlanetary File System) for decentralized storage
- **Authentication**: JWT, 2FA support
- **File Storage**: Local disk storage (development), IPFS (production)
- **API**: RESTful APIs with comprehensive OpenAPI documentation

### Decentralized Storage
- **IPFS**: Kubo implementation for distributed file storage
- **Protocol**: HTTP API for IPFS interactions
- **Features**: Automatic daemon management, content addressing, distributed storage

### Frontend (Planned)
- **Web**: React.js with TypeScript
- **Mobile**: React Native
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI / Chakra UI

### DevOps & Infrastructure
- **Containerization**: Docker with IPFS integration
- **CI/CD**: GitHub Actions
- **Cloud**: AWS/GCP (planned)
- **Monitoring**: Prometheus + Grafana (planned)
- **Security**: SSL/TLS, rate limiting, DDoS protection

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL
- Redis (optional, for caching)
- **IPFS (Kubo)** - for decentralized storage

### IPFS (Kubo) Installation

#### Option 1: Use Included Kubo Binary (Recommended)
The project includes a pre-compiled Kubo binary in the `kubo/` directory:

```bash
# Navigate to the kubo directory
cd kubo

# Install IPFS globally (requires sudo)
sudo ./install.sh

# Or manually move to PATH
sudo mv ipfs /usr/local/bin/ipfs
```

#### Option 2: Download Latest Kubo
```bash
# Download latest Kubo release
wget https://dist.ipfs.tech/kubo/v0.24.0/kubo_v0.24.0_linux-amd64.tar.gz

# Extract and install
tar -xzf kubo_v0.24.0_linux-amd64.tar.gz
cd kubo
sudo ./install.sh

# Verify installation
ipfs version
```

#### Option 3: Using Package Managers
```bash
# macOS with Homebrew
brew install ipfs

# Ubuntu/Debian
sudo apt update
sudo apt install kubo

# Arch Linux
sudo pacman -S kubo
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/allofhealth-api.git
   cd allofhealth-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   # Database URLs, JWT secrets, IPFS configuration, etc.
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run migrate
   
   # Generate database schema (if needed)
   npm run generate
   ```

5. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

### Running the Application

#### Development Mode (with IPFS)
```bash
# Start with IPFS integration (recommended)
./scripts/start-with-ipfs.sh
```

This script will:
- ✅ Initialize IPFS if not already done
- ✅ Configure IPFS for API access
- ✅ Start IPFS daemon
- ✅ Set up IPFS environment variables
- ✅ Start the NestJS application
- ✅ Provide access to IPFS WebUI and Gateway

#### Manual Development Mode
```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Watch mode
npm run start
```

#### Docker Deployment
```bash
# Build and run with Docker (includes IPFS)
docker build -t allofhealth-api .
docker run -p 3001:3001 -p 5001:5001 -p 8080:8080 allofhealth-api
```

### Access Points

- **API Server**: `http://localhost:3001`
- **API Documentation**: `http://localhost:3001/api`
- **IPFS WebUI**: `http://localhost:5001/webui`
- **IPFS Gateway**: `http://localhost:8080`

## 📚 API Endpoints

### Authentication
- `POST /auth/signUp` - User registration with document upload
- `POST /auth/signIn` - User authentication

### Admin Management
- `POST /admin/createSuperAdmin` - Create super administrator
- `POST /admin/createSystemAdmin` - Create system administrator
- `POST /admin/managePermissions` - Manage admin permissions
- `POST /admin/login` - Admin authentication
- `POST /admin/verifyPractitioner` - Verify healthcare practitioners
- `DELETE /admin/deleteAdmin` - Delete administrator accounts

### Approval Management
- `POST /approval/createApproval` - Create new approval request for patient data access
- `POST /approval/fetchDoctorApprovals` - Fetch all approval requests for a doctor
- `POST /approval/acceptApproval` - Accept a patient's approval request
- `POST /approval/rejectApproval` - Reject a patient's approval request
- `GET /approval/cleanup/manual` - Manually trigger cleanup of expired approvals

### User Management
- `POST /user/updateUser` - Update user profile with file upload support

### Doctor Management
- `GET /doctor/fetchDoctor` - Get doctor profile and verification status
- `GET /doctor/fetchAllDoctors` - Get all verified doctors (paginated)

### Health Journal
- `POST /health-journal/addJournalEntry` - Add personal health journal entry
- `GET /health-journal/fetchUserJournals` - Fetch user's health journal entries

### IPFS Integration
- `GET /ipfs/testIpfs` - Test IPFS functionality and upload

### Contract Management
- `GET /contract/system-admin-count` - Get system administrator count
- `GET /contract/patientCount` - Get total patient count
- `GET /contract/patientContractId` - Get patient contract ID by address

*Additional endpoints are available and documented in the Swagger UI.*

## 🏗 Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (Planned)     │◄──►│   (NestJS)     │◄──►│   (Lisk)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Database      │    │      IPFS       │
                       │   (PostgreSQL)  │    │   (Kubo Node)   │
                       └─────────────────┘    └─────────────────┘
```

### IPFS Integration
- **Decentralized Storage**: Medical records stored on IPFS network
- **Content Addressing**: Immutable content identification via CID
- **Gateway Access**: HTTP gateway for content retrieval
- **API Integration**: Custom IPFS client for seamless integration

### Security Features
- **🔐 Multi-layer Encryption**: AES-256 for sensitive data
- **🔑 Smart Contract Access Control**: Blockchain-based permission management
- **🛡️ Decentralized Storage**: IPFS for tamper-proof medical records
- **📋 Audit Trails**: Comprehensive logging for compliance

## 🔧 Development Status

### ✅ Completed
- [x] Project setup and basic NestJS configuration
- [x] Multi-role authentication system
- [x] File upload with validation (government ID, medical license)
- [x] Identity verification workflow
- [x] Role-based access control foundation
- [x] API documentation with Swagger
- [x] Blockchain integration with Lisk
- [x] Smart contract deployment for access control
- [x] Account abstraction service for Web3 onboarding
- [x] Comprehensive approval management system
- [x] Doctor verification and compliance checking
- [x] Patient data access control with blockchain security
- [x] Enhanced database schema with proper relationships
- [x] User management with profile features
- [x] Doctor directory with specialization filtering
- [x] **IPFS integration with Kubo**
- [x] **Decentralized storage system**
- [x] **Health journaling functionality**
- [x] **Admin management system**
- [x] **Contract interaction system**
- [x] **Docker integration with IPFS**
- [x] **Automated startup script**

### 🔄 In Progress
- [ ] Frontend web application development
- [ ] Advanced patient portal features
- [ ] Medical records storage and retrieval interface
- [ ] Telemedicine integration
- [ ] Enhanced security features and audit logging
- [ ] Prescription management system
- [ ] Real-time notifications system

### 📋 Planned
- [ ] One-time prescription keys with automatic expiration
- [ ] Advanced telemedicine platform with video calling
- [ ] Mobile applications (React Native)
- [ ] AI-powered health insights and recommendations
- [ ] HIPAA compliance certification
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Insurance integration
- [ ] Lab results integration
- [ ] Appointment scheduling system

## 📊 Success Metrics

### Technical KPIs
- **System Uptime**: Target 99.9%
- **API Response Time**: Target <200ms
- **IPFS Storage Reliability**: Target 99.9%
- **Registration Success Rate**: Target 85%
- **Security Incidents**: Target 0

### User Engagement
- **Monthly Active Users**: Target 10,000 in Year 1
- **Feature Adoption Rate**: Target 70% for core features
- **User Satisfaction**: Target 4.5/5

## 🔒 Security & Compliance

### Data Protection
- **HIPAA Compliance**: Healthcare data protection standards
- **GDPR Ready**: European data protection regulation compliance
- **Encryption**: End-to-end encryption for all sensitive data
- **Access Control**: Granular permission system
- **Decentralized Storage**: IPFS for tamper-proof data integrity

### Audit & Monitoring
- Comprehensive audit trails
- Real-time security monitoring
- IPFS content verification
- Regular security assessments
- Penetration testing (planned)

## 🐳 Docker Support

The application includes full Docker support with IPFS integration:

```dockerfile
# Build
docker build -t allofhealth-api .

# Run with all services
docker run -p 3001:3001 -p 5001:5001 -p 8080:8080 allofhealth-api
```

The Docker container automatically:
- Installs and configures IPFS (Kubo)
- Starts IPFS daemon
- Builds and starts the NestJS application
- Exposes all necessary ports

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features
- Test IPFS integration for storage features

## 🔧 Environment Variables

Key environment variables for IPFS integration:

```bash
# IPFS Configuration
IPFS_HOST=127.0.0.1
IPFS_PORT=5001
IPFS_PROTOCOL=http
IPFS_API_KEY=          # Optional for hosted IPFS
IPFS_API_SECRET=       # Optional for hosted IPFS

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=your-secret-key

# Other configurations...
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IPFS/Protocol Labs** for decentralized storage infrastructure
- **Lisk Foundation** for blockchain infrastructure
- **NestJS Team** for the excellent framework
- **Healthcare Community** for valuable feedback and requirements

## 📞 Support & Contact

- **Documentation**: [Link to docs] (Coming soon)
- **Issues**: [GitHub Issues](https://github.com/your-org/allofhealth-api/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/allofhealth-api/discussions)
- **Email**: support@allofhealth.com

---

<p align="center">
  <strong>AllOf Health - Transforming Healthcare Through Blockchain & Decentralized Storage</strong>
</p>

<p align="center">
  Built with ❤️ by the AllOf Health Team
</p>
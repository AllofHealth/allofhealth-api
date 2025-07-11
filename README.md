# AllOf Health - Blockchain-Powered Digital Health Platform

<p align="center">
  <img src="https://via.placeholder.com/300x120/4A90E2/FFFFFF?text=AllOf+Health" alt="AllOf Health Logo" />
</p>

<p align="center">
  <strong>A comprehensive blockchain-powered digital health platform built on the Lisk blockchain that revolutionizes medical record management, prescription handling, and healthcare collaboration.</strong>
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

To create a unified, patient-controlled digital health ecosystem that eliminates data silos, empowers healthcare stakeholders, and improves patient outcomes through secure, transparent, and accessible medical record management.

## ✨ Key Value Propositions

- **🔐 Simplified Web3 Onboarding**: Streamlined user registration process that abstracts blockchain complexity
- **👥 Multi-Role Access Control**: Tailored interfaces for patients, doctors, hospitals, pharmacies, and administrators
- **🔗 Blockchain Security**: Immutable record storage with smart contract-based access permissions on Lisk blockchain
- **🏥 Integrated Healthcare Ecosystem**: Complete platform combining medical records, telemedicine, and pharmacy coordination

## 🎯 Target Users

### Primary Personas
- **👤 Patients**: Complete medical history access and data sharing control
- **👨‍⚕️ Doctors**: Comprehensive patient data and efficient prescription management
- **🏥 Hospital Administrators**: Streamlined operations and compliance management
- **💊 Pharmacists**: Secure prescription verification and inventory management
- **⚙️ System Administrators**: Platform security and user access management

## 📋 Features

### 🌟 Core Features (In Development)

#### Authentication & User Management
- ✅ Multi-role registration system (Patient, Doctor, Hospital, Pharmacy, Admin)
- ✅ Document-based identity verification with file upload
- ✅ Role-based access control (RBAC)
- ✅ OAuth 2.0 and JWT token-based authentication
- ✅ Web3 wallet integration (Lisk blockchain)
- ✅ Account abstraction for simplified Web3 onboarding

#### Patient Portal
- 🔄 Comprehensive medical records management
- 🔄 Prescription tracking and history
- 🔄 Appointment scheduling and management
- 🔄 Healthcare provider directory
- 🔄 Personal health journaling
- 🔄 Care team management

#### Doctor Interface
- ✅ Patient record access with permission system
- ✅ Approval management system for patient data access
- ✅ Enhanced patient information display with full names
- 🔄 Digital prescription writing tools
- 🔄 Telemedicine consultation platform
- 🔄 Collaborative notes system
- 🔄 Treatment plan management

#### Pharmacy System
- 🔄 One-time prescription key validation
- 🔄 Real-time inventory tracking
- 🔄 Prescription queue management
- 🔄 Patient notification system

#### Medical Record Management
- ✅ Blockchain-based approval system for data access
- ✅ Patient-controlled access permissions
- ✅ Doctor approval workflows (create, fetch, accept, reject)
- ✅ Smart contract integration for secure access control
- ✅ Comprehensive audit trails for all access requests

### 🔮 Advanced Features (Planned)

- **🔑 One-Time Prescription Keys**: Unique secure keys for prescription access with automatic expiration
- **🤝 Real-Time Collaboration**: Live communication tools for healthcare teams
- **📊 Health Analytics**: AI-powered health insights and recommendations
- **🌐 Interoperability**: HL7 FHIR compliance for seamless data exchange
- **📱 Mobile Applications**: React Native apps for iOS and Android

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL (primary), MongoDB (medical records), Redis (caching)
- **Blockchain**: Lisk SDK for custom blockchain functionality
- **Authentication**: JWT, OAuth 2.0, 2FA (TOTP)
- **File Storage**: Local disk storage (development), planned IPFS integration
- **API**: RESTful APIs with comprehensive OpenAPI documentation

### Frontend (Planned)
- **Web**: React.js with TypeScript
- **Mobile**: React Native
- **State Management**: Redux Toolkit
- **UI Framework**: Material-UI / Chakra UI

### DevOps & Infrastructure
- **Containerization**: Docker
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
   # Database URLs, JWT secrets, ImageKit credentials, etc.
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run migration:run
   
   # Seed initial data (optional)
   npm run seed
   ```

5. **Create uploads directory**
   ```bash
   mkdir uploads
   ```

### Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Watch mode
npm run start
```

The API will be available at `http://localhost:3000`

### API Documentation

Access the interactive API documentation at:
- **Swagger UI**: `http://localhost:3000/api`
- **OpenAPI JSON**: `http://localhost:3000/api-json`

## 📚 API Endpoints

### Authentication
- `POST /auth/signUp` - User registration with document upload
- `POST /auth/signIn` - User authentication

### Asset Management
- `POST /assets/upload` - Identity document upload to ImageKit

### Approval Management
- `POST /approval/createApproval` - Create new approval request for patient data access
- `POST /approval/fetchDoctorApprovals` - Fetch all approval requests for a doctor (includes patient names)
- `POST /approval/acceptApproval` - Accept a patient's approval request
- `POST /approval/rejectApproval` - Reject a patient's approval request

### User Management
- `POST /user/createUser` - Create new user account
- `GET /user/profile` - Get user profile information
- `PUT /user/updateUser` - Update user profile

### Doctor Management
- `GET /doctor/profile` - Get doctor profile and verification status
- `GET /doctor/all` - Get all verified doctors (paginated)

*Additional endpoints are available and documented in the Swagger UI.*

## 🏗 Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Blockchain    │
│   (Planned)     │◄──►│   (NestJS)     │◄──►│   (Lisk)       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (PostgreSQL)  │
                       └─────────────────┘
```

### Security Features
- **🔐 Multi-layer Encryption**: AES-256 for sensitive data
- **🔑 Smart Contract Access Control**: Blockchain-based permission management
- **🛡️ Zero-Knowledge Proofs**: Privacy-preserving authentication
- **📋 Audit Trails**: Comprehensive logging for compliance

## 🔧 Development Status

### ✅ Completed
- [x] Project setup and basic NestJS configuration
- [x] Multi-role authentication system
- [x] File upload with validation (government ID, medical license)
- [x] Identity verification workflow
- [x] ImageKit integration for secure file storage
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

### 🔄 In Progress
- [ ] Frontend web application development
- [ ] Advanced patient portal features
- [ ] Medical records storage and retrieval
- [ ] Telemedicine integration
- [ ] Enhanced security features and audit logging
- [ ] Prescription management system
- [ ] Health journaling functionality
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

### Audit & Monitoring
- Comprehensive audit trails
- Real-time security monitoring
- Regular security assessments
- Penetration testing (planned)

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

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

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
  <strong>AllOf Health - Transforming Healthcare Through Blockchain Technology</strong>
</p>

<p align="center">
  Built with ❤️ by the AllOf Health Team
</p>
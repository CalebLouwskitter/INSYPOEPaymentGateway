# INSYPOEPaymentGateway

A secure payment gateway application with HTTPS support using mkcert for local development.

## 🔐 HTTPS/SSL Setup

This project uses mkcert for local HTTPS development. To set up:

```powershell
.\setup-ssl.ps1
```

See [SSL-SETUP.md](./SSL-SETUP.md) for detailed instructions.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB
- mkcert (installed automatically by setup script)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/CalebLouwskitter/INSYPOEPaymentGateway.git
   cd INSYPOEPaymentGateway
   ```

2. **Setup SSL certificates:**
   ```powershell
   .\setup-ssl.ps1
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install dependencies:**
   ```bash
   # Backend
   cd Backend
   npm install
   
   # Frontend
   cd ../Frontend
   npm install
   ```

5. **Start the application:**
   ```bash
   # Using Docker Compose
   docker-compose up -d
   
   # Or manually
   # Backend
   cd Backend
   npm start
   
   # Frontend (in another terminal)
   cd Frontend
   npm start
   ```

## 📁 Project Structure

```
INSYPOEPaymentGateway/
├── Backend/                 # Node.js/Express backend
│   ├── Controller/         # Business logic controllers
│   ├── Middleware/         # Authentication & security
│   ├── Models/            # Database models
│   ├── Routes/            # API routes
│   ├── Services/          # Business services
│   └── server.js          # Entry point (HTTPS enabled)
├── Frontend/              # React frontend
│   ├── public/
│   └── src/
├── certs/                 # SSL certificates (git-ignored)
│   ├── localhost+2.pem
│   └── localhost+2-key.pem
├── docker-compose.yml     # Docker orchestration
├── .env                   # Environment variables (git-ignored)
└── .env.example          # Environment template
```

## 🌐 Endpoints

- Backend: `https://localhost:5000`
- Frontend: `https://localhost:3000`
- Health Check: `https://localhost:5000/health`

## 🛠️ Development

### Backend Development
```bash
cd Backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd Frontend
npm start
```

### Run Tests
```bash
# Backend
cd Backend
npm test

# Frontend
cd Frontend
npm test
```

## 🔒 Security Features

- ✅ HTTPS with mkcert certificates
- ✅ JWT authentication
- ✅ Helmet.js security headers
- ✅ CORS configuration
- ✅ Express validator
- ✅ bcryptjs password hashing

## 📝 Environment Variables

Key environment variables (see `.env.example` for full list):

```env
USE_HTTPS=true
PORT=5000
MONGODB_URI=mongodb://localhost:27017/insy7314
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## 🐳 Docker

Run with Docker Compose:

```bash
docker-compose up -d
```

Services:
- MongoDB: `localhost:27017`
- Backend: `localhost:5000`
- Frontend: `localhost:3000`

## 📚 Documentation

- [SSL Setup Guide](./SSL-SETUP.md) - Detailed HTTPS setup instructions
- [API Documentation](#) - Coming soon
- [Deployment Guide](#) - Coming soon

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test:watch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 👥 Authors

- Caleb Louwskitter

---

**Note:** This project uses mkcert for local HTTPS development. Never use these certificates in production!
## INSY POE Payment Gateway

An end-to-end payment portal built for INSY7314 Task 2. The platform demonstrates secure customer onboarding, payment capture, employee payment processing, and comprehensive admin management across a React frontend and Node.js/Express backend backed by MongoDB. The system implements role-based access control with three distinct user types: customers (initiate payments), employees (process payments), and admins (manage employees and process payments).

### Quick Links
- Demo video: https://youtu.be/SuzQhvoI0qc

### Contributors
- Caleb Louwskitter : ST10275378
- Logan : ST10268888
- Kyle : ST10085208

---

## Solution Overview

- **Architecture**: React frontend (`Frontend/`), Express API (`Backend/`), shared middleware package, MongoDB Atlas/local instance, optional Nginx reverse proxy. Docker Compose orchestrates services for local development.
- **Primary Features**: 
  - **Customer Portal**: Customer registration and login, JWT-based session management, payment initiation and status tracking
  - **Employee Portal**: Secure employee authentication, view pending payments, approve/deny payments, payment history tracking
  - **Admin Portal**: Full employee management (create/view/delete), role-based access control (admin/employee), super admin privileges
  - **Security**: Role-based authentication, separate JWT tokens for customers and employees, rate limiting, input validation
- **Built With**: Node.js 18, Express 4, MongoDB & Mongoose, React 18, Docker, CircleCI.

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop (for containerised workflows)
- MongoDB instance (Atlas connection string or local `mongodb://localhost:27017`)
- `openssl` (only if you need to regenerate TLS assets)

### Environment Variables
Copy `.env.example` to `.env` in the repo root and fill in values:

```bash
cp .env.example .env
```

Key variables:
- `MONGODB_URI` – MongoDB connection string for app runtime.
- `JWT_SECRET` – Signing key for JWT tokens.
- `USE_HTTPS` – Set to `true` to serve the API with the bundled certificate in `certs/`.
- `FORCE_HTTPS` – Set to `true` (or run in production) to reject non-HTTPS requests even behind a proxy.
- `FRONTEND_URL` / `CORS_ORIGINS` – Comma-separated values the backend should trust for CORS.

### Run Locally (API only)
```bash
cd Backend
npm install
npm run dev
```
The API serves on `http://localhost:5000` (or `https://localhost:5000` when `USE_HTTPS=true` and certificates are present).

### Run Locally (Frontend)
```bash
cd Frontend
npm install
npm run dev
```
The React app is available on `http://localhost:5173` 

### Docker Compose (full stack)
```bash
docker compose up --build
```
This brings up `backend`, `frontend`, and `mongodb` services defined in `docker-compose.yml`. The compose file mounts the local certificate bundle so HTTPS works out of the box.

### Super Admin Setup

Before using the employee/admin portal, you must create a super admin account. This is a one-time setup:

1. **Option A: Auto-generated password**
   ```bash
   cd Backend
   node seedSuperAdmin.js
   ```
   This creates a super admin account with username `superadmin` and displays a randomly generated secure password. **Save this password immediately.**

2. **Option B: Custom password** (recommended)
   ```bash
   cd Backend
   set SUPERADMIN_PASSWORD=YourSecurePassword123!
   node seedSuperAdmin.js
   ```
   Replace `YourSecurePassword123!` with your desired password (minimum 8 characters).

3. **Important Notes:**
   - The script will not overwrite an existing super admin
   - Only the super admin can create other admin accounts
   - The super admin account (`createdBy: null`) cannot be deleted
   - Change the password after first login for security

4. **Access the portal:**
   - Navigate to `http://localhost:5173/employee-login`
   - Login with username: `superadmin` and your password
   - Create additional employee or admin accounts as needed

### Testing & Quality Gates
- Backend: `cd Backend && npm test`
- Frontend: `cd Frontend && CI=true npm test -- --watchAll=false`
- Coverage output stored under respective `coverage/` directories and published as CircleCI artifacts.

---

## User Workflows

### Customer Portal Flow
1. **Registration** (`/register`): Create account with full name, ID number, account number, and password
2. **Login** (`/login`): Authenticate with account number and password
3. **Dashboard** (`/dashboard`): View account overview and initiate payments
4. **Payment Portal** (`/payment-portal`): Submit new international payment with SWIFT details
5. **Payment History** (`/payment-history`): Track status of submitted payments (pending/approved/denied)

### Employee Portal Flow
1. **Login** (`/employee-login`): Authenticate with username and password
2. **Dashboard** (`/employee-dashboard`): View and manage pending payments
   - View all pending customer payments with details
   - Approve or deny payments with one click
   - View payment history with processing information
3. **Logout**: Secure logout invalidating JWT token

### Admin Portal Flow
1. **Login** (`/employee-login`): Authenticate as admin/super admin
2. **Admin Dashboard** (`/admin-dashboard`): Full system management
   - **Employee Management Tab**: 
     - View all employees with role, creator, and creation date
     - Create new employee or admin accounts
     - Delete employee accounts (only super admin can delete other admins)
   - **Payment Management Tab**:
     - Same functionality as employee dashboard
     - Approve/deny pending payments
     - View complete payment history
3. **Role Restrictions**:
   - Regular admins can create employee accounts
   - Only super admin can create other admin accounts
   - Super admin account cannot be deleted

### Frontend Components
- **React Router**: Client-side routing with protected routes (`Frontend/src/App.js`)
- **Context API**: Separate authentication contexts for customers (`AuthContext.jsx`) and employees (`EmployeeAuthContext.jsx`)
- **Protected Routes**: Route guards ensure proper authentication (`ProtectedRoute.jsx`, `EmployeeProtectedRoute.jsx`)
- **Axios Interceptors**: Automatic token injection and error handling (`Frontend/src/interfaces/`)
- **Responsive UI**: Modern, accessible interface with error handling and loading states

---

## Security Controls (Rubric Alignment)

### Password Security
- Passwords are never stored in plaintext. Both `userModel` (`Backend/Models/userModel.js`) and `employeeModel` (`Backend/Models/employeeModel.js`) hash every password with `bcryptjs` using 12 salt rounds during the Mongoose `pre('save')` hook, exceeding the rubric's "basic hashing" requirement.
- Authentication compares passwords with `bcrypt.compare`, ensuring timing-safe verification across both customer and employee login flows.
- JWT tokens carry minimal PII and expire after 1 hour; logout adds tokens to an in-memory blacklist (`Backend/Middleware/authMiddleware.js`, `Backend/Middleware/employeeAuthMiddleware.js`).

### Input Whitelisting & Validation
- Express-validator enforces strict field-level validation (`Backend/Middleware/validationMiddleware.js`). Only regex-whitelisted names, 10-digit account numbers, and 13-digit national IDs pass.
- Payment endpoints restrict `currency`, `paymentMethod`, and status fields to predefined allowlists, preventing injection vectors.
- Additional sanitisation layers: `express-mongo-sanitize`, `xss-clean`, and `hpp` strip malicious payloads (`Backend/Middleware/securityMiddleware.js`).

### Securing Data in Transit with SSL
- A trusted certificate/key pair ships in `certs/`. When `USE_HTTPS=true`, `server.js` mounts an HTTPS server with the bundle and logs secure URLs.
- `FORCE_HTTPS` plus Express `trust proxy` ensure downgrades are rejected when deployed behind TLS-terminating proxies. Non-HTTPS requests receive explicit error responses to prevent accidental leakage.
- The frontend is also configured for HTTPS via the provided Nginx reverse proxy (`Frontend/Dockerfile`, `Frontend/nginx.conf`).

### Protecting Against Attacks
- **Header Hardening**: Helmet enforces CSP, X-Frame-Options (`frameguard`), HSTS, and referrer/cross-origin policies.
- **Rate Limiting**: `express-rate-limit` profiles separate quotas for login, registration, payments, and general API usage (`Backend/Middleware/rateLimitMiddleware.js`).
- **CORS**: Dynamic allow-list driven by environment variables rejects unknown origins and only exposes safe headers.
- **Sanitisation & Logging**: Structured logging masks sensitive fields and provides correlation IDs (`Backend/Middleware/loggerMiddleware.js`); sanitizers mitigate XSS, NoSQL injection, and HTTP parameter pollution.
- **Monitoring Hooks**: `/health` and `/api/v1` root endpoints provide readiness signals for load balancers or uptime monitors.

### Role-Based Access Control (RBAC)
- **Separate Authentication Systems**: Customer and employee authentication use separate JWT tokens and middleware (`Backend/Middleware/authMiddleware.js` vs `Backend/Middleware/employeeAuthMiddleware.js`), preventing privilege escalation between systems.
- **Employee Roles**: Two distinct roles implemented (`Backend/Models/employeeModel.js`):
  - **Employee**: Can view pending payments, approve/deny payments, and view payment history
  - **Admin**: All employee permissions plus employee management (create/delete accounts)
- **Super Admin Protection**: The initial super admin (identified by `createdBy: null`) has unique privileges:
  - Only super admin can create additional admin accounts
  - Super admin account cannot be deleted by anyone
  - Created via secure seeding script (`Backend/seedSuperAdmin.js`)
- **Middleware Chain**: Role verification middleware (`Backend/Middleware/employeeAuthMiddleware.js`) enforces:
  - `verifyEmployeeToken`: Validates JWT and checks token blacklist
  - `verifyEmployeeRole`: Ensures user is employee or admin
  - `verifyAdminRole`: Restricts access to admin-only endpoints
- **Input Validation**: Employee-specific validators (`Backend/Middleware/employeeValidationMiddleware.js`) prevent injection attacks and enforce username/password policies.

---

## DevSecOps Pipeline (CircleCI)

The `.circleci/config.yml` workflow offers an automated pipeline triggered on every push:

1. **Security Stage** – Runs `npm audit` for both workspaces, Gitleaks secret scanning, and Trivy filesystem scans (HIGH/CRITICAL severities) to surface vulnerabilities before builds start.
2. **Quality Stage** – Executes backend linting (if config present), backend Jest tests with MongoDB service, and frontend Vitest/Jest suite with coverage upload.
3. **Build Stage** – Builds backend and frontend artifacts, persists the React production build, and assembles Docker images for both services.
4. **Packaging Stage** – Validates `docker-compose.yml`, exports Docker image tarballs, and persists them for downstream deployments.

This pipeline satisfies the rubric’s DevSecOps requirement by combining automated testing, vulnerability scanning, container image validation, and artifact retention on every push. Adjust or extend the workflow by editing `.circleci/config.yml`.

---

## API Surface

### Customer Endpoints

| Method | Endpoint | Description | Middleware Highlights |
|--------|----------|-------------|------------------------|
| POST | `/api/v1/auth/register` | Register a customer account | `validateRegister`, rate limit, bcrypt hashing |
| POST | `/api/v1/auth/login` | Authenticate and receive JWT | `validateLogin`, login limiter |
| POST | `/api/v1/auth/logout` | Invalidate current JWT | `verifyToken` |
| POST | `/api/v1/payments` | Create payment intent | `validateCreatePayment`, payment limiter |
| PATCH | `/api/v1/payments/:id/status` | Update payment status | `validateUpdatePaymentStatus`, JWT auth |
| GET | `/health` | Liveness probe | Public endpoint |

### Employee & Admin Endpoints

| Method | Endpoint | Description | Middleware Highlights |
|--------|----------|-------------|------------------------|
| POST | `/api/v1/employee/auth/login` | Employee login | `validateEmployeeLogin`, login limiter |
| POST | `/api/v1/employee/auth/logout` | Employee logout | `verifyEmployeeToken` |
| GET | `/api/v1/employee/payments/pending` | Get pending payments | `verifyEmployeeToken`, `verifyEmployeeRole` |
| PUT | `/api/v1/employee/payments/:paymentId/process` | Approve/deny payment | `verifyEmployeeToken`, `validateProcessPayment` |
| GET | `/api/v1/employee/payments/history` | Get payment history | `verifyEmployeeToken`, `verifyEmployeeRole` |
| GET | `/api/v1/employee/admin/employees` | List all employees (admin only) | `verifyEmployeeToken`, `verifyAdminRole` |
| POST | `/api/v1/employee/admin/employees` | Create employee (admin only) | `verifyEmployeeToken`, `verifyAdminRole`, `validateCreateEmployee` |
| DELETE | `/api/v1/employee/admin/employees/:employeeId` | Delete employee (admin only) | `verifyEmployeeToken`, `verifyAdminRole` |

Refer to `Backend/Routes/` for the complete routing table.

---

## Database Models

### Customer Model (`Backend/Models/userModel.js`)
- **fullName**: Customer's full name (3-100 chars)
- **idNumber**: South African ID number (13 digits)
- **accountNumber**: 10-digit account number (unique)
- **password**: bcrypt hashed password (12 salt rounds)
- **createdAt**: Account creation timestamp

### Employee Model (`Backend/Models/employeeModel.js`)
- **username**: Unique username (3-50 alphanumeric chars)
- **password**: bcrypt hashed password (12 salt rounds)
- **role**: Either 'admin' or 'employee'
- **createdBy**: Reference to the admin who created this account (null for super admin)
- **createdAt**: Account creation timestamp

### Payment Model (`Backend/Models/paymentModel.js`)
- **userId**: Reference to customer who initiated payment
- **amount**: Payment amount (decimal)
- **currency**: Currency code (e.g., USD, EUR, ZAR)
- **provider**: SWIFT provider code
- **accountInfo**: Recipient account information
- **swiftCode**: International SWIFT code
- **paymentMethod**: Method of payment (e.g., SWIFT)
- **status**: 'pending', 'approved', or 'denied'
- **processedBy**: Reference to employee who processed payment
- **processedAt**: Timestamp of payment processing
- **createdAt**: Payment creation timestamp

---

## Troubleshooting

### General Issues
- **CORS blocked**: Ensure `FRONTEND_URL`/`CORS_ORIGINS` include your frontend origin and restart the backend.
- **TLS certificate errors**: Delete and regenerate the `certs/` bundle or disable HTTPS locally by setting `USE_HTTPS=false`.
- **MongoDB connection failures**: Confirm the database is reachable and `MONGODB_URI` matches the environment.

### Employee/Admin Issues
- **Cannot login as super admin**: Ensure you've run `node seedSuperAdmin.js` from the Backend directory first.
- **"Super admin already exists" message**: The super admin was already created. Check your password or use the `removeOldAdmin.js` script to reset (use with caution).
- **Cannot create admin accounts**: Only super admin (the account with `createdBy: null`) can create other admin accounts. Regular admins can only create employee accounts.
- **Cannot delete employee**: Verify you're logged in as an admin. Super admin accounts cannot be deleted by anyone.
- **Employee endpoints returning 401**: Check that:
  - JWT token is valid and not expired (1 hour expiration)
  - Token is being sent in the `Authorization: Bearer <token>` header
  - You're accessing employee endpoints (`/api/v1/employee/*`) not customer endpoints
- **Payment processing not working**: Employees and admins need to be logged in to approve/deny payments. Verify the `verifyEmployeeToken` middleware is passing.

---

## References

CircleCI, 2025. Autonomous validation for the AI era. Available at: https://circleci.com/
 (Accessed: 10 October 2025).

Express Validator Team, 2025. express-validator - npm. Available at: https://www.npmjs.com/package/express-validator
 (Accessed: 07 October 2025).

Express Validator Team, 2025. express-validator Documentation. Available at: https://express-validator.github.io/docs/
 (Accessed: 07 October 2025).

Express.js Team, 2025. cors - npm. Available at: https://www.npmjs.com/package/cors
 (Accessed: 07 October 2025).

Helmetjs Team, 2025. helmet - npm. Available at: https://www.npmjs.com/package/helmet
 (Accessed: 07 October 2025).

Helmetjs Team, 2025. Helmet.js Documentation. Available at: https://helmetjs.github.io/
 (Accessed: 07 October 2025).

Lusina, A., 2025. Person picking fake Monopoly money [Photograph]. Pexels. Available at: https://www.pexels.com/photo/person-picking-fake-monopoly-money-4792381/
 (Accessed: 10 October 2025).

Meta Platforms, Inc., 2025. React - A JavaScript library for building user interfaces. Available at: https://reactjs.org/
 (Accessed: 07 October 2025).

MongoDB, 2025. The World’s Leading Modern Database. Available at: https://www.mongodb.com/
 (Accessed: 10 October 2025).

Mozilla Developer Network, 2025. Cross-Origin Resource Sharing (CORS) - HTTP | MDN. Available at: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
 (Accessed: 07 October 2025).

Npm, 2025. express-rate-limit - npm. Available at: https://www.npmjs.com/package/express-rate-limit
 (Accessed: 07 October 2025).

React Navigation, 2025. Moving between screens. Available at: https://reactnavigation.org/docs/navigating/
 (Accessed: 10 October 2025).

Remix Software, Inc., 2025. React Router - Declarative routing for React. Available at: https://reactrouter.com/
 (Accessed: 07 October 2025).

Sheta, D., 2025. Seven Indian rupee banknotes hanging from clothesline on clothes pegs [Photograph]. Pexels. Available at: https://www.pexels.com/photo/seven-indian-rupee-banknotes-hanging-from-clothesline-on-clothes-pegs-3521353/
 (Accessed: 10 October 2025).

SonarCloud, 2025. SonarQube Cloud Online Code Review as a Service Tool. Available at: https://www.sonarsource.com/products/sonarcloud/
 (Accessed: 10 October 2025).

Unicode Consortium, 2024. Unicode Emoji List. Available at: https://unicode.org/emoji/
 (Accessed: 10 October 2025).

W3Schools, 2025. Styling React Using CSS. Available at: https://www.w3schools.com/react/react_css.asp
 (Accessed: 10 October 2025).

Docker, 2025. Accelerated Container Application Development. Available at: https://www.docker.com/
 (Accessed: 10 October 2025).
Jestjs.io. (2025) Jest - Getting Started. Available at: https://jestjs.io/docs/getting-started (Accessed: 07 October 2025).

Visionmedia. (2025) supertest - npm. Available at: https://www.npmjs.com/package/supertest (Accessed: 07 October 2025).

Mongoose Team. (2025) Mongoose v8.0.0: Getting Started. Available at: https://mongoosejs.com/docs/index.html (Accessed: 29 October 2025).

Mongoose Team. (2025) Mongoose v8.0.0: Schemas. Available at: https://mongoosejs.com/docs/guide.html (Accessed: 29 October 2025).

Mongoose Team. (2025) Mongoose v8.0.0: Queries. Available at: https://mongoosejs.com/docs/queries.html (Accessed: 29 October 2025).

Npm. (2025) bcryptjs - npm. Available at: https://www.npmjs.com/package/bcryptjs (Accessed: 29 October 2025).

Express.js. (2025) Express.js - Fast, unopinionated, minimalist web framework for Node.js. Available at: https://expressjs.com/ (Accessed: 29 October 2025).

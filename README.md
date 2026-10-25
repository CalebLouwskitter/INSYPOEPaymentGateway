## INSY POE Payment Gateway

An international payments portal with a customer portal, an employee review queue and an admin console, built on React, Express and MongoDB. It was built as a team project for INSY7314 (Secure Software Development). After submission I reviewed it as an attacker would, fixed what broke, and wrote the results up as a security case study.

**→ [Read the security case study](docs/security-case-study.md)**: threat model, OWASP Top 10 mapping, the attacks I ran, the gaps I found and fixed, and the risks that are still open.

### Contributors
| Name | Student Number | Role |
|------|-----------------|------|
| Caleb Louwskitter | ST10275378 | [Lead Developer] | 
| Logan | ST10268888 | [Developer] |
| Kyle | ST10085208 | [Developer] |

### Quick Links
- Demo video: https://youtu.be/SuzQhvoI0qc
- PART 3: https://www.youtube.com/watch?v=iN4WrlscJLk 

---

## Security at a glance

**Twelve scripted attacks, before and after the review** (`cd Backend && npm run demo:attacks`):

```
BLOCKED    NoSQL injection: log in as anyone with {"$ne": null}                rejected by input validation (HTTP 400)
BLOCKED    Brute force: rotate X-Forwarded-For to dodge the login rate limit   throttled (429) after 5 guesses, despite a new spoofed IP each time
BLOCKED    Customer approves their own payment via PUT /payments/:id/status    HTTP 404, payment is now "pending"
BLOCKED    Customer deletes a payment that was already approved (audit trail)  HTTP 409
BLOCKED    IDOR: Bob reads Alice's payment by id                               HTTP 404
BLOCKED    Token confusion: employee token on customer routes                  HTTP 403
BLOCKED    Unsigned JWT ("alg": "none") claiming to be Alice                   HTTP 403
BLOCKED    Forged admin token signed with a guessed secret ("secret")          HTTP 403
BLOCKED    Fired employee keeps using their unexpired token                    HTTP 401
BLOCKED    Race: two employees approve and deny the same payment at once       HTTP 200 / 409
BLOCKED    CSRF: cross-site POST without the double-submit token               HTTP 403
BLOCKED    CORS: https://evil.example asks to read API responses               no Access-Control-Allow-Origin header

12/12 attacks blocked
```

Against the code as originally submitted, 6 of these 12 attacks succeeded. The most serious, among the 16 issues fixed:

- **Customers could approve their own payments.** The payment portal marked every new payment "completed" right after creating it, so the employee approval step never ran. ([F1](docs/security-case-study.md#f1-high-customers-could-approve-their-own-payments))
- **The NoSQL and XSS sanitisers never ran on request bodies,** because they were registered before the JSON body parser. ([F3](docs/security-case-study.md#f3-medium-the-sanitisers-never-saw-request-bodies))
- **The login rate limit could be bypassed** by sending a different `X-Forwarded-For` header with each guess. ([F4](docs/security-case-study.md#f4-medium-rate-limits-could-be-bypassed-by-spoofing-x-forwarded-for))
- **Fired or demoted staff kept their access** for up to 8 hours, and two employees could approve and deny the same payment at once. ([F5, F6](docs/security-case-study.md#5-gaps-found-and-fixed))
- **National IDs went into the server logs, and session tokens into the browser console.** ([F7](docs/security-case-study.md#f7-medium-personal-data-in-server-logs-and-the-browser-console))

**Controls in place**

| Area | Control | Where |
|------|---------|-------|
| Authentication | bcrypt (cost 12), passwords of at least 8 characters, JWTs with the algorithm pinned and a type claim, the same timing whether or not an account exists, logout denylist | [`authController.js`](Backend/Controller/authController.js), [`authMiddleware.js`](Backend/Middleware/authMiddleware.js) |
| Access control | Separate customer and staff tokens; role checks; staff account and role re-checked on every request; customer queries scoped to the user; only staff can approve or deny, atomically | [`employeeAuthMiddleware.js`](Backend/Middleware/employeeAuthMiddleware.js), [`paymentController.js`](Backend/Controller/paymentController.js), [`employeeController.js`](Backend/Controller/employeeController.js) |
| Input handling | `express-validator` allow-lists that require string fields, `express-mongo-sanitize` and `hpp` after body parsing, 200 kB body limit | [`validationMiddleware.js`](Backend/Middleware/validationMiddleware.js), [`securityMiddleware.js`](Backend/Middleware/securityMiddleware.js) |
| Browser | helmet (HSTS, frame-deny, nosniff), a CSP on the frontend with no `unsafe-inline` scripts, CORS allow-list, double-submit CSRF token | [`securityMiddleware.js`](Backend/Middleware/securityMiddleware.js), [`nginx.conf`](Frontend/nginx.conf), [`server.js`](Backend/server.js) |
| Abuse | Per-route rate limits that cannot be reset by spoofing proxy headers | [`rateLimitMiddleware.js`](Backend/Middleware/rateLimitMiddleware.js) |
| Logging | Request ids, personal data masked or omitted, generic error responses | [`loggerMiddleware.js`](Backend/Middleware/loggerMiddleware.js) |
| Configuration | Refuses to start without a strong JWT secret; MongoDB not published beyond localhost; no keys or `.env` files in git | [`configCheck.js`](Backend/Services/configCheck.js), [`docker-compose.yml`](docker-compose.yml) |
| CI | Tests and the attack demo, an `npm audit` gate, gitleaks over the full history, CodeQL | [`.github/workflows/security.yml`](.github/workflows/security.yml) |

The case study's [remaining risks](docs/security-case-study.md#7-remaining-risks) section lists what is still open, the biggest being that the session token is kept in `localStorage`.

---

## Solution Overview

- **Architecture**: React frontend (`Frontend/`) served by Nginx, Express API (`Backend/`), MongoDB (Atlas or local). Docker Compose describes the services for local development.
- **Primary Features**: 
  - **Customer Portal**: Customer registration and login, JWT-based session management, payment submission and status tracking
  - **Employee Portal**: Secure employee authentication, view pending payments, approve/deny payments, payment history tracking
  - **Admin Portal**: Full employee management (create/view/delete), role-based access control (admin/employee), super admin privileges
- **Built With**: Node.js, Express 4, MongoDB & Mongoose 8, React 18, Docker, GitHub Actions, CircleCI.

### Security Validation (both Employee/Admin and User)
<img width="486" height="403" alt="image" src="https://github.com/user-attachments/assets/a5f19406-12dc-47f8-852f-fbefcc0d68a9" />

<img width="527" height="584" alt="image" src="https://github.com/user-attachments/assets/9c6f3d0b-64be-4f83-a9e4-e5894b612df4" />

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker Desktop (for containerised workflows)
- MongoDB instance (Atlas connection string or local `mongodb://localhost:27017`). The backend tests don't need one; they start an in-memory MongoDB.
- [mkcert](https://github.com/FiloSottile/mkcert) if you want local HTTPS (see `certs/README.md`)

### Environment Variables
Copy `Backend/.env.example` to `Backend/.env` (and `.env.example` to `.env` for Docker Compose) and fill in values:

Key variables:
- `MONGODB_URI`: MongoDB connection string for app runtime.
- `JWT_SECRET`: signing key for JWT tokens. In production the server refuses to start unless it is at least 32 random characters; generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `USE_HTTPS`: set to `true` to serve the API over HTTPS with mkcert certificates in `certs/` (not committed; generate your own).
- `FORCE_HTTPS`: set to `true` (or run in production) to reject non-HTTPS requests.
- `TRUST_PROXY`: leave unset when the API is reached directly. Behind one reverse proxy set it to `1`, so client IPs (rate limiting) and HTTPS detection come from `X-Forwarded-*`.
- `FRONTEND_URL` / `CORS_ORIGINS`: comma-separated origins the backend should trust for CORS.
- `LOG_REQUEST_BODY`: set to `true` only for local debugging; logs request bodies with sensitive fields masked.

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
npm start
```
The React app is available on `https://localhost:3000` (set `HTTPS=false` in `Frontend/.env` to use plain HTTP).

### Docker Compose (full stack)
```bash
docker compose up --build
```
`docker-compose.yml` defines `mongodb`, `backend`, `middleware` and `frontend` services. Note: the `middleware` service currently has no code or Dockerfile in `Middleware/`, so the stack does not build as-is.

### Running the stack with authenticated, encrypted MongoDB

MongoDB in Docker Compose runs with authentication enforced and requires TLS encryption. An initialization script creates a least-privilege application user (`insy7314_app`) with `readWrite` permissions on only the `insy7314` database.

1. **Generate TLS certificates:**
   Generate the local Certificate Authority (CA) and server certificate for MongoDB:
   - On Linux / macOS / Git Bash:
     ```bash
     bash scripts/gen-mongo-certs.sh
     ```
   - On Windows (PowerShell):
     ```powershell
     .\scripts\gen-mongo-certs.ps1
     ```
   This generates `ca.pem`, `mongodb.crt`, `mongodb.key`, and `mongodb.pem` into `certs/mongo/` (git-ignored; private keys are never committed).

2. **Fill in `.env`:**
   Copy `.env.example` to `.env` and set strong passwords:
   ```bash
   cp .env.example .env
   ```
   Configure:
   - `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD` for MongoDB root administration
   - `MONGO_APP_PASSWORD` for the least-privilege application user
   - `MONGODB_URI` using the `insy7314_app` user and TLS (`mongodb://insy7314_app:<password>@mongodb:27017/insy7314?authSource=insy7314&tls=true&tlsCAFile=/certs/mongo/ca.pem`)
   - `JWT_SECRET` (at least 32 random characters in production)

3. **Start the stack:**
   ```bash
   docker compose up --build
   ```

4. **Verify security controls:**
   - **Backend connection:** The backend connects using the `insy7314_app` user and verifies the MongoDB TLS certificate using the mounted CA.
   - **Unauthenticated connections rejected:** Connecting with `mongosh` without credentials is refused.
   - **Plain non-TLS connections rejected:** Connecting with `mongosh` without TLS is refused.
   - **Healthcheck:** The container healthcheck queries MongoDB status using root credentials over TLS.

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
   - Navigate to `https://localhost:3000/employee/login`
   - Login with username: `superadmin` and your password
   - Create additional employee or admin accounts as needed

### Testing & Quality Gates
- Backend: `cd Backend && npm test` (unit, API and attack-scenario tests against an in-memory MongoDB)
- Attack demo: `cd Backend && npm run demo:attacks`
- Frontend: `cd Frontend && CI=true npm test -- --watchAll=false`
- Coverage output stored under respective `coverage/` directories and published as CircleCI artifacts.

---

## User Workflows

### Customer Portal Flow
1. **Registration** (`/register`): Create account with full name, national ID number, account number, and password
2. **Login** (`/login`): Authenticate with full name, account number, national ID and password
3. **Dashboard** (`/dashboard`): View payments and their status (pending review, approved, denied); withdraw a payment while it is still pending
4. **Payment Portal** (`/paymentportal`): Submit a new international payment. It stays pending until an employee reviews it.

### Employee Portal Flow
1. **Login** (`/employee/login`): Authenticate with username and password
2. **Dashboard** (`/employee/dashboard`): View and manage pending payments
   - View all pending customer payments with details
   - Approve or deny payments with one click
3. **History** (`/employee/history`): View processed payments with who processed them and when
4. **Logout**: Secure logout invalidating JWT token

### Admin Portal Flow
1. **Login** (`/employee/login`): Authenticate as admin/super admin
2. **Admin Dashboard** (`/employee/admin`): Full system management
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
- **Protected Routes**: Route guards ensure proper authentication (`ProtectedRoute.jsx`, `EmployeeProtectedRoute.jsx`). These only shape the UI; the API enforces every rule itself.
- **Axios Interceptors**: Automatic token injection and error handling (`Frontend/src/interfaces/`)
- **Responsive UI**: Modern, accessible interface with error handling and loading states

---

## Security Controls (Rubric Alignment)

From Part 1, we prioritized protections against XSS, NoSQL injection, brute-force login, clickjacking, insecure transport, and abusive cross-origin requests. In Parts 2 and 3, these were implemented primarily via the backend middleware stack (`Backend/Middleware/*`). The post-submission review ([case study](docs/security-case-study.md)) tested each of these and fixed the ones that did not hold.

- XSS/Clickjacking/Headers: `helmet` configuration, CSP, frameguard, HSTS on the API; CSP and security headers in `Frontend/nginx.conf`.
- NoSQL injection/Param pollution: `express-mongo-sanitize`, `hpp` (run after body parsing), string-only validators.
- Brute-force and abuse: `express-rate-limit` with route-specific limiters, keyed on a client IP that cannot be spoofed.
- Input validation: `express-validator` allowlists and strict schemas.
- Transport security: HTTPS with mkcert certificates and `FORCE_HTTPS`.
- Session/auth hardening: `bcryptjs`, short-lived JWTs, blacklist on logout.
- RBAC separation: distinct customer vs employee/admin auth middleware.


### Password Security
- Passwords are never stored in plaintext. Both `userModel` (`Backend/Models/userModel.js`) and `employeeModel` (`Backend/Models/employeeModel.js`) hash every password with `bcryptjs` using 12 salt rounds during the Mongoose `pre('save')` hook.
- Passwords must be 8 to 72 bytes long (bcrypt ignores anything longer); employee passwords also need upper case, lower case and a digit.
- Login runs the bcrypt comparison even when the account does not exist, so response timing does not reveal which accounts are registered.
- Customer JWTs expire after 1 hour and employee JWTs after 8 hours; logout adds tokens to an in-memory blacklist (`Backend/Middleware/authMiddleware.js`, `Backend/Middleware/employeeAuthMiddleware.js`).

### Input Whitelisting & Validation
- Express-validator enforces strict field-level validation (`Backend/Middleware/validationMiddleware.js`). Only regex-whitelisted names, 10-digit account numbers, and 13-digit national IDs pass, and every login field must be a plain string.
- Payment endpoints restrict `currency` and `paymentMethod` to predefined formats and allowlists.
- `express-mongo-sanitize` strips `$` and `.` keys from bodies, query strings and params, and `hpp` blocks parameter pollution (`Backend/Middleware/securityMiddleware.js`).

### Securing Data in Transit with SSL
- Local HTTPS uses mkcert certificates generated into `certs/` (git-ignored; see `certs/README.md`). When `USE_HTTPS=true`, `server.js` serves the API over HTTPS.
- `FORCE_HTTPS` rejects plain-HTTP requests in production. Behind a TLS-terminating proxy, set `TRUST_PROXY` so the API can tell the original request was HTTPS.
- Both the API and the Nginx frontend send HSTS.

### Protecting Against Attacks
- **Header Hardening**: Helmet enforces CSP, X-Frame-Options (`frameguard`), HSTS, and referrer/cross-origin policies. Nginx adds a CSP for the frontend and sends its headers on every response, static files included.
- **Rate Limiting**: `express-rate-limit` profiles separate quotas for login, registration, payments, and general API usage (`Backend/Middleware/rateLimitMiddleware.js`).
- **CORS**: Dynamic allow-list driven by environment variables; unknown origins get no CORS headers.
- **CSRF**: Double-submit cookie (`XSRF-TOKEN` cookie plus `X-CSRF-Token` header) on every state-changing request (`Backend/server.js`).
- **Sanitisation & Logging**: Structured logging masks sensitive fields (passwords, national IDs, account and card numbers) and provides correlation IDs (`Backend/Middleware/loggerMiddleware.js`). Error responses never include internal error details.
- **Monitoring Hooks**: `/health` and `/api/v1` root endpoints provide readiness signals for load balancers or uptime monitors.

### Role-Based Access Control (RBAC)
- **Separate Authentication Systems**: Customer and employee tokens carry a `type` claim that each middleware checks (`Backend/Middleware/authMiddleware.js` vs `Backend/Middleware/employeeAuthMiddleware.js`), so a token from one portal never works on the other.
- **Employee Roles**: Two distinct roles implemented (`Backend/Models/employeeModel.js`):
  - **Employee**: Can view pending payments, approve/deny payments, and view payment history
  - **Admin**: All employee permissions plus employee management (create/delete accounts)
- **Payment status is staff-only**: Customers can submit and withdraw pending payments but cannot change a payment's status. Approving or denying is an atomic update that only succeeds while the payment is still pending.
- **Super Admin Protection**: The initial super admin (identified by `createdBy: null`) has unique privileges:
  - Only super admin can create additional admin accounts
  - Super admin account cannot be deleted by anyone
  - Created via secure seeding script (`Backend/seedSuperAdmin.js`)
- **Middleware Chain**: Role verification middleware (`Backend/Middleware/employeeAuthMiddleware.js`) enforces:
  - `verifyEmployeeToken`: Validates the JWT, checks the token blacklist, and reloads the employee so deleted accounts and role changes take effect immediately
  - `verifyEmployeeRole`: Ensures user is employee or admin
  - `verifyAdminRole`: Restricts access to admin-only endpoints
- **Input Validation**: Employee-specific validators (`Backend/Middleware/employeeValidationMiddleware.js`) prevent injection attacks and enforce username/password policies.

---

## DevSecOps Pipelines

**GitHub Actions** (`.github/workflows/security.yml`) runs on every pull request, on pushes to `main` and weekly:

1. Backend tests, including the attack-scenario suite, plus `npm run demo:attacks`, which fails the build if any attack succeeds.
2. `npm audit` gate: backend production dependencies fail on high, frontend on critical.
3. Gitleaks secret scan over the full git history.
4. CodeQL static analysis with the `security-extended` queries.

**CircleCI** (`.circleci/config.yml`), from the original coursework:

1. **Security Stage**: runs `npm audit` for both workspaces, Gitleaks secret scanning, and Trivy filesystem scans (HIGH/CRITICAL severities). These steps report findings but do not fail the build.
2. **Quality Stage**: executes backend linting (if config present), backend Jest tests with a MongoDB service, and the frontend Jest suite with coverage upload.
3. **Build Stage**: builds backend and frontend artifacts, persists the React production build, and assembles Docker images for both services.
4. **Packaging Stage**: validates `docker-compose.yml`, exports Docker image tarballs, and persists them for downstream deployments.

---

## API Surface

### Customer Endpoints

| Method | Endpoint | Description | Middleware Highlights |
|--------|----------|-------------|------------------------|
| GET | `/api/v1/csrf-token` | Issue the CSRF double-submit cookie | Public |
| POST | `/api/v1/auth/register` | Register a customer account | `validateRegister`, registration limiter, bcrypt hashing |
| POST | `/api/v1/auth/login` | Authenticate and receive JWT | `validateLogin`, login limiter |
| POST | `/api/v1/auth/logout` | Invalidate current JWT | `verifyToken` |
| GET | `/api/v1/payments` | List the customer's own payments | `verifyToken`, payment limiter |
| GET | `/api/v1/payments/:id` | Get one of the customer's own payments | `verifyToken`, `validatePaymentId` |
| POST | `/api/v1/payments` | Submit a payment (starts as pending) | `verifyToken`, `validateCreatePayment`, payment limiter |
| DELETE | `/api/v1/payments/:id` | Withdraw a payment that is still pending | `verifyToken`, `validatePaymentId` |
| GET | `/health` | Liveness probe | Public endpoint |

### Employee & Admin Endpoints

| Method | Endpoint | Description | Middleware Highlights |
|--------|----------|-------------|------------------------|
| POST | `/api/v1/employee/auth/login` | Employee login | `validateEmployeeLogin`, login limiter |
| POST | `/api/v1/employee/auth/logout` | Employee logout | `verifyEmployeeToken` |
| GET | `/api/v1/employee/payments/pending` | Get pending payments | `verifyEmployeeToken`, `verifyEmployeeRole` |
| PUT | `/api/v1/employee/payments/:paymentId/process` | Approve/deny payment (409 if already processed) | `verifyEmployeeToken`, `verifyEmployeeRole`, `validateProcessPayment` |
| GET | `/api/v1/employee/payments/history` | Get payment history | `verifyEmployeeToken`, `verifyEmployeeRole` |
| GET | `/api/v1/employee/admin/employees` | List all employees (admin only) | `verifyEmployeeToken`, `verifyAdminRole` |
| POST | `/api/v1/employee/admin/employees` | Create employee (admin only) | `verifyEmployeeToken`, `verifyAdminRole`, `validateCreateEmployee` |
| DELETE | `/api/v1/employee/admin/employees/:employeeId` | Delete employee (admin only) | `verifyEmployeeToken`, `verifyAdminRole` |

Refer to `Backend/Routes/` for the complete routing table.

---

## Database Models

### Customer Model (`Backend/Models/userModel.js`)
- **fullName**: Customer's full name (3-100 chars)
- **nationalId**: South African ID number (13 digits, unique)
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
- **paymentMethod**: `credit_card`, `debit_card`, `bank_transfer`, `paypal` or `mobile_wallet`
- **transactionId**: Unique, randomly generated reference
- **description** / **metadata**: Free-text description and masked method details (e.g. card last four digits)
- **status**: `pending` until processed, then `approved` or `denied`
- **processedBy**: Reference to employee who processed payment
- **processedAt**: Timestamp of payment processing
- **createdAt** / **updatedAt**: Timestamps

---

## Troubleshooting

### General Issues
- **CORS blocked**: Ensure `FRONTEND_URL`/`CORS_ORIGINS` include your frontend origin and restart the backend.
- **TLS certificate errors**: Delete and regenerate the `certs/` bundle or disable HTTPS locally by setting `USE_HTTPS=false`.
- **MongoDB connection failures**: Confirm the database is reachable and `MONGODB_URI` matches the environment.
- **Backend exits with `[CONFIG] JWT_SECRET ...`**: Set `JWT_SECRET`; in production it must be at least 32 characters and not the placeholder from `.env.example`.
- **Every login is rate limited behind a proxy**: Set `TRUST_PROXY=1` so the API sees real client IPs instead of the proxy's.

### Employee/Admin Issues
- **Cannot login as super admin**: Ensure you've run `node seedSuperAdmin.js` from the Backend directory first.
- **"Super admin already exists" message**: The super admin was already created. Check your password or use the `removeOldAdmin.js` script to reset (use with caution).
- **Cannot create admin accounts**: Only super admin (the account with `createdBy: null`) can create other admin accounts. Regular admins can only create employee accounts.
- **Cannot delete employee**: Verify you're logged in as an admin. Super admin accounts cannot be deleted by anyone.
- **Employee endpoints returning 401**: Check that:
  - JWT token is valid and not expired (8 hour expiration for employees)
  - The employee account still exists (deleted accounts are locked out immediately)
  - Token is being sent in the `Authorization: Bearer <token>` header
  - You're accessing employee endpoints (`/api/v1/employee/*`) not customer endpoints
- **Payment processing not working**: Employees and admins need to be logged in to approve/deny payments. A 409 means another employee already processed that payment.

---

## Changelog

### Post-submission security review
- Security
  - Fixed 16 issues found by an attacker-style review, including customers approving their own payments, sanitisers that never ran on request bodies, rate limits that could be bypassed, stale staff privileges, a double-processing race, and personal data in logs. See the [security case study](docs/security-case-study.md).
  - Added attack-scenario tests, an attack demo script, and a GitHub Actions security workflow.

### Part 2 → Part 3
- Added
  - Full Employee portal: authentication, pending payments view, approve/deny actions, history view.
  - Admin enhancements: employee management (create/delete), role restrictions.
- Changed
  - Separated customer vs employee/admin auth flows and protected routes in frontend and backend.
- Security
  - Consolidated and expanded middleware-based mitigations under `Backend/Middleware/*` (helmet, CORS, sanitizers, rate limiting, validators).
- Documentation
  - Updated README to reflect portals, security controls, and workflows.

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

OWASP Foundation, 2021. OWASP Top 10:2021. Available at: https://owasp.org/Top10/

NIST, 2017. SP 800-63B Digital Identity Guidelines: Authentication and Lifecycle Management. Available at: https://pages.nist.gov/800-63-3/sp800-63b.html

# Freedom ECIRS Backend API

Electronic Contract Invoice & Receipting System for Freedom Radio Group.

## Quick Start (Local Testing)

**Prerequisites:** Node.js 18+ and Docker Desktop

```bash
# 1. Start Docker Desktop, then run:
docker-compose up -d postgres

# 2. Wait 10 seconds, then start API:
npm run dev

# 3. Test it (in new terminal):
./quick-test.sh
```

**Or open browser:** http://localhost:3100/docs

---

## Features

- JWT authentication with role-based access control
- PostgreSQL database with complete schema
- Zod validation for all inputs
- Auto-generated Swagger/OpenAPI documentation
- Station-scoped access for multi-location operations
- Built with TypeScript and Fastify 5

---

## Local Development

### Option 1: Quick Start (Recommended)
```bash
# Start database
docker-compose up -d postgres

# Start API (after 10 seconds)
npm run dev

# Test it
./quick-test.sh
```

### Option 2: Manual Setup
If you already have PostgreSQL installed:
```bash
# Create database
createdb freedom_ecirs
psql -d freedom_ecirs -f database/schema.sql

# Configure .env
cp .env.example .env
# Edit .env with your database credentials

# Start API
npm run dev
```

## API Endpoints

**Base URL:** `http://localhost:3100/api/v1`

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - Register new user
- `GET /auth/me` - Get current user (requires auth)

### Clients
- `GET /clients` - List all clients
- `GET /clients/:id` - Get client by ID
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client

### Other Routes
- `GET /health` - Health check
- `GET /docs` - Swagger UI documentation

**Coming Soon:** Contracts, Invoices, Receipts

## Testing

### Automated Test
```bash
./quick-test.sh
```

### Manual Testing with curl
```bash
# Register user
curl -X POST http://localhost:3100/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@freedomradio.ng",
    "password": "Admin123!",
    "full_name": "System Administrator",
    "phone": "08012345678",
    "role": "super_admin",
    "station_codes": ["FR-KAN"]
  }'

# Login (save the token)
curl -X POST http://localhost:3100/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Admin123!"}'

# Use token for authenticated requests
export TOKEN="your_jwt_token_here"
curl http://localhost:3100/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Testing with Postman
Import `postman_collection.json` into Postman for easy testing.

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Fastify 5 |
| Language | TypeScript 5 |
| Database | PostgreSQL 15+ |
| Validation | Zod 4 |
| Auth | JWT (@fastify/jwt) |
| Docs | Swagger/OpenAPI |

---

## Configuration

### User Roles
- `super_admin` - Full access
- `station_manager` - Station operations
- `sales_executive` - Clients & contracts
- `accountant` - Financial records
- `viewer` - Read-only

### Station Codes
- `FR-KAN` - Freedom Radio Kano (Flagship)
- `FR-DUT` - Freedom Radio Dutse
- `FR-KAD` - Freedom Radio Kaduna
- `DL-KAN` - Dala FM Kano (Youth)

### Currency
All amounts stored as integers in kobo (₦1.00 = 100 kobo)

---

## Production Deployment

For production deployment with pure PostgreSQL, see [PRODUCTION_DEPLOY.md](PRODUCTION_DEPLOY.md)

Key production features:
- PM2 process management
- Nginx reverse proxy
- SSL with Let's Encrypt
- Automated database backups
- System monitoring

---

## Stop Services

```bash
# Stop API: Ctrl+C in terminal

# Stop database:
docker-compose down

# Stop and remove data:
docker-compose down -v
```

---

## Project Structure

```
src/
├── config/         # Database & environment config
├── controllers/    # Request handlers
├── middleware/     # Authentication
├── routes/         # API endpoints
├── schemas/        # Zod validation
├── services/       # Business logic
└── types/          # TypeScript types
```

---

## License

Proprietary - Freedom Radio Group

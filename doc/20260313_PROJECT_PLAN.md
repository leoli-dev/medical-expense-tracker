# Medical Expense Tracker - Implementation Plan

## Context

Manual tracking of medical expenses for tax purposes is tedious and error-prone. This project builds a mobile-first PWA that lets users log expenses, upload receipts for AI-powered data extraction, track claim/reimbursement status, and export yearly summaries to CSV for tax filing.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite via Drizzle ORM |
| Auth | JWT (jsonwebtoken + bcrypt) |
| AI | OpenAI API (gpt-4o vision) with provider abstraction |
| File Upload | Multer + Sharp (image preprocessing) |
| PWA | vite-plugin-pwa |

---

## 1. Project Structure

```
medical-expense-tracker/
├── doc/
├── packages/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts
│   │   ├── .env.example
│   │   ├── src/
│   │   │   ├── index.ts                   # Express app entry point
│   │   │   ├── config.ts                  # Env vars, constants
│   │   │   ├── db/
│   │   │   │   ├── index.ts               # Drizzle client init
│   │   │   │   └── schema.ts              # Table definitions
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts                # JWT verification
│   │   │   │   ├── errorHandler.ts        # Global error handler
│   │   │   │   └── upload.ts              # Multer config
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts         # POST /api/auth/login, GET /api/auth/me
│   │   │   │   ├── expenses.routes.ts     # CRUD /api/expenses
│   │   │   │   └── receipts.routes.ts     # POST /api/receipts/upload
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts        # Login logic, JWT signing
│   │   │   │   ├── expense.service.ts     # Expense CRUD logic
│   │   │   │   └── receipt.service.ts     # File handling + AI call
│   │   │   ├── ai/
│   │   │   │   ├── provider.interface.ts  # AIProvider interface
│   │   │   │   ├── provider.factory.ts    # Factory to select provider
│   │   │   │   ├── openai.provider.ts     # OpenAI implementation
│   │   │   │   └── prompts.ts            # Extraction prompt templates
│   │   │   ├── cli/
│   │   │   │   └── create-user.ts         # CLI: npx tsx src/cli/create-user.ts
│   │   │   └── utils/
│   │   │       ├── csv.ts                 # CSV generation
│   │   │       └── image.ts              # Sharp preprocessing
│   │   ├── uploads/                       # Gitignored, receipt storage
│   │   └── data/                          # Gitignored, SQLite DB file
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── index.html
│       ├── public/
│       │   ├── favicon.svg
│       │   ├── apple-touch-icon.png       # 180x180
│       │   ├── icon-192.png
│       │   ├── icon-512.png
│       │   └── manifest.webmanifest
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── api/
│           │   ├── client.ts              # Fetch wrapper with JWT header
│           │   ├── auth.api.ts
│           │   ├── expenses.api.ts
│           │   └── receipts.api.ts
│           ├── hooks/
│           │   ├── useAuth.ts
│           │   ├── useExpenses.ts
│           │   └── useReceiptUpload.ts
│           ├── context/
│           │   └── AuthContext.tsx
│           ├── pages/
│           │   ├── LoginPage.tsx
│           │   └── DashboardPage.tsx
│           ├── components/
│           │   ├── layout/
│           │   │   └── AppShell.tsx        # Header + content wrapper
│           │   ├── expenses/
│           │   │   ├── ExpenseList.tsx
│           │   │   ├── ExpenseRow.tsx
│           │   │   ├── ExpenseForm.tsx     # Add/Edit modal
│           │   │   ├── ExpenseSummary.tsx  # Year totals
│           │   │   └── YearSelector.tsx
│           │   ├── receipts/
│           │   │   └── ReceiptUploader.tsx # File upload + camera capture
│           │   ├── export/
│           │   │   └── ExportButton.tsx
│           │   └── ui/
│           │       ├── Button.tsx
│           │       ├── Input.tsx
│           │       ├── Modal.tsx
│           │       ├── Spinner.tsx
│           │       └── Toast.tsx
│           ├── types/
│           │   └── index.ts               # Shared TS types
│           └── styles/
│               └── index.css              # Tailwind directives
├── package.json                           # Root workspace config
├── tsconfig.base.json
├── .gitignore
└── .env.example
```

Root `package.json` uses **npm workspaces** to manage both packages.

---

## 2. Database Schema

File: `packages/backend/src/db/schema.ts`

### users table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| username | TEXT | NOT NULL, UNIQUE |
| password_hash | TEXT | NOT NULL |
| display_name | TEXT | NOT NULL |
| created_at | TEXT | NOT NULL, default now |

### expenses table

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, auto-increment |
| user_id | INTEGER | NOT NULL, FK -> users.id |
| paid_date | TEXT | NOT NULL (YYYY-MM-DD) |
| paid_amount | REAL | NOT NULL |
| description | TEXT | NOT NULL |
| claim_date | TEXT | nullable (YYYY-MM-DD) |
| reimbursement_amount | REAL | nullable |
| receipt_path | TEXT | nullable |
| created_at | TEXT | NOT NULL, default now |
| updated_at | TEXT | NOT NULL, default now |

Key decisions:
- Dates as ISO text strings (idiomatic for SQLite + Drizzle)
- `claim_date` and `reimbursement_amount` nullable -- filled when claim is processed
- `receipt_path` stores relative path to uploaded file
- One receipt per expense (sufficient for MVP)

---

## 3. API Endpoints

Base URL: `/api`

### Authentication

| Method | Route | Body | Response | Auth |
|--------|-------|------|----------|------|
| POST | `/api/auth/login` | `{ username, password }` | `{ token, user: { id, username, display_name } }` | No |
| GET | `/api/auth/me` | -- | `{ id, username, display_name }` | Yes |

### Expenses

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/expenses?year=2026` | List expenses for year, ordered by paid_date ASC. Returns `{ items, totals }` | Yes |
| POST | `/api/expenses` | Create expense | Yes |
| PUT | `/api/expenses/:id` | Update expense (any field) | Yes |
| DELETE | `/api/expenses/:id` | Delete expense | Yes |
| GET | `/api/expenses/export?year=2026` | Download CSV for year | Yes |

### Receipts

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/receipts/upload` | Upload receipt file (multipart). Returns `{ receipt_path, extracted: { paid_date, paid_amount, description } }` | Yes |

The receipt upload does NOT create an expense. It returns AI-extracted data for the user to review/edit before saving.

---

## 4. Authentication Flow

1. **User creation via CLI**: `npx tsx src/cli/create-user.ts --username leo --password secret --name "Leo"`
   - Hashes password with bcrypt (cost factor 12)
   - Inserts into `users` table
2. **Login**: POST credentials -> bcrypt.compare -> sign JWT with `JWT_SECRET`
   - Token payload: `{ userId, username }`
   - Token expiry: 30 days (personal use)
3. **Token storage**: `localStorage` key `met_token`
4. **API client**: Attaches `Authorization: Bearer <token>` on every request
5. **Auth middleware**: Verifies JWT, attaches `req.userId` to request
6. **Logout**: Clear localStorage, redirect to `/login`

---

## 5. AI Receipt Processing Pipeline

### Provider Interface (Strategy Pattern)

```typescript
// packages/backend/src/ai/provider.interface.ts
export interface ExtractedReceiptData {
  paid_date: string | null;        // YYYY-MM-DD
  paid_amount: number | null;
  description: string | null;
  confidence: number;              // 0-1
}

export interface AIProvider {
  name: string;
  extractReceiptData(fileBuffer: Buffer, mimeType: string): Promise<ExtractedReceiptData>;
}
```

### OpenAI Implementation
- Uses `openai` npm package with `gpt-4o` vision endpoint
- For images (jpg, png): sends directly with structured JSON prompt
- For PDFs: converts first page to PNG using `pdf-to-img`, then sends as image
- Uses `response_format: { type: "json_object" }` for reliable parsing

### Provider Factory
- Reads `AI_PROVIDER` env var (default: `"openai"`)
- Switch statement returns the appropriate provider instance
- Easy to add new providers (Anthropic, Google, etc.)

### Processing Pipeline (receipt.service.ts)
1. Receive uploaded file via multer
2. If image: resize with `sharp` to max 2048px on longest side (reduce API cost)
3. If PDF: convert first page to PNG with `pdf-to-img`
4. Call `aiProvider.extractReceiptData(buffer, mimeType)`
5. Return extracted data + stored file path to frontend

---

## 6. File Upload Handling

- **Library**: Multer with disk storage
- **Storage path**: `uploads/<userId>/<timestamp>-<originalname>`
- **Size limit**: 10 MB
- **Allowed types**: `image/jpeg`, `image/png`, `application/pdf`
- **DB storage**: Relative path stored in `receipt_path` column
- **Directory**: Gitignored

---

## 7. CSV Export

File: `packages/backend/src/utils/csv.ts`

CSV columns:
```
paid_date,description,paid_amount,claim_date,reimbursement_amount
```

The export endpoint:
1. Queries expenses for user + year
2. Generates CSV with proper escaping
3. Returns with `Content-Type: text/csv` and `Content-Disposition: attachment; filename="medical-expenses-2026.csv"`

---

## 8. Frontend Architecture

### Pages

**LoginPage** (`/login`): Centered card with username/password fields. On success, stores JWT and redirects to dashboard.

**DashboardPage** (`/`): Single-page view containing:
- `YearSelector` at top (dropdown or arrow navigation)
- `ExpenseSummary` showing Total Paid, Total Reimbursed, and Out of Pocket
- `ExportButton` next to summary
- `ExpenseList` with `ExpenseRow` items (tapping opens edit modal)
- Floating "+" button to add expense manually
- `ReceiptUploader` accessible from the add/edit form

### Key Component Behaviors

- **YearSelector**: Changing year re-fetches expenses from API
- **ExpenseRow**: Shows paid_date, description, paid_amount. Green badge if claimed with reimbursement_amount
- **ExpenseForm**: Modal with all fields. "Scan Receipt" button triggers upload flow
- **ReceiptUploader**: File input with camera capture on mobile (`accept="image/*;capture=camera"`). Shows spinner during AI processing, then pre-fills form
- **ExportButton**: Triggers CSV download via API

### Routing
- React Router v6
- `/login` -> LoginPage
- `/` -> DashboardPage (protected, redirects to login if no token)

---

## 9. PWA Configuration

File: `packages/frontend/vite.config.ts` with `vite-plugin-pwa`

- **Register type**: autoUpdate
- **App name**: "Medical Expense Tracker" / "MedExpense"
- **Theme color**: `#0f766e` (teal-700)
- **Display**: standalone
- **Icons**: 192x192 and 512x512 PNG

Icon generation prompt: *"A minimal app icon with a white medical cross symbol on a teal gradient background, rounded corners, flat design, 512x512 pixels."*

---

## 10. Environment Variables

Backend `.env`:
```
PORT=3000
JWT_SECRET=change-me-to-a-random-string
OPENAI_API_KEY=sk-...
AI_PROVIDER=openai
DATABASE_PATH=./data/medical-expenses.db
```

---

## 11. Development & Deployment

### Development

```bash
# Install dependencies
npm install

# Push DB schema
cd packages/backend && npx drizzle-kit push

# Create a user
npx tsx src/cli/create-user.ts --username leo --password secret --name "Leo"

# Run dev (both frontend + backend concurrently)
cd ../.. && npm run dev
```

- Backend: `tsx watch src/index.ts` (hot reload)
- Frontend: Vite dev server with proxy `/api` -> `http://localhost:3000`

### Production Deployment

1. `npm run build` (builds both packages)
2. Express serves frontend static files from `packages/frontend/dist/`
3. Run with `node packages/backend/dist/index.js` or PM2
4. Put behind nginx with HTTPS (required for PWA + camera access)
5. Set up `.env` with production secrets

---

## 12. Implementation Phases

### Phase 1: Foundation
- Initialize monorepo with npm workspaces
- Set up backend: Express + TypeScript + Drizzle + SQLite
- Define DB schema and run migration
- Implement `create-user.ts` CLI
- Implement auth routes and JWT middleware
- Set up frontend: Vite + React + TypeScript + Tailwind
- Build LoginPage, AuthContext, API client
- Verify end-to-end login flow

### Phase 2: Core Expense CRUD
- Implement expense CRUD routes (GET list, POST, PUT, DELETE)
- Build DashboardPage with YearSelector, ExpenseList, ExpenseRow
- Build ExpenseForm modal (create + edit)
- Implement ExpenseSummary with totals
- Test full CRUD operations

### Phase 3: Receipt Upload + AI Processing
- Set up multer middleware and upload route
- Implement AIProvider interface and OpenAI provider
- Implement image preprocessing with sharp
- Build ReceiptUploader component
- Wire upload flow: upload -> AI extract -> pre-fill form -> user confirms

### Phase 4: Export + Polish
- Implement CSV export endpoint and ExportButton
- Add PWA configuration (vite-plugin-pwa, manifest, icons)
- Create favicon and app icons (placeholders)
- Polish UI: loading states, error toasts, empty states, responsive design
- Add global error handler middleware

### Phase 5: Deployment
- Add production build scripts
- Configure Express to serve static frontend files
- Write deployment guide in README
- Test on mobile device

---

## 13. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Drizzle over Prisma | Lighter, zero runtime overhead with SQLite, more natural TypeScript feel |
| No separate receipts table | One receipt per expense is sufficient for MVP; join table can be added later |
| JWT in localStorage | Simpler for personal-use app behind HTTPS; httpOnly cookies better for production multi-tenant |
| AI returns data, doesn't create expense | User reviews and corrects AI extractions before saving -- avoids bad data |
| PDF-to-image conversion | OpenAI vision API works with images; gives consistent pipeline regardless of file type |
| npm workspaces monorepo | Simple, no extra tooling needed; keeps frontend and backend in one repo |

---

## 14. Verification Plan

After each phase, verify by:

1. **Phase 1**: Create user via CLI, login from mobile browser, confirm JWT is stored
2. **Phase 2**: Add/edit/delete expenses, switch years, verify totals calculate correctly
3. **Phase 3**: Upload a receipt image, verify AI extracts data, confirm form pre-fills
4. **Phase 4**: Export CSV and open in Excel/Numbers, install PWA on phone home screen
5. **Phase 5**: Deploy to server, access via HTTPS on phone, test all flows end-to-end

### Key npm packages

**Backend**: `express`, `drizzle-orm`, `better-sqlite3`, `drizzle-kit`, `jsonwebtoken`, `bcrypt`, `multer`, `sharp`, `openai`, `pdf-to-img`, `tsx`, `typescript`

**Frontend**: `react`, `react-dom`, `react-router-dom`, `vite`, `@vitejs/plugin-react`, `tailwindcss`, `vite-plugin-pwa`, `typescript`

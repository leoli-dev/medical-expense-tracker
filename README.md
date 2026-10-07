# Medical Expense Tracker

A mobile-first PWA for tracking medical expenses, with AI-powered receipt scanning and CSV export for tax filing.

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS (PWA)
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite + Drizzle ORM
- **AI**: OpenAI GPT-4o Vision (with provider abstraction)

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp packages/backend/.env.example packages/backend/.env
# Edit .env to set JWT_SECRET and OPENAI_API_KEY

# Initialize the database
mkdir -p packages/backend/data
npm run db:push

# Create a user
npm run create-user -- --username yourname --password yourpassword --name "Your Name"

# Start development (backend + frontend)
npm run dev
```

The app will be available at `http://localhost:5173` (frontend dev server with API proxy to backend on port 3000).

## Production Build

### System Requirements (Debian/Ubuntu)

This project uses native Node.js addons (`better-sqlite3`, `bcrypt`, `sharp`) that require compilation tools and system libraries.

On **Debian 13 (trixie)** / **Ubuntu 24.04+**:

```bash
# Node.js (v18+ required, v20 LTS recommended)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs

# Build tools for native addons (better-sqlite3, bcrypt)
sudo apt-get install -y build-essential python3

# sharp dependencies (libvips)
# sharp ships prebuilt libvips binaries for most platforms, but if the
# prebuilt binary is unavailable for your architecture, install libvips:
sudo apt-get install -y libvips-dev
```

**Summary of required packages:**

| Package            | Why                                                                     |
| ------------------ | ----------------------------------------------------------------------- |
| `nodejs` (v18+)    | Runtime                                                                 |
| `build-essential`  | C/C++ compiler (gcc, g++, make) for `better-sqlite3` and `bcrypt`       |
| `python3`          | Required by `node-gyp` to compile native addons                         |
| `libvips-dev`      | Image processing library for `sharp` (fallback if prebuilt unavailable) |
| `nginx` (optional) | Reverse proxy with HTTPS for production                                 |

**Minimal one-liner:**

```bash
sudo apt-get install -y build-essential python3 libvips-dev
```

### Build & Run

```bash
npm run build
cd packages/backend
node dist/index.js
```

In production, Express serves the frontend static files. Put behind nginx with HTTPS for PWA install and camera access.

## Features

- Login/authentication (JWT), with native password-manager fields
- Add, edit, delete medical expenses
- Track claim status and reimbursement amounts
- View expenses by year or an inclusive custom date range, with a default 365-day window
- Separate camera and photo/file pickers for JPG, PNG, HEIC, and PDF receipts (up to 10 MB)
- AI extraction for photos; PDFs attach directly with manual entry, and failed scans retain the attachment
- Export the selected date window to CSV
- Installable as PWA on mobile

## Validation

```bash
npm test
npm run build
```

Date-range tests cover inclusive boundaries, cross-year and leap-year windows, invalid API dates, user isolation, totals, and PDF attachment handling. Custom dates start with a 365-day window; uncheck **Keep a 365-day window** to choose a different span. Changing either endpoint while locked adjusts the other endpoint. **Apply dates** updates the list, totals, and CSV export together.

Login submits values directly from the native form so password-manager fills work even without React input events. LastPass detection and the native photo/file picker should also be checked on the target phone/browser; extensions and OS autofill settings are outside the web app.

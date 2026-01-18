# Construction Backend (Modular)

Modular Express + Mongoose + Cloudinary backend scaffold.

## Features
- Modular file structure (index exports for routes/controllers)
- JWT auth with role-based authorization
- Cloudinary helper utilities for uploads/deletes
- Pagination (20 items per page) for lists
- Multer for handling uploads (server-side temp files)

## Setup
1. Copy `.env.example` to `.env` and fill credentials.
2. `npm install`
3. `npm run dev`

API root is mounted at `/api`, e.g. `/api/auth/register`.


# NIRAYA Backend (Express + TypeScript + MongoDB)

A minimal Express API that powers products for the NIRAYA e‑commerce frontend.

## Features

- Express 4, Helmet, CORS, Rate limiting
- TypeScript + ts-node dev workflow
- MongoDB via Mongoose 8
- Products API with filtering, sorting, pagination
- Featured products endpoint
- Health check

## Getting Started

1) Install dependencies

```bash
npm install
```

2) Create an `.env` from the example and adjust values

```bash
cp .env.example .env
# On Windows PowerShell
# Copy-Item .env.example .env
```

- Ensure Mongo is running locally and `MONGO_URI` points to your instance. Example:
  - `MONGO_URI=mongodb://127.0.0.1:27017/niraya`

3) Run the dev server

```bash
npm run dev
```

- Health: http://localhost:5000/health
- Products: http://localhost:5000/api/products
- Featured: http://localhost:5000/api/products/featured

## Build & Start (prod)

```bash
npm run build
npm start
```

## API Notes

- `GET /api/products?category=&minPrice=&maxPrice=&sortBy=createdAt|price&sortOrder=asc|desc&page=1&limit=12`
- `GET /api/products/featured`
- `GET /api/products/slug/:slug`
- `GET /api/products/:id`

## Project Structure

```
src/
  config/database.ts
  controllers/productController.ts
  models/Product.ts
  routes/products.ts
  index.ts
```

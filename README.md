# Deledgsys

A double-entry ledger system built with TypeScript, Prisma, and PostgreSQL.

## What it does

- Creates financial transactions
- Uses double-entry accounting (debit/credit)
- Prevents duplicate transactions (idempotency)
- Calculates account balances
- Stores balance snapshots for fast reads
- Runs reconciliation checks for consistency

## Tech Stack

- TypeScript
- Node.js
- Prisma ORM
- PostgreSQL

## Setup

```bash
pnpm install
npx prisma generate
npx prisma migrate dev
pnpm dev
```

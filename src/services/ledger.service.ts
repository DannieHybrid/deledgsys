import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type TransactionInput = {
  reference: string;
  type: "transfer" | "deposit" | "withdrawal" | "refund";
  fromAccountId?: string;
  toAccountId?: string;
  amount: number;
};

export class LedgerService {
  async createTransaction(input: TransactionInput) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 🔒 idempotency check (safe in transaction)
      const existing = await tx.transaction.findUnique({
        where: { reference: input.reference },
      });

      if (existing) return existing;

      // 🧾 create transaction record
      const transaction = await tx.transaction.create({
        data: {
          reference: input.reference,
          type: input.type,
          status: "posted",
        },
      });

      // 💳 DOUBLE ENTRY LOGIC
      if (input.type === "transfer") {
        if (!input.fromAccountId || !input.toAccountId) {
          throw new Error("Transfer requires from + to account");
        }

        // debit sender
        await tx.ledgerEntry.create({
          data: {
            accountId: input.fromAccountId,
            transactionId: transaction.id,
            debit: input.amount,
            credit: 0,
          },
        });

        // credit receiver
        await tx.ledgerEntry.create({
          data: {
            accountId: input.toAccountId,
            transactionId: transaction.id,
            debit: 0,
            credit: input.amount,
          },
        });
      }

      return transaction;
    });
  }
}
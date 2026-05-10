import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type TransactionInput = {
  reference: string;
  type: "TRANSFER" | "DEPOSIT" | "WITHDRAWAL" | "REFUND";
  fromAccountId?: string;
  toAccountId?: string;
  amount: number;
};

export class LedgerService {
  async createTransaction(input: TransactionInput) {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({
        where: { reference: input.reference },
      });

      // idempotency check
      if (existing) return existing;

      const transaction = await tx.transaction.create({
        data: {
          reference: input.reference,
          type: input.type,
          status: "POSTED",
        },
      });

      if (input.type === "TRANSFER") {
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

import { PrismaClient } from "@prisma/client";

import { validateBalancedEntries } from "./validators";
import { PostTransactionInput } from "./types";

const prisma = new PrismaClient();

export class PostingService {
  async postTransaction(input: PostTransactionInput) {
    validateBalancedEntries(input.entries);

    return prisma.$transaction(async (tx) => {
      // idempotency check
      const existing = await tx.transaction.findUnique({
        where: {
          reference: input.reference,
        },
      });

      if (existing) {
        return existing;
      }

      // create transaction
      const transaction = await tx.transaction.create({
        data: {
          reference: input.reference,
          type: input.type,
          status: "POSTED",
        },
      });

      // create ledger entries
      for (const entry of input.entries) {
        await tx.ledgerEntry.create({
          data: {
            transactionId: transaction.id,
            accountId: entry.accountId,
            debit: entry.debit,
            credit: entry.credit,
            description: entry.description ?? null,
          },
        });
      }

      return transaction;
    });
  }
}

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BalanceService {
  async getAccountBalance(accountId: string) {
    const entries = await prisma.ledgerEntry.findMany({
      where: { accountId },
      select: {
        credit: true,
        debit: true,
      },
    });

    const balance = entries.reduce((acc, entry) => {
      const credit = Number(entry.credit ?? 0);
      const debit = Number(entry.debit ?? 0);

      return acc + (credit - debit);
    }, 0);

    return {
      accountId,
      balance,
    };
  }
}

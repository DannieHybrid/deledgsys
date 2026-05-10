import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class BalanceService {
  async getAccountBalance(accountId: string) {
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        accountId,
      },
    });

    const totalCredits = entries.reduce(
      (sum, entry) => sum + Number(entry.credit),
      0
    );

    const totalDebits = entries.reduce(
      (sum, entry) => sum + Number(entry.debit),
      0
    );

    const balance = totalCredits - totalDebits;

    return {
      accountId,
      totalCredits,
      totalDebits,
      balance,
    };
  }
}

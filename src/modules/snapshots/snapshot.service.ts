import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class SnapshotService {
  async upsertAccountSnapshot(accountId: string) {
    const entries = await prisma.ledgerEntry.findMany({
      where: { accountId },
    });

    const balance = entries.reduce((acc, entry) => {
      return (
        acc + Number(entry.credit.toString()) - Number(entry.debit.toString())
      );
    }, 0);

    return prisma.balanceSnapshot.upsert({
      where: {
        accountId,
      },
      update: {
        balance,
      },
      create: {
        accountId,
        balance,
      },
    });
  }
}

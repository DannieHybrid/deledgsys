import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class ReconciliationService {
  /**
   * Recompute ledger balance and compare with snapshot
   */
  async reconcileAccount(accountId: string) {
    // 1. get ledger entries (source of truth)
    const entries = await prisma.ledgerEntry.findMany({
      where: { accountId },
      select: {
        debit: true,
        credit: true,
      },
    });

    const ledgerBalance = entries.reduce((acc, entry) => {
      const debit = Number(entry.debit ?? 0);
      const credit = Number(entry.credit ?? 0);

      return acc + (credit - debit);
    }, 0);

    // 2. get snapshot (cached balance)
    const snapshot = await prisma.balanceSnapshot.findUnique({
      where: { accountId },
    });

    if (!snapshot) {
      return {
        accountId,
        status: "NO_SNAPSHOT",
        ledgerBalance,
        snapshotBalance: null,
        diff: null,
      };
    }

    const snapshotBalance = Number(snapshot.balance);

    // 3. compare
    const diff = ledgerBalance - snapshotBalance;

    const isValid = Math.abs(diff) < 0.01; // float safety buffer

    return {
      accountId,
      status: isValid ? "OK" : "MISMATCH",
      ledgerBalance,
      snapshotBalance,
      diff,
    };
  }

  /**
   * Run reconciliation for all accounts
   */
  async reconcileAllAccounts() {
    const accounts = await prisma.account.findMany({
      select: { id: true },
    });

    const results = [];

    for (const account of accounts) {
      const result = await this.reconcileAccount(account.id);
      results.push(result);
    }

    return results;
  }
}

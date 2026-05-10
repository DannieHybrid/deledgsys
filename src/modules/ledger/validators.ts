import { LedgerEntryInput } from "./types";

export function validateBalancedEntries(entries: LedgerEntryInput[]) {
  const totalDebits = entries.reduce((sum, entry) => sum + entry.debit, 0);

  const totalCredits = entries.reduce((sum, entry) => sum + entry.credit, 0);

  if (totalDebits !== totalCredits) {
    throw new Error(
      `Unbalanced transaction: debits=${totalDebits}, credits=${totalCredits}`
    );
  }
}

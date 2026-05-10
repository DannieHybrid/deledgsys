export type LedgerEntryInput = {
  accountId: string;
  debit: number;
  credit: number;
  description?: string;
};

export type PostTransactionInput = {
  reference: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | "REFUND" | "REVERSAL";

  entries: LedgerEntryInput[];
};

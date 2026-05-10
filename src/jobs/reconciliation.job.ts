import { ReconciliationService } from "../modules/reconciliation/reconciliation.service";

const recon = new ReconciliationService();

/**
 * Simple interval-based reconciliation worker
 */
async function runReconciliationJob() {
  console.log("Starting reconciliation job...");

  const results = await recon.reconcileAllAccounts();

  const mismatches = results.filter((r) => r.status !== "OK");

  console.log(`Total accounts checked: ${results.length}`);
  console.log(`Mismatches found: ${mismatches.length}`);

  if (mismatches.length > 0) {
    console.log("⚠️ Inconsistencies detected:");
    console.table(mismatches);
  }

  console.log("Reconciliation job completed.");
}

// Run every 10 minutes
setInterval(runReconciliationJob, 10 * 60 * 1000);

// optional immediate run on startup
runReconciliationJob();

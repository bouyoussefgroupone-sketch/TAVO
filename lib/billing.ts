export function calculateCommission(grossCents: number, commissionBps: number) {
  if (!Number.isInteger(grossCents) || grossCents < 0) throw new Error("Invalid gross amount");
  if (!Number.isInteger(commissionBps) || commissionBps < 0 || commissionBps > 10000) throw new Error("Invalid commission rate");
  return Math.round(grossCents * commissionBps / 10000);
}

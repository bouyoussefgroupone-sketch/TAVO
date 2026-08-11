export function visitReference(sequence: number) {
  if (!Number.isInteger(sequence) || sequence < 1) throw new Error("Invalid visit sequence");
  return `G${String(sequence).padStart(3, "0")}`;
}

export function orderReference(visit: string, sequence: number) {
  if (!/^G\d{3,}$/.test(visit) || !Number.isInteger(sequence) || sequence < 1) throw new Error("Invalid order sequence");
  return `${visit}-${String(sequence).padStart(2, "0")}`;
}

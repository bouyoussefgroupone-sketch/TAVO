if (process.env.TAVO_ALLOW_PRODUCTION_SEED === "true") {
  await import("./seed");
} else {
  console.log("TAVO production bootstrap is disabled; seed skipped.");
}

export {};

import { importPKCS8, SignJWT } from "jose";

export const TAVO_WALLET_ISSUER_ID = "338800000023172711";
export const TAVO_WALLET_CLASS_SUFFIX = "tavo_pass_rabat_01";
export const TAVO_WALLET_OBJECT_SUFFIX = "tavo_rabat_edition01";
export const TAVO_PUBLIC_URL = "https://tavo-eight.vercel.app";

type Environment = Record<string, string | undefined>;

export type GoogleWalletConfig = {
  serviceAccountEmail: string;
  privateKey: string;
  issuerId: string;
  classId: string;
  objectId: string;
  publicUrl: string;
};

export class GoogleWalletConfigurationError extends Error {
  constructor() {
    super("Google Wallet is not configured");
    this.name = "GoogleWalletConfigurationError";
  }
}

function qualifiedId(issuerId: string, value: string) {
  return value.startsWith(`${issuerId}.`) ? value : `${issuerId}.${value}`;
}

export function readGoogleWalletConfig(environment: Environment = process.env): GoogleWalletConfig {
  const serviceAccountEmail = environment.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = environment.GOOGLE_WALLET_PRIVATE_KEY?.replace(/\\n/g, "\n").trim();
  const issuerId = environment.GOOGLE_WALLET_ISSUER_ID?.trim() || TAVO_WALLET_ISSUER_ID;
  const classValue = environment.GOOGLE_WALLET_CLASS_ID?.trim() || TAVO_WALLET_CLASS_SUFFIX;
  const objectValue = TAVO_WALLET_OBJECT_SUFFIX;
  const publicUrl = TAVO_PUBLIC_URL;

  if (!serviceAccountEmail || !privateKey?.includes("BEGIN PRIVATE KEY") || !/^\d+$/.test(issuerId) || !publicUrl.startsWith("https://")) {
    throw new GoogleWalletConfigurationError();
  }

  const classId = qualifiedId(issuerId, classValue);
  const objectId = qualifiedId(issuerId, objectValue);
  if (
    classId !== `${TAVO_WALLET_ISSUER_ID}.${TAVO_WALLET_CLASS_SUFFIX}` ||
    objectId !== `${TAVO_WALLET_ISSUER_ID}.${TAVO_WALLET_OBJECT_SUFFIX}`
  ) {
    throw new GoogleWalletConfigurationError();
  }

  return { serviceAccountEmail, privateKey, issuerId, classId, objectId, publicUrl };
}

function localized(value: string) {
  return { defaultValue: { language: "fr-FR", value } };
}

export function buildGoogleWalletObject(config: GoogleWalletConfig) {
  return {
    id: config.objectId,
    classId: config.classId,
    state: "ACTIVE",
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: "#cf3f27",
    logo: { sourceUri: { uri: `${config.publicUrl}/images/tavo-wallet-logo.png` }, contentDescription: localized("Monogramme TAVO") },
    cardTitle: localized("TAVO"),
    subheader: localized("RABAT · ÉDITION 01"),
    header: localized("Qu’est-ce qu’on mange aujourd’hui ?"),
    textModulesData: [{ id: "pass_type", header: "PASS CULINAIRE", body: "TAVO · RABAT · ÉDITION 01" }],
    linksModuleData: { uris: [{ id: "open_tavo", uri: `${config.publicUrl}/`, description: "OUVRIR TAVO" }] },
  };
}

export async function createGoogleWalletSaveLink(
  config = readGoogleWalletConfig(),
  issuedAt = Math.floor(Date.now() / 1000),
) {
  const signingKey = await importPKCS8(config.privateKey, "RS256");
  const jwt = await new SignJWT({
    typ: "savetowallet",
    origins: [],
    payload: { genericObjects: [buildGoogleWalletObject(config)] },
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(config.serviceAccountEmail)
    .setAudience("google")
    .setIssuedAt(issuedAt)
    .sign(signingKey);

  return `https://pay.google.com/gp/v/save/${jwt}`;
}

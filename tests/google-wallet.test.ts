import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import fs from "node:fs/promises";
import { decodeJwt, importSPKI, jwtVerify } from "jose";
import { buildGoogleWalletObject, createGoogleWalletSaveLink, GoogleWalletConfigurationError, readGoogleWalletConfig, TAVO_WALLET_CLASS_SUFFIX, TAVO_WALLET_ISSUER_ID } from "../lib/google-wallet";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privatePem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();
const publicPem = publicKey.export({ type: "spki", format: "pem" }).toString();
const environment = { GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL: "wallet-test@example.iam.gserviceaccount.com", GOOGLE_WALLET_PRIVATE_KEY: privatePem };

test("Google Wallet pass uses the approved stable class, object and TAVO copy", () => {
  const config = readGoogleWalletConfig(environment);
  const object = buildGoogleWalletObject(config);
  assert.equal(config.classId, `${TAVO_WALLET_ISSUER_ID}.${TAVO_WALLET_CLASS_SUFFIX}`);
  assert.equal(object.id, `${TAVO_WALLET_ISSUER_ID}.tavo_rabat_edition01`);
  assert.equal(object.cardTitle.defaultValue.value, "TAVO");
  assert.equal(object.subheader.defaultValue.value, "RABAT · ÉDITION 01");
  assert.equal(object.header.defaultValue.value, "Qu’est-ce qu’on mange aujourd’hui ?");
  assert.equal(object.linksModuleData.uris[0].description, "OUVRIR TAVO");
});

test("Google Wallet save link is an RS256 server-signed Google JWT", async () => {
  const saveUrl = await createGoogleWalletSaveLink(readGoogleWalletConfig(environment), 1_786_000_000);
  assert.ok(saveUrl.startsWith("https://pay.google.com/gp/v/save/"));
  const token = saveUrl.split("/").at(-1)!;
  const key = await importSPKI(publicPem, "RS256");
  const { payload, protectedHeader } = await jwtVerify(token, key, { issuer: environment.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL, audience: "google" });
  assert.equal(protectedHeader.alg, "RS256");
  assert.equal(payload.typ, "savetowallet");
  assert.deepEqual(payload.origins, []);
  assert.equal((payload.payload as { genericObjects: unknown[] }).genericObjects.length, 1);
  assert.ok(token.length < 1800);
  assert.equal(JSON.stringify(decodeJwt(token)).includes("PRIVATE KEY"), false);
});

test("missing credentials fail closed without exposing configuration details", () => {
  assert.throws(() => readGoogleWalletConfig({}), GoogleWalletConfigurationError);
  assert.throws(() => readGoogleWalletConfig({ ...environment, GOOGLE_WALLET_CLASS_ID: "another_class" }), GoogleWalletConfigurationError);
});

test("the TAVO wallet page uses the real integration and official French button asset", async () => {
  const [pageSource, componentSource, buttonSource] = await Promise.all([
    fs.readFile("app/tavo-app.tsx", "utf8"),
    fs.readFile("app/wallet/google-wallet-button.tsx", "utf8"),
    fs.readFile("public/images/add-to-google-wallet-fr.svg", "utf8"),
  ]);
  assert.match(pageSource, /<GoogleWalletButton \/>/);
  assert.doesNotMatch(pageSource, /Carte TAVO simulée/);
  assert.match(componentSource, /\/images\/add-to-google-wallet-fr\.svg/);
  assert.match(componentSource, /alt="Ajouter à Google Wallet"/);
  assert.match(buttonSource, /width="199" height="55"/);
});

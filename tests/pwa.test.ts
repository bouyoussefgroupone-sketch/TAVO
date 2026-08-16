import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import manifest from "../app/manifest";
import {
  detectPwaEnvironment,
  isInstallDismissed,
  PWA_DISMISSAL_MS,
  requestNativeInstall,
  selectInstallSurface,
  type BeforeInstallPromptLike,
} from "../lib/pwa";

const IOS_SAFARI =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1";

test("manifest exposes the installable TAVO standalone identity", async () => {
  const value = manifest();
  assert.equal(value.name, "TAVO");
  assert.equal(value.short_name, "TAVO");
  assert.equal(value.id, "/");
  assert.equal(value.start_url, "/");
  assert.equal(value.scope, "/");
  assert.equal(value.display, "standalone");
  assert.equal(value.theme_color, "#cf3f27");
  assert.equal(value.background_color, "#f3efe6");
  assert.ok(value.icons?.some((icon) => icon.sizes === "192x192"));
  assert.ok(value.icons?.some((icon) => icon.sizes === "512x512" && icon.purpose === "maskable"));

  for (const path of [
    "public/icons/tavo-apple-touch-icon.png",
    "public/icons/tavo-icon-192.png",
    "public/icons/tavo-icon-512.png",
    "public/icons/tavo-icon-maskable-512.png",
  ]) {
    assert.ok((await fs.stat(path)).size > 0, `${path} should exist`);
  }
});

test("standalone mode never exposes an install surface", () => {
  const environment = detectPwaEnvironment({
    userAgent: IOS_SAFARI,
    platform: "iPhone",
    maxTouchPoints: 5,
    displayModeStandalone: true,
    navigatorStandalone: false,
  });
  assert.equal(environment.installed, true);
  assert.equal(selectInstallSurface(environment, true, false), null);
});

test("Android native prompt runs only after the explicit install action", async () => {
  let promptCalls = 0;
  const promptEvent: BeforeInstallPromptLike = {
    prompt: async () => {
      promptCalls += 1;
    },
    userChoice: Promise.resolve({ outcome: "accepted", platform: "web" }),
  };

  assert.equal(promptCalls, 0);
  const choice = await requestNativeInstall(promptEvent);
  assert.equal(promptCalls, 1);
  assert.equal(choice.outcome, "accepted");
});

test("dismissal persists locally for seven days and then expires", () => {
  const now = 1_800_000_000_000;
  assert.equal(isInstallDismissed(String(now - PWA_DISMISSAL_MS + 1), now), true);
  assert.equal(isInstallDismissed(String(now - PWA_DISMISSAL_MS), now), false);
  assert.equal(isInstallDismissed(null, now), false);
});

test("iOS Safari receives guidance while unsupported browsers receive no broken install button", () => {
  const ios = detectPwaEnvironment({
    userAgent: IOS_SAFARI,
    platform: "iPhone",
    maxTouchPoints: 5,
    displayModeStandalone: false,
    navigatorStandalone: false,
  });
  assert.equal(selectInstallSurface(ios, false, false), "ios");

  const unsupported = detectPwaEnvironment({
    userAgent: "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36",
    platform: "Linux armv8l",
    maxTouchPoints: 5,
    displayModeStandalone: false,
    navigatorStandalone: false,
  });
  assert.equal(selectInstallSurface(unsupported, false, false), null);
});

test("in-app browsers get contextual guidance without a fake native prompt", () => {
  const instagram = detectPwaEnvironment({
    userAgent: `${IOS_SAFARI} Instagram 350.0.0`,
    platform: "iPhone",
    maxTouchPoints: 5,
    displayModeStandalone: false,
    navigatorStandalone: false,
  });
  assert.equal(instagram.inAppBrowser, true);
  assert.equal(selectInstallSurface(instagram, false, false), "in-app");
});

test("Samsung Internet never receives the WebAPK install path and is directed to Chrome", async () => {
  const samsung = detectPwaEnvironment({
    userAgent:
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/117.0.0.0 Mobile Safari/537.36",
    platform: "Linux armv8l",
    maxTouchPoints: 5,
    displayModeStandalone: false,
    navigatorStandalone: false,
  });
  assert.equal(samsung.samsungBrowserVersion, "24.0");
  assert.equal(selectInstallSurface(samsung, true, false), "samsung");

  const component = await fs.readFile("app/pwa-install-experience.tsx", "utf8");
  assert.match(component, /Pour installer TAVO, ouvrez cette page dans Chrome\./);
});

test("Chrome Android keeps the deferred native PWA install path", () => {
  const chrome = detectPwaEnvironment({
    userAgent:
      "Mozilla/5.0 (Linux; Android 16; Pixel 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
    platform: "Linux armv8l",
    maxTouchPoints: 5,
    displayModeStandalone: false,
    navigatorStandalone: false,
  });
  assert.equal(chrome.samsungBrowserVersion, null);
  assert.equal(selectInstallSurface(chrome, true, false), "android");
});

test("PWA integration stays scoped to Home and never caches live APIs", async () => {
  const [home, crown, worker, goRoute] = await Promise.all([
    fs.readFile("app/page.tsx", "utf8"),
    fs.readFile("app/crown/page.tsx", "utf8"),
    fs.readFile("public/sw.js", "utf8"),
    fs.readFile("app/go/route.ts", "utf8"),
  ]);
  assert.match(home, /<PwaInstallExperience \/>/);
  assert.doesNotMatch(crown, /PwaInstallExperience/);
  assert.doesNotMatch(worker, /cache\.put|\/api\//);
  assert.match(worker, /event\.request\.mode !== "navigate"/);
  assert.match(goRoute, /searchParams\.forEach/);
  assert.match(goRoute, /NextResponse\.redirect\(destination, 307\)/);
});

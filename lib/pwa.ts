export const PWA_DISMISSAL_KEY = "tavo:pwa-install-dismissed-at";
export const PWA_DISMISSAL_MS = 7 * 24 * 60 * 60 * 1000;

export type InstallSurface = "android" | "ios" | "in-app" | "samsung" | null;

export type PwaEnvironment = {
  installed: boolean;
  ios: boolean;
  iosSafari: boolean;
  inAppBrowser: boolean;
  samsungBrowserVersion: string | null;
};

export type BeforeInstallPromptChoice = {
  outcome: "accepted" | "dismissed";
  platform: string;
};

export type BeforeInstallPromptLike = {
  prompt: () => Promise<void>;
  userChoice: Promise<BeforeInstallPromptChoice>;
};

export function detectPwaEnvironment({
  userAgent,
  platform,
  maxTouchPoints,
  displayModeStandalone,
  navigatorStandalone,
}: {
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
  displayModeStandalone: boolean;
  navigatorStandalone: boolean;
}): PwaEnvironment {
  const ios = /iPhone|iPad|iPod/i.test(userAgent) || (platform === "MacIntel" && maxTouchPoints > 1);
  const inAppBrowser = /Instagram|FBAN|FBAV|TikTok|BytedanceWebview/i.test(userAgent);
  const samsungBrowserVersion = userAgent.match(/SamsungBrowser\/([\d.]+)/i)?.[1] ?? null;
  const webkit = /WebKit/i.test(userAgent);
  const alternativeIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(userAgent);

  return {
    installed: displayModeStandalone || navigatorStandalone,
    ios,
    iosSafari: ios && webkit && !alternativeIosBrowser && !inAppBrowser,
    inAppBrowser,
    samsungBrowserVersion,
  };
}

export function isInstallDismissed(value: string | null, now = Date.now()) {
  if (!value) return false;
  const dismissedAt = Number(value);
  return Number.isFinite(dismissedAt) && dismissedAt > 0 && now - dismissedAt < PWA_DISMISSAL_MS;
}

export function selectInstallSurface(
  environment: PwaEnvironment,
  promptAvailable: boolean,
  dismissed: boolean,
): InstallSurface {
  if (environment.installed || dismissed) return null;
  if (environment.samsungBrowserVersion) return "samsung";
  if (environment.inAppBrowser) return "in-app";
  if (promptAvailable) return "android";
  if (environment.iosSafari) return "ios";
  return null;
}

export async function requestNativeInstall(promptEvent: BeforeInstallPromptLike) {
  await promptEvent.prompt();
  return promptEvent.userChoice;
}

"use client";

import { useEffect, useState } from "react";
import {
  detectPwaEnvironment,
  isInstallDismissed,
  PWA_DISMISSAL_KEY,
  requestNativeInstall,
  selectInstallSurface,
  type BeforeInstallPromptLike,
  type PwaEnvironment,
} from "@/lib/pwa";

const EMPTY_ENVIRONMENT: PwaEnvironment = {
  installed: true,
  ios: false,
  iosSafari: false,
  inAppBrowser: false,
};

type BeforeInstallPromptEvent = Event & BeforeInstallPromptLike;

function readBrowserEnvironment() {
  if (typeof window === "undefined") return EMPTY_ENVIRONMENT;
  return detectPwaEnvironment({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
    displayModeStandalone: window.matchMedia("(display-mode: standalone)").matches,
    navigatorStandalone: Boolean((navigator as Navigator & { standalone?: boolean }).standalone),
  });
}

function readDismissedState() {
  if (typeof window === "undefined") return true;
  try {
    return isInstallDismissed(window.localStorage.getItem(PWA_DISMISSAL_KEY));
  } catch {
    return false;
  }
}

export function PwaInstallExperience() {
  const [environment, setEnvironment] = useState<PwaEnvironment>(readBrowserEnvironment);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(readDismissedState);

  useEffect(() => {
    const adOrigin = new URLSearchParams(window.location.search).has("utm_source");
    const revealTimer = window.setTimeout(() => setReady(true), adOrigin ? 2600 : 4200);

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const markInstalled = () => {
      setEnvironment((current) => ({ ...current, installed: true }));
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", capturePrompt);
    window.addEventListener("appinstalled", markInstalled);

    if ("serviceWorker" in navigator && (window.isSecureContext || window.location.hostname === "localhost")) {
      void navigator.serviceWorker.register("/sw.js", { scope: "/" });
    }

    return () => {
      window.clearTimeout(revealTimer);
      window.removeEventListener("beforeinstallprompt", capturePrompt);
      window.removeEventListener("appinstalled", markInstalled);
    };
  }, []);

  const surface = selectInstallSurface(environment, deferredPrompt !== null, dismissed || !ready);

  const dismiss = () => {
    try {
      window.localStorage.setItem(PWA_DISMISSAL_KEY, String(Date.now()));
    } catch {
      // Browsing remains available when storage is restricted.
    }
    setDismissed(true);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    const choice = await requestNativeInstall(deferredPrompt);
    setDeferredPrompt(null);
    if (choice.outcome === "dismissed") dismiss();
  };

  if (!surface) return null;

  return (
    <aside className={`pwa-install-sheet pwa-install-${surface}`} role="dialog" aria-label="Installer TAVO">
      <span className="pwa-install-monogram" aria-hidden="true">T</span>
      <div className="pwa-install-copy">
        {surface === "in-app" ? (
          <>
            <strong>Ouvrez TAVO dans votre navigateur</strong>
            <p>Utilisez le menu de cette application, puis « Ouvrir dans le navigateur ».</p>
          </>
        ) : surface === "ios" ? (
          <>
            <strong>Ajoutez TAVO à votre écran d’accueil</strong>
            <p><span aria-hidden="true">□↑</span> Partager → Ajouter à l’écran d’accueil</p>
          </>
        ) : (
          <>
            <strong>Gardez TAVO à portée de main</strong>
            <p>Ajoutez TAVO à votre écran d’accueil.</p>
          </>
        )}
      </div>
      <div className="pwa-install-actions">
        {surface === "android" && (
          <button className="pwa-install-primary" type="button" onClick={() => void install()}>
            Ajouter TAVO
          </button>
        )}
        <button className="pwa-install-secondary" type="button" onClick={dismiss}>
          {surface === "android" ? "Plus tard" : "Continuer"}
        </button>
      </div>
    </aside>
  );
}

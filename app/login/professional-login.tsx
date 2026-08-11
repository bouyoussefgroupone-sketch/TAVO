"use client";
/* eslint-disable @next/next/no-html-link-for-pages */

import { FormEvent, useState } from "react";

export function ProfessionalLogin() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Connexion impossible.");
      setLoading(false);
      return;
    }
    window.location.href = result.redirectTo;
  }

  return <main className="login-page">
    <section className="login-brand"><a className="brand brand-light" href="/"><span>T</span><b>TAVO</b></a><p>Le catalogue, les partenaires et les opérations — dans un seul espace.</p><small>ACCÈS PROFESSIONNEL · RABAT</small></section>
    <section className="login-panel"><form onSubmit={submit}><p className="eyebrow">Espace professionnel</p><h1>Bienvenue.</h1><p>Connectez-vous avec votre accès Admin, Manager ou Partenaire.</p><label>Email<input name="email" type="email" required autoComplete="username" placeholder="vous@tavo.local" /></label><label>Mot de passe<input name="password" type="password" required minLength={8} autoComplete="current-password" /></label>{error && <div className="login-error" role="alert">{error}</div>}<button disabled={loading}>{loading ? "CONNEXION…" : "SE CONNECTER →"}</button><a href="/">← Retour à TAVO</a></form></section>
  </main>;
}

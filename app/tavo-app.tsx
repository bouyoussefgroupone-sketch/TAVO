"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element, @typescript-eslint/no-unused-vars */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { TavoData } from "@/lib/catalog";

type Screen =
  | "wallet"
  | "home"
  | "search"
  | "collection"
  | "dish"
  | "restaurant"
  | "crown"
  | "crown-detail"
  | "partner"
  | "manager"
  | "admin";
type CartItem = { offerId: number; name: string; price: number; qty: number };
type MenuDisplayItem = { offerId: number; name: string; note: string; price: number; image: string; tag: string };

const menu = [
  {
    name: "César Signature",
    note: "Poulet fermier, vieux parmesan",
    price: 68,
    image: "/images/cesar-signature.webp",
    tag: "Best-seller",
  },
  {
    name: "Carottes rôties",
    note: "Harissa douce, labneh fumé",
    price: 52,
    image: "/images/tavo-table.webp",
    tag: "Végétarien",
  },
  {
    name: "Couscous safran",
    note: "Légumes de saison, grenade",
    price: 78,
    image: "/images/tavo-table.webp",
    tag: "Signature",
  },
  {
    name: "Pavlova agrumes",
    note: "Fleur d’oranger, pistache",
    price: 46,
    image: "/images/crown-dinner.webp",
    tag: "Nouveau",
  },
];

const offers = [
  {
    name: "Atelier Noya",
    area: "Agdal",
    price: 68,
    distance: "1,8 km",
    tone: "Cuisine vive · produits locaux",
  },
  {
    name: "Maison Jun",
    area: "Hay Riad",
    price: 72,
    distance: "4,2 km",
    tone: "Cuisine contemporaine",
  },
  {
    name: "Le Verger",
    area: "Souissi",
    price: 76,
    distance: "5,6 km",
    tone: "Jardin · service continu",
  },
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      className={`brand ${light ? "brand-light" : ""}`}
      href="/"
      aria-label="Accueil TAVO"
    >
      <span>T</span>
      <b>TAVO</b>
    </a>
  );
}

function ClientNav({ dark = false }: { dark?: boolean }) {
  return (
    <header className={`client-nav ${dark ? "nav-dark" : ""}`}>
      <Brand light={dark} />
      <nav aria-label="Navigation principale">
        <a href="/search">Explorer</a>
        <a href="/crown" className="crown-link">
          <span>✦</span> Crown
        </a>
      </nav>
    </header>
  );
}

function ImageCard({
  title,
  meta,
  image,
  href = "/dish/cesar-signature",
  tall = false,
}: {
  title: string;
  meta: string;
  image: string;
  href?: string;
  tall?: boolean;
}) {
  return (
    <a className={`image-card ${tall ? "image-card-tall" : ""}`} href={href}>
      <img src={image} alt="" />
      <span className="shade" />
      <span className="image-copy">
        <small>{meta}</small>
        <strong>{title}</strong>
        <i>
          Découvrir <b>↗</b>
        </i>
      </span>
    </a>
  );
}

function Wallet() {
  return (
    <main className="wallet-screen">
      <div className="wallet-glow" />
      <section className="wallet-copy">
        <Brand light />
        <p className="eyebrow">Depuis votre Wallet</p>
        <h1>
          Votre prochaine envie
          <br />
          commence ici.
        </h1>
        <p>
          Les plats et expériences qui valent le détour, sélectionnés à Rabat.
        </p>
        <a className="button button-cream" href="/">
          Ouvrir TAVO <span>→</span>
        </a>
        <small>Accès instantané · aucune donnée personnelle requise</small>
      </section>
      <div className="wallet-card" aria-label="Carte TAVO simulée">
        <div className="wallet-card-top">
          <span className="tavo-monogram">T</span>
          <span>
            RABAT
            <br />
            <b>ÉDITION 01</b>
          </span>
        </div>
        <div className="wallet-word">TAVO</div>
        <p>Qu’est-ce qu’on mange aujourd’hui ?</p>
        <div className="wallet-line">
          <span>PASS CULINAIRE</span>
          <span>•••</span>
        </div>
      </div>
    </main>
  );
}

function Home({ data }: { data?: TavoData }) {
  const homeCategories = data?.categories ?? [];
  const homeCollections = data?.collections.slice(0, 3) ?? [];
  const featured = data?.dishes[0];
  return (
    <main className="client-page home-page">
      <ClientNav />
      <section className="home-hero">
        <img
          src="/images/tavo-table.webp"
          alt="Table contemporaine de plats marocains"
        />
        <div className="home-hero-shade" />
        <div className="home-hero-copy">
          <p className="eyebrow">Rabat · aujourd’hui</p>
          <h1>
            Qu’est-ce qu’on
            <br />
            mange aujourd’hui&nbsp;?
          </h1>
          <form action="/search" className="hero-search">
            <span>⌕</span>
            <input
              name="q"
              aria-label="Rechercher un plat"
              placeholder="Une salade, un dessert, un couscous…"
            />
            <button>Explorer</button>
          </form>
        </div>
        <div className="hero-counter">
          <b>01</b>
          <span />
          <small>04</small>
        </div>
      </section>

      <section className="category-strip wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Suivez votre envie</p>
            <h2>À table.</h2>
          </div>
          <a href="/search">Tout explorer →</a>
        </div>
        <div className="category-list">
          {homeCategories.map((item, i) => (
            <a key={item.id} href={`/search?category=${item.slug}`}>
              <span>0{i + 1}</span>
              {item.name}
            </a>
          ))}
        </div>
      </section>

      <section className="editorial-grid wrap">
        <ImageCard
          title={featured?.name ?? "César, autrement."}
          meta="Choix de la rédaction"
          image={featured?.image_url ?? "/images/cesar-signature.webp"}
          href={featured ? `/dish/${featured.slug}` : "/dish/cesar-signature"}
          tall
        />
        <div className="editorial-note">
          <span className="quote-mark">“</span>
          <p>
            On ne choisit plus une adresse au hasard. On choisit d’abord ce qui
            nous fait vraiment envie.
          </p>
          <small>LE MANIFESTE TAVO</small>
        </div>
        <ImageCard
          title="Le déjeuner solaire"
          meta="Collection · Frais & vif"
          image="/images/tavo-table.webp"
          href="/collection/frais-et-vif"
        />
      </section>

      <section className="collection-band">
        <div className="wrap">
          <div className="section-heading light">
            <div>
              <p className="eyebrow">Collections du moment</p>
              <h2>Des envies, bien choisies.</h2>
            </div>
            <a href="/collection/frais-et-vif">Voir la collection →</a>
          </div>
          <div className="collection-row">
            {homeCollections.map((c, index) => (
              <a href={`/collection/${c.slug}`} key={c.id}>
                <span>0{index + 1}</span>
                <strong>{c.name}</strong>
                <p>{c.description}</p>
                <i>→</i>
              </a>
            ))}
          </div>
        </div>
      </section>

      <a className="crown-teaser" href="/crown">
        <img
          src="/images/crown-dinner.webp"
          alt="Expérience Crown, dîner pour deux"
        />
        <span className="shade" />
        <span className="crown-teaser-copy">
          <small>TAVO PRÉSENTE</small>
          <b>✦ CROWN</b>
          <h2>
            Le dîner devient
            <br />
            une histoire.
          </h2>
          <i>Entrer dans Crown →</i>
        </span>
      </a>
      <ClientFooter />
    </main>
  );
}

function Search({ data }: { data?: TavoData }) {
  const [query, setQuery] = useState(data?.searchQuery ?? "");
  const [category, setCategory] = useState(data?.searchCategory ?? "");
  const dishes = data?.dishes ?? [];
  const filtered = dishes.filter((dish) => {
    const matchesQuery = `${dish.name} ${dish.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (!category || dish.category_slug === category);
  });
  return (
    <main className="client-page pale-page explorer-page">
      <ClientNav />
      <section className="search-intro wrap">
        <p className="eyebrow">Catalogue TAVO · Rabat</p>
        <h1>De quoi avez-vous envie&nbsp;?</h1>
        <div className="search-box">
          <span>⌕</span>
          <input
            aria-label="Rechercher un plat"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un plat"
          />
          <small>{filtered.length} résultats</small>
        </div>
      </section>
      <section className="filters wrap explorer-category-rail" aria-label="Catégories">
        <button className={!category ? "active" : ""} onClick={() => setCategory("")} aria-pressed={!category}>Tout</button>
        {data?.categories.map((item) => (
          <button className={category === item.slug ? "active" : ""} onClick={() => setCategory(item.slug)} aria-pressed={category === item.slug} key={item.id}>
            {item.name}
          </button>
        ))}
      </section>
      <section className="dish-results wrap">
        {filtered.map((dish, i) => (
          <a href={`/dish/${dish.slug}`} className="dish-result" key={dish.id}>
            <div className="dish-thumb">
              <img
                src={
                  dish.image_url ?? "/images/tavo-table.webp"
                }
                alt=""
              />
              <span>{i < 2 ? "NOUVEAU" : "TAVO"}</span>
            </div>
            <div>
              <small>
                {dish.category_name ?? "PLAT"} · À PARTIR DE {(dish.from_price_cents / 100).toFixed(0)} MAD
              </small>
              <h2>{dish.name}</h2>
              <p>{dish.description}</p>
              <span className="labels">
                {dish.labels.slice(0, 2).map((label) => <i key={label}>{label}</i>)}
              </span>
            </div>
            <b>↗</b>
          </a>
        ))}
      </section>
      <ClientFooter />
    </main>
  );
}

function Collection({ data }: { data?: TavoData }) {
  const collection = data?.collection;
  const collectionDishes = collection?.dishes ?? [];
  return (
    <main className="client-page pale-page">
      <ClientNav />
      <section className="collection-hero">
        <img src={collection?.cover_url ?? "/images/tavo-table.webp"} alt="Plats frais et colorés" />
        <span className="shade" />
        <div>
          <p className="eyebrow">Collection TAVO · Rabat</p>
          <h1>
            {collection?.name ?? "Frais & vif"}.
          </h1>
          <p>
            {collection?.description ?? "Des plats pleins d’herbes, de croquant et d’acidité."}
          </p>
        </div>
      </section>
      <section className="collection-dishes wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{collectionDishes.length} assiettes · sélection dynamique</p>
            <h2>Dans cette collection</h2>
          </div>
        </div>
        <div className="tiles">
          {collectionDishes.slice(0, 3).map((dish) => <ImageCard
            key={dish.id}
            title={dish.name}
            meta={`À partir de ${(dish.from_price_cents / 100).toFixed(0)} MAD`}
            image={dish.image_url ?? "/images/tavo-table.webp"}
            href={`/dish/${dish.slug}`}
            tall
          />)}
        </div>
      </section>
      <ClientFooter />
    </main>
  );
}

function Dish({ data }: { data?: TavoData }) {
  const dish = data?.dish;
  if (!dish) return <main className="client-page pale-page"><ClientNav/><section className="search-intro wrap"><h1>Plat indisponible.</h1><a href="/search">Retour au catalogue</a></section></main>;
  return (
    <main className="client-page dish-page">
      <ClientNav />
      <section className="dish-hero">
        <div className="dish-photo">
          <img src={dish.image_url ?? "/images/tavo-table.webp"} alt={dish.name} />
          <a className="back-link" href="/search">
            ← Explorer
          </a>
          <span className="photo-index">01 / 03</span>
        </div>
        <div className="dish-copy">
          <p className="eyebrow">{dish.category_name} · TAVO sélection</p>
          <h1>{dish.name}.</h1>
          <p className="dish-lede">{dish.description}</p>
          <div className="dish-facts">
            <span>
              <small>À PARTIR DE</small>
              <b>{(dish.from_price_cents / 100).toFixed(0)} MAD</b>
            </span>
            <span>
              <small>ÉNERGIE</small>
              <b>{dish.kcal_status === "ESTIMATED" ? "≈ " : ""}{dish.kcal ?? "—"} kcal</b>
              <i>{dish.kcal_status ?? "NON RENSEIGNÉ"}</i>
            </span>
          </div>
          <div className="tag-row">
            {dish.labels.map((label) => <span key={label}>{label}</span>)}
          </div>
          <div className="ingredients">
            <small>INGRÉDIENTS PRINCIPAUX</small>
            <p>{dish.ingredients}</p>
          </div>
          <a className="text-link" href="#offers">
            Choisir une adresse ↓
          </a>
        </div>
      </section>
      <section id="offers" className="offers wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Une envie, plusieurs adresses</p>
            <h2>Où la déguster&nbsp;?</h2>
          </div>
          <span className="location-note">
            ◎ Distance indicative · localisation temporaire
          </span>
        </div>
        <div className="offer-list">
          {dish.offers.map((o, i) => (
            <a href={`/restaurant/${o.restaurant_slug}`} key={o.offer_id} className="offer">
              <span className="offer-no">0{i + 1}</span>
              <div>
                <h3>{o.restaurant_name}</h3>
                <p>{o.sector} · {o.description}</p>
              </div>
              <span className="offer-distance">Distance sur demande</span>
              <strong>{(o.price_cents / 100).toFixed(0)} MAD</strong>
              <i>→</i>
            </a>
          ))}
        </div>
        <p className="privacy-note">
          Votre position sert uniquement à estimer la distance et à activer la
          commande sur place. Elle n’est pas conservée.
        </p>
      </section>
      <ClientFooter />
    </main>
  );
}

function Restaurant({ data }: { data?: TavoData }) {
  const restaurant = data?.restaurant;
  const restaurantMenu: MenuDisplayItem[] = restaurant?.offers.map((offer) => ({
    offerId: offer.id,
    name: offer.name,
    note: offer.description,
    price: offer.price_cents / 100,
    image: offer.image_url ?? "/images/tavo-table.webp",
    tag: offer.labels[0] ?? "TAVO",
  })) ?? menu.map((item, index) => ({ ...item, offerId: index + 1 }));
  const [inside, setInside] = useState(false);
  const [presenceToken, setPresenceToken] = useState("");
  const [presenceMessage, setPresenceMessage] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedReference, setConfirmedReference] = useState("");
  const [orderStatus, setOrderStatus] = useState("PENDING");
  const [orderError, setOrderError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<CartItem[]>([]);
  const total = useMemo(
    () => cart.reduce((sum, x) => sum + x.price * x.qty, 0),
    [cart],
  );
  const add = (item: MenuDisplayItem) =>
    setCart((prev) => {
      const found = prev.find((x) => x.offerId === item.offerId);
      return found
        ? prev.map((x) => (x.offerId === item.offerId ? { ...x, qty: x.qty + 1 } : x))
        : [...prev, { offerId: item.offerId, name: item.name, price: item.price, qty: 1 }];
    });
  const decrease = (name: string) =>
    setCart((prev) =>
      prev
        .map((item) =>
          item.name === name ? { ...item, qty: item.qty - 1 } : item,
        )
        .filter((item) => item.qty > 0),
    );
  const quantityFor = (name: string) =>
    cart.find((item) => item.name === name)?.qty ?? 0;
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  async function submit() {
    if (!cart.length || !restaurant || !presenceToken || submitting) return;
    setSubmitting(true);
    setOrderError("");
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ restaurantId: restaurant.id, presenceToken, items: cart.map((item) => ({ offerId: item.offerId, quantity: item.qty })) }),
    });
    const result = await response.json();
    setSubmitting(false);
    if (!response.ok) {
      setOrderError(result.error || "Impossible d’envoyer la commande.");
      if (result.code === "PRESENCE_EXPIRED") { setInside(false); setPresenceToken(""); }
      return;
    }
    setSubmittedOrder(cart);
    setConfirmedReference(result.reference);
    setOrderStatus(result.status);
    setCart([]);
    setReviewOpen(false);
    setConfirmed(true);
  };

  async function requestPresence(devInside?: boolean) {
    if (!restaurant) return;
    setPresenceMessage("Vérification en cours…");
    const send = async (payload: Record<string, unknown>) => {
      const response = await fetch("/api/presence/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ restaurantId: restaurant.id, ...payload }) });
      const result = await response.json();
      if (result.allowed) { setInside(true); setPresenceToken(result.presenceToken); setPresenceMessage(""); }
      else { setInside(false); setPresenceToken(""); setPresenceMessage(result.reason === "INACCURATE" ? "Position trop imprécise. Rapprochez-vous et réessayez." : "La commande sera disponible lorsque vous serez sur place."); }
    };
    if (devInside !== undefined) return send({ devInside });
    if (!("geolocation" in navigator)) { setPresenceMessage("La localisation n’est pas disponible sur cet appareil."); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => void send({ latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy }),
      () => setPresenceMessage("Localisation refusée. Le menu reste disponible en consultation."),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
    );
  }

  useEffect(() => {
    if (!confirmedReference || orderStatus !== "PENDING") return;
    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/orders?reference=${encodeURIComponent(confirmedReference)}`);
      if (response.ok) setOrderStatus((await response.json()).order.status);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [confirmedReference, orderStatus]);
  return (
    <main
      className={`client-page restaurant-page ${inside ? "is-inside" : ""}`}
    >
      <ClientNav />
      {process.env.NEXT_PUBLIC_ENABLE_GEO_SIMULATOR === "true" && <div
        className="dev-switch"
        role="group"
        aria-label="Simulation de présence"
      >
        <small>DEV · PRÉSENCE</small>
        <button
          className={!inside ? "active" : ""}
          onClick={() => {
            setInside(false);
            setPresenceToken("");
            setReviewOpen(false);
            setCart([]);
          }}
        >
          À L’EXTÉRIEUR
        </button>
        <button
          className={inside ? "active" : ""}
          onClick={() => void requestPresence(true)}
        >
          SUR PLACE
        </button>
      </div>}
      <section className="restaurant-head wrap">
        <div>
          <a href="/dish/cesar-signature" className="back-link dark-back">
            ← César Signature
          </a>
          <p className="eyebrow">Restaurant partenaire · Agdal</p>
          <h1>
            {restaurant?.name ?? "Atelier"}
            <br />
            {!restaurant ? "Noya." : ""}
          </h1>
        </div>
        <div className="restaurant-info">
          <p>
            {restaurant?.address ?? "12, avenue Fal Ould Oumeir"}
            <br />
            {restaurant?.sector ?? "Agdal"}, Rabat
          </p>
          <span>Distance calculée temporairement sur demande</span>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant?.latitude ?? 34.0024},${restaurant?.longitude ?? -6.8498}`}
            target="_blank"
            rel="noreferrer"
          >
            ITINÉRAIRE ↗
          </a>
        </div>
      </section>
      <div className={`presence-banner ${inside ? "presence-ok" : ""}`}>
        <div className="wrap">
          <span className="presence-dot" />
          <div>
            <strong>
              {inside ? "Vous êtes chez Atelier Noya" : "Menu découverte"}
            </strong>
            <p>
              {inside
                ? "Mode sur place activé · vous pouvez commander"
                : "Consultez les plats et prix. La commande s’active uniquement sur place."}
            </p>
            {!inside && presenceMessage && <p>{presenceMessage}</p>}
          </div>
          {inside && <small>AUTORISATION ACTIVE · 09:42</small>}
          {!inside && <button className="presence-check" onClick={() => void requestPresence()}>VÉRIFIER MA PRÉSENCE</button>}
        </div>
      </div>
      <section className="restaurant-menu wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">La sélection disponible sur TAVO</p>
            <h2>Menu RAAS</h2>
          </div>
          <span>{restaurantMenu.length} plats</span>
        </div>
        <div className="menu-list">
          {restaurantMenu.map((item, i) => (
            <article className="menu-item" key={item.name}>
              <span className="menu-index">0{i + 1}</span>
              <img src={item.image} alt="" />
              <div>
                <small>{item.tag}</small>
                <h3>{item.name}</h3>
                <p>{item.note}</p>
                <span>{item.price} MAD</span>
              </div>
              {inside && (
                <div className="menu-control">
                  {quantityFor(item.name) === 0 ? (
                    <button
                      className="add-item"
                      onClick={() => add(item)}
                      aria-label={`Ajouter ${item.name}`}
                    >
                      Ajouter
                    </button>
                  ) : (
                    <div className="quantity-stepper" aria-label={`Quantité pour ${item.name}`}>
                      <button
                        onClick={() => decrease(item.name)}
                        aria-label={`Retirer un ${item.name}`}
                      >
                        −
                      </button>
                      <strong>{quantityFor(item.name)}</strong>
                      <button
                        onClick={() => add(item)}
                        aria-label={`Ajouter un ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
      {inside && cart.length > 0 && (
        <aside className="cart-bar cart-open">
          <div>
            <small>MA COMMANDE</small>
            <strong>
              {itemCount} article{itemCount > 1 ? "s" : ""} · {total} MAD
            </strong>
          </div>
          <button onClick={() => setReviewOpen(true)}>
            Voir la commande <span>→</span>
          </button>
        </aside>
      )}
      {inside && reviewOpen && (
        <div className="confirmation order-review" role="dialog" aria-modal="true" aria-labelledby="review-title">
          <section className="review-sheet">
            <header>
              <div>
                <p className="eyebrow">Atelier Noya · Sur place</p>
                <h2 id="review-title">Ma commande.</h2>
              </div>
              <button className="modal-close" onClick={() => setReviewOpen(false)} aria-label="Fermer">
                ×
              </button>
            </header>
            <div className="review-items">
              {cart.map((item, index) => (
                <article className="review-item" key={item.name}>
                  <span className="review-index">0{index + 1}</span>
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.price} MAD l’unité</p>
                  </div>
                  <div className="quantity-stepper review-stepper">
                    <button onClick={() => decrease(item.name)} aria-label={`Retirer un ${item.name}`}>−</button>
                    <strong>{item.qty}</strong>
                    <button onClick={() => add(restaurantMenu.find((dish) => dish.offerId === item.offerId)!)} aria-label={`Ajouter un ${item.name}`}>+</button>
                  </div>
                  <strong>{item.price * item.qty} MAD</strong>
                </article>
              ))}
            </div>
            <div className="review-total">
              <span><small>SOUS-TOTAL</small><b>{total} MAD</b></span>
              <span><small>TOTAL</small><b>{total} MAD</b></span>
            </div>
            {orderError && <div className="login-error" role="alert">{orderError}</div>}
            <button className="review-submit" onClick={() => void submit()} disabled={!cart.length || submitting}>
              <span>{submitting ? "Envoi…" : "Commander"}</span><strong>{itemCount} article{itemCount > 1 ? "s" : ""} · {total} MAD</strong><i>→</i>
            </button>
            <p className="review-note">La commande devient définitive après envoi. Toute consommation supplémentaire créera une nouvelle commande.</p>
          </section>
        </div>
      )}
      {confirmed && (
        <div className="confirmation" role="dialog" aria-modal="true">
          <div className="confirmation-card">
            <button className="modal-close" onClick={() => setConfirmed(false)}>
              ×
            </button>
            <span className="confirmation-mark">✓</span>
            <p className="eyebrow">Envoyée à Atelier Noya</p>
            <h2>
              Commande
              <br />
              <em>{confirmedReference}</em>
            </h2>
            <p>
              Votre commande complète de {submittedOrder.reduce((sum, item) => sum + item.qty, 0)} article
              {submittedOrder.reduce((sum, item) => sum + item.qty, 0) > 1 ? "s" : ""} a été transmise au restaurant.
            </p>
            <div className="submitted-summary">
              {submittedOrder.map((item) => (
                <span key={item.name}><b>{item.qty} ×</b> {item.name}<strong>{item.qty * item.price} MAD</strong></span>
              ))}
            </div>
            <div className="order-status">
              <span />
              <b>{orderStatus === "VALIDATED" ? "COMMANDE VALIDÉE" : orderStatus === "DECLINED" ? "COMMANDE REFUSÉE" : "COMMANDE REÇUE"}</b>
              <span />
            </div>
            <button
              className="button button-dark"
              onClick={() => setConfirmed(false)}
            >
              Créer une nouvelle commande
            </button>
            <small>
              Toute consommation supplémentaire créera une nouvelle commande indépendante.
            </small>
          </div>
        </div>
      )}
      <ClientFooter />
    </main>
  );
}

function Crown({ detail = false, data }: { detail?: boolean; data?: TavoData }) {
  const crownPayload = data?.crownDetail;
  const detailPayload = crownPayload && "experience" in crownPayload ? crownPayload : null;
  const crownOffers = detailPayload?.offers ?? [];
  const crownExperiences = crownPayload && "experiences" in crownPayload ? (crownPayload.experiences ?? []) : [];
  const crownCategories = crownPayload?.categories ?? [];
  const selectedCategory = crownPayload && "selectedCategory" in crownPayload ? crownPayload.selectedCategory : "";
  const featuredExperience = crownExperiences[0];
  if (detail)
    return (
      <main className="crown-page">
        <ClientNav dark />
        <section className="crown-detail-hero">
          <img src={detailPayload?.experience?.image_url ?? "/images/crown-dinner.webp"} alt={detailPayload?.experience?.name ?? "Dîner Crown pour deux"} />
          <span className="shade" />
          <a href="/crown" className="back-link">
            ← Crown
          </a>
          <div>
            <p className="eyebrow">{detailPayload?.experience?.category_name ?? "Expérience Crown"}</p>
            <h1>{detailPayload?.experience?.name ?? "La table après minuit"}.</h1>
            <p>{detailPayload?.experience?.description}</p>
            <span className="crown-badges">{detailPayload?.experience?.badges_text?.split("|").filter(Boolean).map((badge) => <i key={badge}>{badge}</i>)}</span>
          </div>
        </section>
        <section className="crown-story wrap">
          <div>
            <p className="eyebrow">Ce qui vous attend</p>
            <h2>Un moment composé dans les moindres détails.</h2>
          </div>
          <div>
            <p>{detailPayload?.experience?.description}</p>
            <ul className="crown-inclusions">
              {detailPayload?.experience?.included_text?.split("|").filter(Boolean).map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="crown-facts">
              <span>
                <small>POUR</small>
                <b>{detailPayload?.experience?.capacity_label || "Selon l’offre"}</b>
              </span>
              <span>
                <small>PARTENAIRES</small>
                <b>{crownOffers.length} adresse{crownOffers.length === 1 ? "" : "s"}</b>
              </span>
              <span>
                <small>À PARTIR DE</small>
                <b>{crownOffers[0] ? `${(crownOffers[0].price_cents / 100).toFixed(0)} MAD` : "Sur demande"}</b>
              </span>
            </div>
          </div>
        </section>
        <section className="crown-partners wrap">
          <p className="eyebrow">Choisir une adresse</p>
          <h2>Les partenaires qui proposent ce moment.</h2>
          <div>
            {crownOffers.map((offer, index) => <a href={`/restaurant/${offer.restaurant_slug}`} key={offer.restaurant_slug}>
              <span>0{index + 1}</span><strong>{offer.restaurant_name}</strong><p>{offer.availability_note}</p><b>{(offer.price_cents / 100).toFixed(0)} MAD</b><i>→</i>
            </a>)}
          </div>
        </section>
      </main>
    );
  return (
    <main className={`crown-page ${selectedCategory ? "crown-explorer-page" : "crown-landing-page"}`}>
      <ClientNav dark />
      <section className="crown-home-hero">
        <img src={featuredExperience?.image_url ?? "/images/crown-dinner.webp"} alt="Univers TAVO Crown" />
        <span className="shade" />
        <div>
          <p className="eyebrow">TAVO présente</p>
          <div className="crown-title">✦ CROWN</div>
          <h1>
            Ce soir,
            <br />
            vivez autre chose.
          </h1>
          <p>
            Quel moment voulez-vous vivre ? Des expériences choisies avant l’adresse, imaginées avec les tables les plus singulières de Rabat.
          </p>
          <a className="button button-gold" href={featuredExperience ? `/crown/${featuredExperience.slug}` : "/crown"}>
            Découvrir l’expérience →
          </a>
        </div>
        <span className="scroll-note">DÉFILER · 01 / 04</span>
      </section>
      <section className={`crown-category-strip wrap ${selectedCategory ? "crown-explorer-rail" : ""}`}>
        <div className="crown-section-heading">
          <div><p className="eyebrow">Choisissez l’intention</p><h2>Quel moment voulez-vous vivre&nbsp;?</h2></div>
          {selectedCategory && <a href="/crown">Tout voir →</a>}
        </div>
        <nav className="crown-category-list" aria-label="Catégories Crown">
          {crownCategories.map((category, index) => <a href={`/crown?category=${category.slug}`} className={selectedCategory === category.slug ? "active" : ""} aria-current={selectedCategory === category.slug ? "page" : undefined} key={category.id}>
            <span>0{index + 1}</span><b>{category.name}</b><small>{category.description}</small>
          </a>)}
        </nav>
      </section>
      <section className="crown-selection wrap">
        <p className="eyebrow">{selectedCategory ? crownCategories.find((category) => category.slug === selectedCategory)?.name : "La sélection Crown"}</p>
        <h2>
          Des expériences pour
          <br />
          sortir de l’ordinaire.
        </h2>
        <div className="crown-cards">
          {crownExperiences.map((experience, i) => (
            <a href={`/crown/${experience.slug}`} key={experience.id}>
              <img src={experience.image_url ?? "/images/crown-dinner.webp"} alt="" />
              <span className="crown-card-shade" />
              <div><small>{experience.category_name ?? "Crown"} · {experience.capacity_label || "Sur mesure"}</small><h3>{experience.name}</h3><p>{experience.description}</p></div>
              <b>0{i + 1}</b><i>↗</i>
            </a>
          ))}
        </div>
        {!crownExperiences.length && <p className="crown-empty">Aucune expérience publiée dans cette catégorie pour le moment.</p>}
      </section>
    </main>
  );
}

const professionalData = {
  partner: {
    label: "ESPACE PARTENAIRE",
    name: "Atelier Noya",
    nav: [
      "Commandes",
      "Menu RAAS",
      "Propositions",
      "Facturation",
      "Informations",
      "Support",
    ],
    title: "Bonjour, équipe Noya.",
    subtitle: "Voici ce qui demande votre attention aujourd’hui.",
  },
  manager: {
    label: "GESTION TERRITORIALE",
    name: "Rabat · Agdal",
    nav: ["Restaurants", "Partenaires", "Propositions", "Commandes", "Opérations"],
    title: "Secteur Agdal",
    subtitle: "Activité des restaurants partenaires dans votre périmètre.",
  },
  admin: {
    label: "ADMINISTRATION GLOBALE",
    name: "TAVO Rabat",
    nav: [
      "Vue d’ensemble",
      "Catalogue",
      "Restaurants",
      "Crown",
      "Commandes",
      "Partenaires",
      "Facturation",
      "Opérations",
    ],
    title: "Vue d’ensemble",
    subtitle: "Le catalogue, les partenaires et l’activité TAVO aujourd’hui.",
  },
};

function Professional({ role }: { role: "partner" | "manager" | "admin" }) {
  const router = useRouter();
  const d = professionalData[role];
  const [active, setActive] = useState(d.nav[0]);
  const [snapshot, setSnapshot] = useState<ProfessionalSnapshot | null>(null);
  const [notice, setNotice] = useState("");
  async function refreshProfessional() {
    const response = await fetch("/api/professional", { cache: "no-store" });
    if (response.status === 401) { router.replace("/login"); return; }
    if (response.ok) setSnapshot(await response.json());
  }
  useEffect(() => {
    void fetch("/api/professional", { cache: "no-store" }).then(async (response) => {
      if (response.status === 401) { router.replace("/login"); return; }
      if (response.ok) setSnapshot(await response.json());
    });
  }, [router]);
  async function runAction(action: string, payload: Record<string, unknown>) {
    setNotice("");
    const response = await fetch("/api/professional", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, payload }) });
    const result = await response.json();
    setNotice(response.ok ? "Modification enregistrée." : result.error || "Action impossible.");
    if (response.ok) await refreshProfessional();
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); }
  return (
    <main className="pro-page">
      <aside className="pro-sidebar">
        <Brand light />
        <div className="pro-identity">
          <small>{d.label}</small>
          <strong>{d.name}</strong>
        </div>
        <nav>
          {d.nav.map((x, i) => (
            <button
              className={active === x ? "active" : ""}
              onClick={() => setActive(x)}
              key={x}
            >
              <span>0{i + 1}</span>
              {x}
              {role === "partner" && i === 0 && <b>3</b>}
            </button>
          ))}
        </nav>
        <div className="pro-user">
          <span>
            {role === "admin" ? "SB" : role === "manager" ? "YM" : "AN"}
          </span>
          <div>
            <b>
              {role === "admin"
                ? "Salma Benali"
                : role === "manager"
                  ? "Yassine Mansour"
                  : "Équipe Noya"}
            </b>
            <button className="logout-link" onClick={() => void logout()}>Se déconnecter</button>
          </div>
        </div>
      </aside>
      <section className="pro-content">
        <header>
          <div>
            <p>{active}</p>
            <h1>{active === d.nav[0] ? d.title : active}</h1>
            <span>{d.subtitle}</span>
          </div>
          <div className="date-box">
            <small>MARDI</small>
            <b>11</b>
            <span>AOÛT</span>
          </div>
        </header>
        {notice && <div className="pro-notice">{notice}</div>}
        <ProfessionalLive role={role} active={active} data={snapshot} runAction={runAction} />
      </section>
    </main>
  );
}

type ProfessionalRow = Record<string, unknown>;
type ProfessionalSnapshot = {
  user: { id:number; name:string; role:string };
  restaurants: ProfessionalRow[]; orders: ProfessionalRow[]; offers: ProfessionalRow[];
  proposals: ProfessionalRow[]; support: ProfessionalRow[]; statements: ProfessionalRow[];
  liveBilling: ProfessionalRow[]; categories: ProfessionalRow[]; collections: ProfessionalRow[];
  labels: ProfessionalRow[]; dishes: ProfessionalRow[]; crownCategories: ProfessionalRow[]; crown: ProfessionalRow[]; users: ProfessionalRow[];
  cities: ProfessionalRow[]; sectors: ProfessionalRow[];
};

function money(cents: unknown) { return `${(Number(cents || 0) / 100).toLocaleString("fr-FR")} MAD`; }

function ProfessionalLive({ role, active, data, runAction }: { role:"partner"|"manager"|"admin"; active:string; data:ProfessionalSnapshot|null; runAction:(action:string,payload:Record<string,unknown>)=>Promise<void> }) {
  if (!data) return <section className="pro-section"><div className="empty-editorial"><span>Chargement…</span></div></section>;
  if (active.toLowerCase().includes("commande") || active === "Vue d’ensemble") return <LiveOrders data={data} runAction={runAction} />;
  if (active.includes("Proposition")) return <LiveProposals role={role} data={data} runAction={runAction} />;
  if (active === "Menu RAAS") return <LiveMenu data={data} runAction={runAction} />;
  if (active === "Catalogue") return <><AdminEntityManager data={data} runAction={runAction} initialEntity="dish"/><CatalogueRelations data={data} runAction={runAction}/><MediaUploader/></>;
  if (active === "Crown") return <><CrownAdmin data={data} runAction={runAction}/><CrownRelations data={data} runAction={runAction}/></>;
  if (active === "Partenaires") return <LivePartners role={role} data={data} runAction={runAction} />;
  if (active === "Facturation") return <LiveBilling role={role} data={data} runAction={runAction} />;
  if (active === "Support") return <LiveSupport role={role} data={data} runAction={runAction} />;
  if (active === "Restaurants") return <LiveRestaurants role={role} data={data} runAction={runAction} />;
  if (active === "Opérations") return <LiveOperations role={role} data={data} runAction={runAction} />;
  return <GenericPanel title={active} role={role} />;
}

function LiveOrders({ data, runAction }: { data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  const pending = data.orders.filter((order) => order.status === "PENDING");
  return <><div className="pro-alert"><span className="pulse"/><div><b>{pending.length} nouvelle{pending.length===1?"":"s"} commande{pending.length===1?"":"s"}</b><p>Les commandes sur place apparaissent ici en temps réel.</p></div></div><section className="pro-section"><div className="pro-section-head"><h2>Commandes TAVO</h2><span>{data.orders.length} commandes</span></div><div className="live-order-list">{data.orders.map((order) => <article key={String(order.id)}><div><small>{String(order.restaurant_name)} · {new Date(String(order.submitted_at)).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}</small><h3>{String(order.reference)}</h3><p>{(order.items as Array<{name:string;quantity:number}>).map((item)=>`${item.quantity} × ${item.name}`).join(" · ")}</p></div><strong>{money(order.gross_cents)}</strong><i className={order.status==="VALIDATED"?"status-ok":"status-new"}>{String(order.status)}</i>{order.status==="PENDING"&&<span className="live-actions"><button onClick={()=>void runAction("order-status",{orderId:order.id,status:"DECLINED"})}>REFUSER</button><button onClick={()=>void runAction("order-status",{orderId:order.id,status:"VALIDATED"})}>VALIDER</button></span>}{order.status==="VALIDATED"&&<button className="quiet-action" onClick={()=>void runAction("order-status",{orderId:order.id,status:"CANCELLED"})}>ANNULER AVEC TRACE</button>}</article>)}</div></section></>;
}

function LiveMenu({ data, runAction }: { data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  const restaurantId = Number(data.restaurants[0]?.id || 0);
  return <section className="pro-section"><div className="pro-section-head"><h2>Menu RAAS publié</h2><span>Les changements publics passent par validation.</span></div><div className="catalogue-list">{data.offers.map((offer)=><div key={String(offer.id)}><span><small>{String(offer.restaurant_name)}</small><b>{String(offer.dish_name)}</b><p>{offer.is_featured?"Mis en avant dans TAVO":"Menu RAAS"}</p></span><strong>{money(offer.price_cents)}</strong><i className="published">{String(offer.status)}</i></div>)}</div><ProposalCreate restaurantId={restaurantId} runAction={runAction}/></section>;
}

function ProposalCreate({ restaurantId, runAction }: { restaurantId:number; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  return <form className="pro-form" onSubmit={(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);void runAction("proposal-create",{restaurantId,type:form.get("type"),data:{change:form.get("crownChange"),offerId:Number(form.get("offerId")),proposedPriceCents:Number(form.get("price"))*100,name:form.get("name"),description:form.get("description")}});event.currentTarget.reset();}}><h3>Nouvelle proposition</h3><select name="type"><option value="PRICE_UPDATE">Mise à jour de prix</option><option value="NEW_ITEM">Nouveau plat</option><option value="CROWN">Expérience Crown</option><option value="ITEM_REMOVAL">Retrait d’un plat</option></select><select name="crownChange"><option value="NEW">Crown · nouvelle expérience</option><option value="CONTENT">Crown · contenu ou visuel</option><option value="PRICE">Crown · prix</option><option value="WITHDRAWAL">Crown · retrait</option></select><input name="offerId" type="number" placeholder="ID de l’offre"/><input name="price" type="number" placeholder="Nouveau prix (MAD)"/><input name="name" placeholder="Nom de la proposition"/><input name="description" placeholder="Description"/><button className="pro-primary">SOUMETTRE POUR VALIDATION</button></form>;
}

function LiveProposals({ role, data, runAction }: { role:string; data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  return <section className="pro-section"><div className="pro-section-head"><h2>Propositions</h2><span>{data.proposals.filter((x)=>x.status==="PENDING").length} en attente</span></div>{data.proposals.map((proposal)=><article className="proposal-card" key={String(proposal.id)}><span>{String(proposal.type)}</span><div><small>{String(proposal.restaurant_name)} · {String(proposal.submitted_by_name)}</small><h3>Proposition #{String(proposal.id)}</h3><p>{JSON.stringify(proposal.payload)}</p></div><i>{String(proposal.status)}</i>{role!=="partner"&&proposal.status==="PENDING"&&<span className="live-actions"><button onClick={()=>void runAction("proposal-review",{proposalId:proposal.id,decision:"REJECTED"})}>REJETER</button><button onClick={()=>void runAction("proposal-review",{proposalId:proposal.id,decision:"APPROVED"})}>APPROUVER</button></span>}</article>)}</section>;
}

function LiveBilling({ role, data, runAction }: { role:string; data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  const gross=data.liveBilling.reduce((sum,row)=>sum+Number(row.gross_cents||0),0);const commission=data.liveBilling.reduce((sum,row)=>sum+Number(row.commission_cents||0),0);
  return <section className="pro-section"><div className="pro-section-head"><h2>Facturation transparente</h2><button className="pro-primary" onClick={()=>window.print()}>IMPRIMER LE RELEVÉ</button></div><div className="metric-line"><div><small>VENTES VALIDÉES</small><b>{money(gross)}</b><p>Commandes TAVO facturables</p></div><div><small>COMMISSION DUE</small><b>{money(commission)}</b><p>Calcul auditable par commande</p></div></div>{role==="admin"&&<form className="pro-form entity-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("statement-generate",{restaurantId:Number(f.get("restaurantId")),periodStart:f.get("periodStart"),periodEnd:f.get("periodEnd")});}}><h3>Générer un relevé</h3><select name="restaurantId">{data.restaurants.map((r)=><option key={String(r.id)} value={String(r.id)}>{String(r.name)}</option>)}</select><input required name="periodStart" type="date"/><input required name="periodEnd" type="date"/><button className="pro-primary">GÉNÉRER</button></form>}<div className="billing-list">{data.statements.map((row)=><div key={String(row.id)}><span>{String(row.period_start)} → {String(row.period_end)}</span><b>{money(row.gross_cents)}</b><strong>{money(row.commission_cents)}</strong><i>{String(row.status)}</i></div>)}</div></section>;
}

function LivePartners({ role, data, runAction }: { role:string; data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  return <section className="pro-section"><div className="pro-section-head"><h2>Accès partenaires</h2><span>Accès limité au restaurant assigné</span></div><form className="pro-form entity-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("partner-create",{name:f.get("name"),email:f.get("email"),password:f.get("password"),restaurantId:Number(f.get("restaurantId"))});e.currentTarget.reset();}}><input required name="name" placeholder="Nom du partenaire"/><input required name="email" type="email" placeholder="Email"/><input required name="password" type="password" minLength={10} placeholder="Mot de passe local"/><select name="restaurantId">{data.restaurants.map((r)=><option key={String(r.id)} value={String(r.id)}>{String(r.name)}</option>)}</select><button className="pro-primary">CRÉER ET ASSIGNER</button></form>{role==="admin"&&<div className="entity-list">{data.users.filter((u)=>u.role==="PARTNER").map((u)=><article key={String(u.id)}><div><small>{String(u.restaurant_scope||"Non assigné")}</small><h3>{String(u.name)}</h3><p>{String(u.email)}</p></div><i>{String(u.status)}</i></article>)}</div>}</section>;
}

function LiveSupport({ role, data, runAction }: { role:string; data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  const restaurantId=Number(data.restaurants[0]?.id||0);
  return <section className="pro-section"><div className="pro-section-head"><h2>Support</h2></div>{role==="partner"&&<form className="pro-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("support-create",{restaurantId,subject:f.get("subject"),category:f.get("category"),message:f.get("message")});e.currentTarget.reset();}}><input name="subject" required placeholder="Sujet"/><select name="category"><option>INFORMATIONS</option><option>MENU</option><option>FACTURATION</option><option>TECHNIQUE</option></select><textarea name="message" required placeholder="Votre message"/><button className="pro-primary">OUVRIR UN TICKET</button></form>}<div className="support-list">{data.support.map((ticket)=><article key={String(ticket.id)}><small>{String(ticket.restaurant_name)} · {String(ticket.category)}</small><h3>{String(ticket.subject)}</h3><p>{String(ticket.message)}</p><i>{String(ticket.status)}</i>{role!=="partner"&&<button onClick={()=>void runAction("support-update",{ticketId:ticket.id,status:"RESOLVED",response:"Traitement confirmé par TAVO."})}>MARQUER RÉSOLU</button>}</article>)}</div></section>;
}

function LiveRestaurants({ role, data, runAction }: { role:string; data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  return <section className="pro-section"><div className="pro-section-head"><h2>Restaurants dans votre périmètre</h2><span>{data.restaurants.length} partenaires</span></div>{role==="admin"&&<form className="pro-form entity-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("entity-save",{entity:"restaurant",data:{name:f.get("name"),slug:f.get("slug"),cityId:Number(f.get("cityId")),sectorId:Number(f.get("sectorId")),address:f.get("address"),latitude:Number(f.get("latitude")),longitude:Number(f.get("longitude")),radius:Number(f.get("radius")),status:f.get("status")}});e.currentTarget.reset();}}><h3>Nouveau restaurant</h3><input name="name" required placeholder="Nom"/><input name="slug" required placeholder="Slug"/><select name="cityId">{data.cities.map((city)=><option key={String(city.id)} value={String(city.id)}>{String(city.name)}</option>)}</select><select name="sectorId">{data.sectors.map((sector)=><option key={String(sector.id)} value={String(sector.id)}>{String(sector.name)}</option>)}</select><input name="address" required placeholder="Adresse"/><input name="latitude" required type="number" step="any" placeholder="Latitude"/><input name="longitude" required type="number" step="any" placeholder="Longitude"/><input name="radius" type="number" min="3" defaultValue="10"/><select name="status"><option>DRAFT</option><option>PUBLISHED</option></select><button className="pro-primary">CRÉER LE RESTAURANT</button></form>}<div className="restaurant-admin-list">{data.restaurants.map((restaurant)=><form key={String(restaurant.id)} onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("entity-save",{entity:"restaurant",data:{id:restaurant.id,name:restaurant.name,slug:restaurant.slug,cityId:restaurant.city_id,sectorId:restaurant.sector_id,address:f.get("address"),latitude:Number(f.get("latitude")),longitude:Number(f.get("longitude")),radius:Number(f.get("radius")),commissionBps:Number(f.get("commission"))*100,status:f.get("status")}});}}><div><small>{String(restaurant.city)} · {String(restaurant.sector)}</small><h3>{String(restaurant.name)}</h3><input name="address" defaultValue={String(restaurant.address)}/></div><input aria-label="Latitude" name="latitude" type="number" step="any" defaultValue={Number(restaurant.latitude)}/><input aria-label="Longitude" name="longitude" type="number" step="any" defaultValue={Number(restaurant.longitude)}/><input aria-label="Rayon en mètres" name="radius" type="number" min="3" defaultValue={Number(restaurant.ordering_radius_m)}/><input aria-label="Commission en pourcentage" name="commission" type="number" step="0.1" defaultValue={Number(restaurant.commission_bps||1200)/100}/><select name="status" defaultValue={String(restaurant.status)}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>{role==="admin"&&<><button>ENREGISTRER</button><button type="button" onClick={()=>void runAction("entity-remove",{entity:"restaurant",id:restaurant.id})}>ARCHIVER</button></>}</form>)}</div>{role!=="partner"&&<form className="pro-form entity-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("offer-create",{restaurantId:Number(f.get("restaurantId")),dishId:Number(f.get("dishId")),priceCents:Number(f.get("price"))*100,isFeatured:f.get("featured")==="on",sortOrder:Number(f.get("sortOrder")),status:f.get("status")});e.currentTarget.reset();}}><h3>Ajouter un plat au menu</h3><select name="restaurantId">{data.restaurants.map((r)=><option key={String(r.id)} value={String(r.id)}>{String(r.name)}</option>)}</select><select name="dishId">{data.dishes.map((d)=><option key={String(d.id)} value={String(d.id)}>{String(d.name)}</option>)}</select><input required name="price" type="number" min="0" step="0.01" placeholder="Prix MAD"/><input name="sortOrder" type="number" defaultValue="0"/><label><input name="featured" type="checkbox"/> Mise en avant</label><select name="status"><option>DRAFT</option><option>PUBLISHED</option></select><button className="pro-primary">AJOUTER AU MENU</button></form>}</section>;
}

function LiveOperations({ role, data, runAction }: { role:string; data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  return <section className="pro-section"><div className="pro-section-head"><h2>Opérations</h2></div>{role==="admin"&&<form className="pro-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("commission-set",{commissionBps:Number(f.get("rate"))*100});}}><h3>Commission TAVO par défaut</h3><input name="rate" type="number" min="0" max="100" step="0.1" defaultValue="12"/><button className="pro-primary">ENREGISTRER</button></form>}<LiveSupport role={role} data={data} runAction={runAction}/></section>;
}

function AdminEntityManager({ data, runAction, initialEntity }: { data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void>; initialEntity:string }) {
  const [entity,setEntity]=useState(initialEntity);
  const list=(entity==="category"?data.categories:entity==="collection"?data.collections:entity==="label"?data.labels:entity==="crown"?data.crown:entity==="user"?data.users:entity==="city"?data.cities:entity==="sector"?data.sectors:data.dishes);
  return <section className="pro-section"><div className="pro-section-head"><h2>Gestion dynamique</h2><select value={entity} onChange={(e)=>setEntity(e.target.value)}><option value="dish">Plats</option><option value="category">Catégories</option><option value="collection">Collections</option><option value="label">Labels</option><option value="crown">Crown</option><option value="city">Villes</option><option value="sector">Secteurs</option><option value="user">Utilisateurs</option></select></div>
    <form className="pro-form entity-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);const name=String(f.get("name"));void runAction("entity-save",{entity,data:{name,email:f.get("email"),password:f.get("password"),role:f.get("role"),cityId:Number(f.get("cityId"))||null,sectorId:Number(f.get("sectorId"))||null,slug:String(f.get("slug")||name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-")),description:f.get("description"),ingredients:f.get("ingredients"),categoryId:Number(f.get("categoryId"))||null,imageUrl:f.get("imageUrl"),sortOrder:Number(f.get("sortOrder"))||0,status:f.get("status"),featured:f.get("featured")==="on"}});e.currentTarget.reset();}}>
      <input name="name" required placeholder="Nom"/>{entity==="user"?<><input name="email" type="email" required placeholder="Email"/><input name="password" type="password" required placeholder="Mot de passe local"/><select name="role"><option>PARTNER</option><option>MANAGER</option><option>ADMIN</option></select><select name="cityId"><option value="">Toute ville</option>{data.cities.map((x)=><option key={String(x.id)} value={String(x.id)}>{String(x.name)}</option>)}</select><select name="sectorId"><option value="">Tout secteur</option>{data.sectors.map((x)=><option key={String(x.id)} value={String(x.id)}>{String(x.name)}</option>)}</select></>:<><input name="slug" placeholder="Slug automatique si vide"/>{entity==="sector"&&<select name="cityId">{data.cities.map((x)=><option key={String(x.id)} value={String(x.id)}>{String(x.name)}</option>)}</select>}{!['city','sector','label'].includes(entity)&&<><input name="description" placeholder="Description"/><input name="imageUrl" placeholder="URL image (médiathèque ou distante)"/></>}{entity==="dish"&&<><input name="ingredients" placeholder="Ingrédients"/><select name="categoryId"><option value="">Sans catégorie</option>{data.categories.map((x)=><option key={String(x.id)} value={String(x.id)}>{String(x.name)}</option>)}</select></>}{(entity==="category"||entity==="collection")&&<input name="sortOrder" type="number" defaultValue="0" placeholder="Ordre"/>}<select name="status"><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select>{entity==="crown"&&<label><input name="featured" type="checkbox"/> Mettre en avant</label>}</>}<button className="pro-primary">CRÉER</button>
    </form><div className="entity-list">{list.map((item)=><form key={String(item.id)} onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("entity-save",{entity,data:{id:item.id,name:f.get("name"),slug:f.get("slug"),description:f.get("description"),ingredients:f.get("ingredients"),sortOrder:Number(f.get("sortOrder"))||0,categoryId:Number(f.get("categoryId"))||null,status:f.get("status"),email:item.email,role:item.role,cityId:item.city_id,sectorId:item.sector_id}});}}><input name="name" defaultValue={String(item.name)}/><input name="slug" defaultValue={String(item.slug??"")} placeholder={String(item.email??"")}/><input name="description" defaultValue={String(item.description??"")} placeholder="Description"/>{entity==="dish"&&<><input name="ingredients" defaultValue={String(item.ingredients??"")} placeholder="Ingrédients"/><select name="categoryId" defaultValue={String(item.category_id??"")}><option value="">Sans catégorie</option>{data.categories.map((x)=><option key={String(x.id)} value={String(x.id)}>{String(x.name)}</option>)}</select></>}{(entity==="category"||entity==="collection")&&<input name="sortOrder" type="number" defaultValue={Number(item.sort_order||0)}/>}<select name="status" defaultValue={String(item.status)}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option><option>ACTIVE</option></select><button>ENREGISTRER</button><button type="button" onClick={()=>void runAction("entity-remove",{entity,id:item.id})}>SUPPRIMER / ARCHIVER</button></form>)}</div></section>;
}

function CatalogueRelations({ data, runAction }: { data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  return <section className="pro-section"><div className="pro-section-head"><h2>Classement éditorial</h2><span>Relations dynamiques</span></div><form className="pro-form entity-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("dish-label-set",{dishId:Number(f.get("dishId")),labelId:Number(f.get("labelId")),enabled:true});}}><h3>Associer un label approuvé</h3><select name="dishId">{data.dishes.map((d)=><option key={String(d.id)} value={String(d.id)}>{String(d.name)}</option>)}</select><select name="labelId">{data.labels.map((l)=><option key={String(l.id)} value={String(l.id)}>{String(l.name)}</option>)}</select><button className="pro-primary">ASSOCIER</button></form><form className="pro-form entity-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("collection-dish-set",{dishId:Number(f.get("dishId")),collectionId:Number(f.get("collectionId")),sortOrder:Number(f.get("sortOrder")),enabled:true});}}><h3>Ajouter à une collection</h3><select name="dishId">{data.dishes.map((d)=><option key={String(d.id)} value={String(d.id)}>{String(d.name)}</option>)}</select><select name="collectionId">{data.collections.map((c)=><option key={String(c.id)} value={String(c.id)}>{String(c.name)}</option>)}</select><input name="sortOrder" type="number" defaultValue="0"/><button className="pro-primary">AJOUTER</button></form></section>;
}

function CrownAdmin({ data, runAction }: { data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  return <>
    <section className="pro-section">
      <div className="pro-section-head"><h2>Catégories Crown</h2><span>Indépendantes des catégories de plats</span></div>
      <form className="pro-form entity-form" onSubmit={(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);void runAction("entity-save",{entity:"crown-category",data:{name:form.get("name"),slug:form.get("slug"),description:form.get("description"),imageUrl:form.get("imageUrl"),sortOrder:Number(form.get("sortOrder")),status:form.get("status")}});event.currentTarget.reset();}}>
        <input name="name" required placeholder="Nom de la catégorie"/><input name="slug" required placeholder="Slug"/><input name="description" placeholder="Description éditoriale"/><input name="imageUrl" placeholder="Image de couverture"/><input name="sortOrder" type="number" defaultValue="0"/><select name="status"><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select><button className="pro-primary">CRÉER LA CATÉGORIE</button>
      </form>
      <div className="entity-list">{data.crownCategories.map((category)=><form key={String(category.id)} onSubmit={(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);void runAction("entity-save",{entity:"crown-category",data:{id:category.id,name:form.get("name"),slug:form.get("slug"),description:form.get("description"),imageUrl:form.get("imageUrl"),sortOrder:Number(form.get("sortOrder")),status:form.get("status")}});}}><input name="name" defaultValue={String(category.name)}/><input name="slug" defaultValue={String(category.slug)}/><input name="description" defaultValue={String(category.description??"")}/><input name="imageUrl" defaultValue={String(category.cover_url??"")} placeholder="Image"/><input name="sortOrder" type="number" defaultValue={Number(category.sort_order||0)}/><select name="status" defaultValue={String(category.status)}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select><button>ENREGISTRER</button><button type="button" onClick={()=>void runAction("entity-remove",{entity:"crown-category",id:category.id})}>SUPPRIMER / ARCHIVER</button></form>)}</div>
    </section>
    <section className="pro-section">
      <div className="pro-section-head"><h2>Expériences Crown</h2><span>Contenu, capacité et publication</span></div>
      <form className="pro-form entity-form" onSubmit={(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);void runAction("entity-save",{entity:"crown",data:{name:form.get("name"),slug:form.get("slug"),description:form.get("description"),imageUrl:form.get("imageUrl"),galleryUrls:form.get("galleryUrls"),categoryId:Number(form.get("categoryId"))||null,capacityLabel:form.get("capacityLabel"),includedText:form.get("includedText"),badgesText:form.get("badgesText"),sortOrder:Number(form.get("sortOrder")),featured:form.get("featured")==="on",status:form.get("status")}});event.currentTarget.reset();}}>
        <input name="name" required placeholder="Titre"/><input name="slug" required placeholder="Slug"/><textarea name="description" required placeholder="Description premium concise"/><select name="categoryId"><option value="">Sans catégorie</option>{data.crownCategories.map((category)=><option key={String(category.id)} value={String(category.id)}>{String(category.name)}</option>)}</select><input name="capacityLabel" placeholder="Capacité · ex. 4 personnes"/><input name="includedText" placeholder="Inclus · séparer avec |"/><input name="badgesText" placeholder="Badges · séparer avec |"/><input name="imageUrl" placeholder="Image principale"/><input name="galleryUrls" placeholder="Galerie · URLs séparées par des virgules"/><input name="sortOrder" type="number" defaultValue="0"/><label><input name="featured" type="checkbox"/> Mettre en avant</label><select name="status"><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select><button className="pro-primary">CRÉER L’EXPÉRIENCE</button>
      </form>
      <div className="entity-list">{data.crown.map((experience)=><form key={String(experience.id)} onSubmit={(event)=>{event.preventDefault();const form=new FormData(event.currentTarget);void runAction("entity-save",{entity:"crown",data:{id:experience.id,name:form.get("name"),slug:form.get("slug"),description:form.get("description"),imageUrl:form.get("imageUrl"),galleryUrls:form.get("galleryUrls"),categoryId:Number(form.get("categoryId"))||null,capacityLabel:form.get("capacityLabel"),includedText:form.get("includedText"),badgesText:form.get("badgesText"),sortOrder:Number(form.get("sortOrder")),featured:form.get("featured")==="on",status:form.get("status")}});}}><input name="name" defaultValue={String(experience.name)}/><input name="slug" defaultValue={String(experience.slug)}/><input name="description" defaultValue={String(experience.description??"")}/><select name="categoryId" defaultValue={String(experience.category_id??"")}><option value="">Sans catégorie</option>{data.crownCategories.map((category)=><option key={String(category.id)} value={String(category.id)}>{String(category.name)}</option>)}</select><input name="capacityLabel" defaultValue={String(experience.capacity_label??"")} placeholder="Capacité"/><input name="includedText" defaultValue={String(experience.included_text??"")} placeholder="Inclus"/><input name="badgesText" defaultValue={String(experience.badges_text??"")} placeholder="Badges"/><input name="imageUrl" defaultValue={String(experience.image_url??"")} placeholder="Image"/><input name="galleryUrls" defaultValue={Array.isArray(experience.gallery_urls)?experience.gallery_urls.join(", "):""} placeholder="Galerie"/><input name="sortOrder" type="number" defaultValue={Number(experience.sort_order||0)}/><label><input name="featured" type="checkbox" defaultChecked={Boolean(experience.featured)}/> Mise en avant</label><select name="status" defaultValue={String(experience.status)}><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select><button>ENREGISTRER</button><button type="button" onClick={()=>void runAction("entity-remove",{entity:"crown",id:experience.id})}>SUPPRIMER / ARCHIVER</button></form>)}</div>
    </section>
  </>;
}

function CrownRelations({ data, runAction }: { data:ProfessionalSnapshot; runAction:(a:string,p:Record<string,unknown>)=>Promise<void> }) {
  return <section className="pro-section"><div className="pro-section-head"><h2>Disponibilité Crown</h2><span>Prix et publication par restaurant</span></div><form className="pro-form entity-form" onSubmit={(e)=>{e.preventDefault();const f=new FormData(e.currentTarget);void runAction("crown-offer-set",{experienceId:Number(f.get("experienceId")),restaurantId:Number(f.get("restaurantId")),priceCents:Number(f.get("price"))*100,availabilityNote:f.get("note"),status:f.get("status")});}}><select name="experienceId">{data.crown.map((x)=><option key={String(x.id)} value={String(x.id)}>{String(x.name)}</option>)}</select><select name="restaurantId">{data.restaurants.map((x)=><option key={String(x.id)} value={String(x.id)}>{String(x.name)}</option>)}</select><input required name="price" type="number" min="0" step="0.01" placeholder="Prix MAD"/><input name="note" placeholder="Disponibilité"/><select name="status"><option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option></select><button className="pro-primary">ASSOCIER</button></form></section>;
}

function MediaUploader() {
  const [uploaded,setUploaded]=useState("");
  return <section className="pro-section"><div className="pro-section-head"><h2>Médiathèque locale</h2><span>Adaptateur remplaçable en production</span></div><form className="pro-form" onSubmit={async(e)=>{e.preventDefault();const response=await fetch("/api/media",{method:"POST",body:new FormData(e.currentTarget)});const result=await response.json();setUploaded(response.ok?result.publicUrl:result.error);}}><input required name="file" type="file" accept="image/png,image/jpeg,image/webp"/><button className="pro-primary">TÉLÉVERSER</button>{uploaded&&<p>{uploaded}</p>}</form></section>;
}

function OrdersPanel({ role }: { role: string }) {
  return (
    <>
      <div className="pro-alert">
        <span className="pulse" />
        <div>
          <b>3 nouvelles commandes</b>
          <p>La plus ancienne attend depuis 4 minutes.</p>
        </div>
        <button>VOIR MAINTENANT →</button>
      </div>
      <section className="pro-section">
        <div className="pro-section-head">
          <h2>
            {role === "admin" ? "Activité récente" : "Commandes à traiter"}
          </h2>
          <span>Actualisé à l’instant</span>
        </div>
        <div className="order-table">
          <div className="order-row order-labels">
            <span>RÉFÉRENCE</span>
            <span>COMMANDE</span>
            <span>HEURE</span>
            <span>TOTAL</span>
            <span>STATUT</span>
          </div>
          {[
            [
              "G001-01",
              "César Signature × 2 · Eau plate",
              "12:42",
              "168 MAD",
              "NOUVELLE",
            ],
            [
              "G002-01",
              "Couscous safran · Thé glacé",
              "12:39",
              "112 MAD",
              "NOUVELLE",
            ],
            ["G003-02", "Pavlova agrumes × 2", "12:36", "92 MAD", "VALIDÉE"],
          ].map((r, i) => (
            <div className="order-row" key={r[0]}>
              <strong>{r[0]}</strong>
              <span>{r[1]}</span>
              <span>{r[2]}</span>
              <b>{r[3]}</b>
              <span className={i < 2 ? "status-new" : "status-ok"}>{r[4]}</span>
              {i < 2 && (
                <div className="row-actions">
                  <button>REFUSER</button>
                  <button>VALIDER</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
function CataloguePanel({ role }: { role: string }) {
  return (
    <section className="pro-section">
      <div className="pro-section-head">
        <h2>{role === "partner" ? "Menu publié" : "Catalogue TAVO"}</h2>
        <button className="pro-primary">
          ＋ {role === "partner" ? "PROPOSER UN PLAT" : "NOUVEAU PLAT"}
        </button>
      </div>
      <div className="catalogue-list">
        {menu.map((x, i) => (
          <div key={x.name}>
            <img src={x.image} alt="" />
            <span>
              <small>{x.tag}</small>
              <b>{x.name}</b>
              <p>{x.note}</p>
            </span>
            <strong>{x.price} MAD</strong>
            <i className={i < 2 ? "published" : "draft"}>
              {i < 2 ? "PUBLIÉ" : "BROUILLON"}
            </i>
            <button>•••</button>
          </div>
        ))}
      </div>
    </section>
  );
}
function ProposalPanel() {
  return (
    <section className="pro-section">
      <div className="pro-section-head">
        <h2>Propositions en attente</h2>
        <button className="pro-primary">＋ NOUVELLE PROPOSITION</button>
      </div>
      <div className="proposal-card">
        <span>PRIX</span>
        <div>
          <small>PROPOSÉ PAR ATELIER NOYA · IL Y A 2 H</small>
          <h3>César Signature</h3>
          <p>
            Prix actuel <s>68 MAD</s> → prix proposé <b>72 MAD</b>
          </p>
        </div>
        <i>EN ATTENTE</i>
        <button>OUVRIR →</button>
      </div>
      <div className="proposal-card">
        <span>CROWN</span>
        <div>
          <small>PROPOSÉ PAR MAISON JUN · HIER</small>
          <h3>Le jardin secret</h3>
          <p>Nouvelle expérience pour deux personnes</p>
        </div>
        <i>EN ATTENTE</i>
        <button>OUVRIR →</button>
      </div>
    </section>
  );
}
function GenericPanel({ title, role }: { title: string; role: string }) {
  return (
    <section className="pro-section generic-panel">
      <div className="pro-section-head">
        <h2>{title}</h2>
        <button className="pro-primary">＋ NOUVEAU</button>
      </div>
      <div className="metric-line">
        <div>
          <small>PÉRIODE EN COURS</small>
          <b>{title === "Facturation" ? "4 820 MAD" : "24"}</b>
          <p>
            {title === "Facturation"
              ? "Commission TAVO · 12 %"
              : "éléments actifs"}
          </p>
        </div>
        <div>
          <small>CE MOIS</small>
          <b>{role === "partner" ? "40 166 MAD" : "186"}</b>
          <p>
            {role === "partner" ? "ventes TAVO validées" : "actions traitées"}
          </p>
        </div>
      </div>
      <div className="empty-editorial">
        <span>Tout est à jour.</span>
        <p>
          Cette section représentative sera reliée aux données métier après
          validation du prototype.
        </p>
      </div>
    </section>
  );
}

function ClientFooter() {
  return (
    <footer className="client-footer">
      <Brand />
      <p>
        TAVO est un catalogue visuel de plats et d’expériences disponibles chez
        un réseau de restaurants partenaires.
      </p>
      <div>
        <a href="/wallet">Wallet</a>
        <a href="/search">Explorer</a>
        <a href="/crown">Crown</a>
      </div>
      <small>Rabat · Sélection éditoriale TAVO</small>
    </footer>
  );
}

export function TavoApp({ screen, data }: { screen: Screen; data?: TavoData }) {
  if (screen === "wallet") return <Wallet />;
  if (screen === "search") return <Search data={data} />;
  if (screen === "collection") return <Collection data={data} />;
  if (screen === "dish") return <Dish data={data} />;
  if (screen === "restaurant") return <Restaurant data={data} />;
  if (screen === "crown") return <Crown data={data} />;
  if (screen === "crown-detail") return <Crown detail data={data} />;
  if (screen === "partner" || screen === "manager" || screen === "admin")
    return <Professional role={screen} />;
  return <Home data={data} />;
}

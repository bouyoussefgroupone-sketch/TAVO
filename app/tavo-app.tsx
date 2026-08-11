"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { useMemo, useState } from "react";

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
type CartItem = { name: string; price: number; qty: number };

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
        <small>Prototype local · aucune donnée personnelle requise</small>
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

function Home() {
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
          {[
            "Petit-déjeuner",
            "Salades",
            "Entrées",
            "Plats",
            "Desserts",
            "Boissons",
          ].map((item, i) => (
            <a key={item} href="/search" className={i === 1 ? "active" : ""}>
              <span>0{i + 1}</span>
              {item}
            </a>
          ))}
        </div>
      </section>

      <section className="editorial-grid wrap">
        <ImageCard
          title="César, autrement."
          meta="Choix de la rédaction"
          image="/images/cesar-signature.webp"
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
            {[
              {
                n: "01",
                t: "Nouveautés",
                d: "Les assiettes qui viennent d’arriver",
              },
              {
                n: "02",
                t: "Pour deux",
                d: "Des plats qui se partagent vraiment",
              },
              {
                n: "03",
                t: "Frais & vif",
                d: "Du croquant, du vert, de l’éclat",
              },
            ].map((c) => (
              <a href="/collection/frais-et-vif" key={c.n}>
                <span>{c.n}</span>
                <strong>{c.t}</strong>
                <p>{c.d}</p>
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

function Search() {
  const [query, setQuery] = useState("");
  const dishes = [
    "César Signature",
    "Couscous safran",
    "Carottes rôties",
    "Pavlova agrumes",
    "Œufs à la turque",
    "Tartare de daurade",
  ];
  const filtered = dishes.filter((d) =>
    d.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <main className="client-page pale-page">
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
      <section className="filters wrap" aria-label="Catégories">
        {[
          "Tout",
          "Petit-déjeuner",
          "Salades",
          "Entrées",
          "Plats",
          "Desserts",
          "Boissons",
        ].map((x, i) => (
          <button className={i === 0 ? "active" : ""} key={x}>
            {x}
          </button>
        ))}
      </section>
      <section className="dish-results wrap">
        {filtered.map((dish, i) => (
          <a href="/dish/cesar-signature" className="dish-result" key={dish}>
            <div className="dish-thumb">
              <img
                src={
                  i % 3 === 0
                    ? "/images/cesar-signature.webp"
                    : i % 3 === 1
                      ? "/images/tavo-table.webp"
                      : "/images/crown-dinner.webp"
                }
                alt=""
              />
              <span>{i < 2 ? "NOUVEAU" : "TAVO"}</span>
            </div>
            <div>
              <small>
                {i % 2
                  ? "PLAT · À PARTIR DE 72 MAD"
                  : "SALADE · À PARTIR DE 68 MAD"}
              </small>
              <h2>{dish}</h2>
              <p>
                {i % 2
                  ? "Une assiette généreuse, franche et lumineuse."
                  : "Croquante, fraîche, parfaitement équilibrée."}
              </p>
              <span className="labels">
                <i>HALAL</i>
                <i>{i % 2 ? "VÉGÉTARIEN" : "HIGH PROTEIN"}</i>
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

function Collection() {
  return (
    <main className="client-page pale-page">
      <ClientNav />
      <section className="collection-hero">
        <img src="/images/tavo-table.webp" alt="Plats frais et colorés" />
        <span className="shade" />
        <div>
          <p className="eyebrow">Collection 03 · Été 2026</p>
          <h1>
            Frais
            <br />& vif.
          </h1>
          <p>
            Des plats pleins d’herbes, de croquant et d’acidité. Pour les
            journées qui demandent de la légèreté, jamais de l’ennui.
          </p>
        </div>
      </section>
      <section className="collection-dishes wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">7 assiettes · 5 partenaires</p>
            <h2>Dans cette collection</h2>
          </div>
        </div>
        <div className="tiles">
          <ImageCard
            title="César Signature"
            meta="À partir de 68 MAD"
            image="/images/cesar-signature.webp"
            tall
          />
          <ImageCard
            title="Tartare de daurade"
            meta="Maison Jun · 92 MAD"
            image="/images/tavo-table.webp"
            tall
          />
          <ImageCard
            title="Agrumes & burrata"
            meta="Le Verger · 84 MAD"
            image="/images/crown-dinner.webp"
            tall
          />
        </div>
      </section>
      <ClientFooter />
    </main>
  );
}

function Dish() {
  return (
    <main className="client-page dish-page">
      <ClientNav />
      <section className="dish-hero">
        <div className="dish-photo">
          <img src="/images/cesar-signature.webp" alt="César Signature" />
          <a className="back-link" href="/search">
            ← Explorer
          </a>
          <span className="photo-index">01 / 03</span>
        </div>
        <div className="dish-copy">
          <p className="eyebrow">Salade · TAVO sélection</p>
          <h1>
            César
            <br />
            Signature.
          </h1>
          <p className="dish-lede">
            Une César précise et généreuse — romaine croquante, poulet fermier
            grillé, vieux parmesan et croûtons au levain.
          </p>
          <div className="dish-facts">
            <span>
              <small>À PARTIR DE</small>
              <b>68 MAD</b>
            </span>
            <span>
              <small>ÉNERGIE</small>
              <b>≈ 520 kcal</b>
              <i>ESTIMÉ</i>
            </span>
          </div>
          <div className="tag-row">
            <span>HALAL</span>
            <span>HIGH PROTEIN</span>
            <span>FRAIS</span>
          </div>
          <div className="ingredients">
            <small>INGRÉDIENTS PRINCIPAUX</small>
            <p>
              Romaine · poulet fermier · parmesan 24 mois · pain au levain ·
              citron · câpres
            </p>
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
          {offers.map((o, i) => (
            <a href="/restaurant/atelier-noya" key={o.name} className="offer">
              <span className="offer-no">0{i + 1}</span>
              <div>
                <h3>{o.name}</h3>
                <p>
                  {o.area} · {o.tone}
                </p>
              </div>
              <span className="offer-distance">{o.distance}</span>
              <strong>{o.price} MAD</strong>
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

function Restaurant() {
  const [inside, setInside] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderNo, setOrderNo] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const total = useMemo(
    () => cart.reduce((sum, x) => sum + x.price * x.qty, 0),
    [cart],
  );
  const add = (item: (typeof menu)[number]) =>
    setCart((prev) => {
      const found = prev.find((x) => x.name === item.name);
      return found
        ? prev.map((x) => (x.name === item.name ? { ...x, qty: x.qty + 1 } : x))
        : [...prev, { name: item.name, price: item.price, qty: 1 }];
    });
  const submit = () => {
    if (!cart.length) return;
    setOrderNo((x) => x + 1);
    setCart([]);
    setConfirmed(true);
  };
  return (
    <main
      className={`client-page restaurant-page ${inside ? "is-inside" : ""}`}
    >
      <ClientNav />
      <div
        className="dev-switch"
        role="group"
        aria-label="Simulation de présence"
      >
        <small>DEV · PRÉSENCE</small>
        <button
          className={!inside ? "active" : ""}
          onClick={() => setInside(false)}
        >
          À L’EXTÉRIEUR
        </button>
        <button
          className={inside ? "active" : ""}
          onClick={() => setInside(true)}
        >
          SUR PLACE
        </button>
      </div>
      <section className="restaurant-head wrap">
        <div>
          <a href="/dish/cesar-signature" className="back-link dark-back">
            ← César Signature
          </a>
          <p className="eyebrow">Restaurant partenaire · Agdal</p>
          <h1>
            Atelier
            <br />
            Noya.
          </h1>
        </div>
        <div className="restaurant-info">
          <p>
            12, avenue Fal Ould Oumeir
            <br />
            Agdal, Rabat
          </p>
          <span>1,8 km · environ 7 min</span>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=34.0024,-6.8498"
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
          </div>
          {inside && <small>AUTORISATION ACTIVE · 09:42</small>}
        </div>
      </div>
      <section className="restaurant-menu wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">La sélection disponible sur TAVO</p>
            <h2>Menu TAVO</h2>
          </div>
          <span>{menu.length} plats</span>
        </div>
        <div className="menu-list">
          {menu.map((item, i) => (
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
                <button
                  onClick={() => add(item)}
                  aria-label={`Ajouter ${item.name}`}
                >
                  ＋
                </button>
              )}
            </article>
          ))}
        </div>
      </section>
      {inside && (
        <aside className={`cart-bar ${cart.length ? "cart-open" : ""}`}>
          <div>
            <small>VOTRE COMMANDE</small>
            <strong>
              {cart.reduce((s, x) => s + x.qty, 0)} article
              {cart.reduce((s, x) => s + x.qty, 0) > 1 ? "s" : ""} · {total} MAD
            </strong>
          </div>
          <button onClick={submit} disabled={!cart.length}>
            Commander <span>→</span>
          </button>
        </aside>
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
              <em>G001-{String(orderNo).padStart(2, "0")}</em>
            </h2>
            <p>
              Votre commande est en attente de validation par le restaurant.
            </p>
            <div className="order-status">
              <span />
              <b>COMMANDE REÇUE</b>
              <span />
            </div>
            <button
              className="button button-dark"
              onClick={() => setConfirmed(false)}
            >
              Créer une nouvelle commande
            </button>
            <small>
              La prochaine commande sera indépendante&nbsp;: G001-
              {String(orderNo + 1).padStart(2, "0")}
            </small>
          </div>
        </div>
      )}
      <ClientFooter />
    </main>
  );
}

function Crown({ detail = false }: { detail?: boolean }) {
  if (detail)
    return (
      <main className="crown-page">
        <ClientNav dark />
        <section className="crown-detail-hero">
          <img src="/images/crown-dinner.webp" alt="Dîner Crown pour deux" />
          <span className="shade" />
          <a href="/crown" className="back-link">
            ← Crown
          </a>
          <div>
            <p className="eyebrow">Expérience privée · Édition limitée</p>
            <h1>
              La table
              <br />
              après minuit.
            </h1>
            <p>
              Un dîner en six gestes, imaginé pour deux autour des produits de
              la côte et des parfums de l’Atlas.
            </p>
          </div>
        </section>
        <section className="crown-story wrap">
          <div>
            <p className="eyebrow">Le scénario</p>
            <h2>Une soirée qui se déroule lentement.</h2>
          </div>
          <div>
            <p>
              Accueil au patio, première bouchée au feu de bois, quatre
              assiettes en salle puis un dernier service sous les lanternes. Une
              expérience pensée par le chef Amine Berrada.
            </p>
            <div className="crown-facts">
              <span>
                <small>POUR</small>
                <b>2 personnes</b>
              </span>
              <span>
                <small>DURÉE</small>
                <b>≈ 2 h 30</b>
              </span>
              <span>
                <small>À PARTIR DE</small>
                <b>980 MAD</b>
              </span>
            </div>
            <a className="button button-gold" href="/restaurant/atelier-noya">
              Voir les adresses →
            </a>
          </div>
        </section>
      </main>
    );
  return (
    <main className="crown-page">
      <ClientNav dark />
      <section className="crown-home-hero">
        <img src="/images/crown-dinner.webp" alt="Univers TAVO Crown" />
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
            Des expériences rares, imaginées avec les tables les plus
            singulières de Rabat.
          </p>
          <a className="button button-gold" href="/crown/la-table-apres-minuit">
            Découvrir l’expérience →
          </a>
        </div>
        <span className="scroll-note">DÉFILER · 01 / 04</span>
      </section>
      <section className="crown-selection wrap">
        <p className="eyebrow">La sélection Crown</p>
        <h2>
          Quatre façons de
          <br />
          sortir de l’ordinaire.
        </h2>
        <div className="crown-cards">
          {[
            "La table après minuit",
            "Le jardin secret",
            "Feu, sel & Atlantique",
            "Dimanche en grand",
          ].map((x, i) => (
            <a href="/crown/la-table-apres-minuit" key={x}>
              <span>0{i + 1}</span>
              <h3>{x}</h3>
              <p>
                {i === 0
                  ? "Dîner en six gestes · pour 2"
                  : "Expérience signature · places limitées"}
              </p>
              <i>↗</i>
            </a>
          ))}
        </div>
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
      "Menu TAVO",
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
    nav: ["Restaurants", "Propositions", "Commandes", "Opérations"],
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
      "Opérations",
    ],
    title: "Vue d’ensemble",
    subtitle: "Le catalogue, les partenaires et l’activité TAVO aujourd’hui.",
  },
};

function Professional({ role }: { role: "partner" | "manager" | "admin" }) {
  const d = professionalData[role];
  const [active, setActive] = useState(d.nav[0]);
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
            <small>Se déconnecter</small>
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
        {active.toLowerCase().includes("commande") ||
        active === "Vue d’ensemble" ? (
          <OrdersPanel role={role} />
        ) : active.includes("Menu") || active === "Catalogue" ? (
          <CataloguePanel role={role} />
        ) : active.includes("Proposition") ? (
          <ProposalPanel />
        ) : (
          <GenericPanel title={active} role={role} />
        )}
      </section>
    </main>
  );
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
        <a href="/partner">Partenaire</a>
        <a href="/manager">Manager</a>
        <a href="/admin">Admin</a>
      </div>
      <small>Prototype local · Données et établissements fictifs</small>
    </footer>
  );
}

export function TavoApp({ screen }: { screen: Screen }) {
  if (screen === "wallet") return <Wallet />;
  if (screen === "search") return <Search />;
  if (screen === "collection") return <Collection />;
  if (screen === "dish") return <Dish />;
  if (screen === "restaurant") return <Restaurant />;
  if (screen === "crown") return <Crown />;
  if (screen === "crown-detail") return <Crown detail />;
  if (screen === "partner" || screen === "manager" || screen === "admin")
    return <Professional role={screen} />;
  return <Home />;
}

import { PGlite } from "@electric-sql/pglite";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { loadLocalEnv } from "./env";

loadLocalEnv();
const databasePath = process.env.DATABASE_PATH || ".data/tavo-pg";
await fs.mkdir(path.dirname(databasePath), { recursive: true });
const db = new PGlite(databasePath);

await db.exec(`TRUNCATE audit_log, media_assets, billing_statements, support_tickets, proposals,
  order_items, orders, visit_sessions, presence_authorizations, professional_sessions,
  crown_offers, crown_experiences, collection_dishes, restaurant_offers, dish_labels,
  dishes, labels, collections, categories, user_restaurants, users, restaurants, sectors,
  cities, settings RESTART IDENTITY CASCADE`);

async function insertId(sql: string, values: unknown[]) {
  const result = await db.query<{ id: number }>(sql, values);
  return result.rows[0].id;
}

const rabatId = await insertId("INSERT INTO cities(name,slug,status) VALUES($1,$2,'PUBLISHED') RETURNING id", ["Rabat", "rabat"]);
const sectorNames = ["Agdal", "Hay Riad", "Souissi", "Hassan", "Océan"];
const sectorIds: Record<string, number> = {};
for (const name of sectorNames) {
  sectorIds[name] = await insertId("INSERT INTO sectors(city_id,name,slug,status) VALUES($1,$2,$3,'PUBLISHED') RETURNING id", [rabatId, name, name.toLowerCase().replace(" ", "-")]);
}

const restaurants = [
  ["Atelier Noya", "atelier-noya", "Agdal", "12, avenue Fal Ould Oumeir", 34.0024, -6.8498, "/images/tavo-table.webp"],
  ["Maison Jun", "maison-jun", "Hay Riad", "8, rue Al Melia", 33.9578, -6.8707, "/images/crown-dinner.webp"],
  ["Le Verger", "le-verger", "Souissi", "21, avenue Mehdi Ben Barka", 33.9791, -6.8292, "/images/tavo-table.webp"],
  ["Dar Lune", "dar-lune", "Hassan", "4, rue Oued Fès", 34.0212, -6.8335, "/images/crown-dinner.webp"],
  ["Sillage", "sillage", "Océan", "31, avenue Abdelkrim Khattabi", 34.0248, -6.8532, "/images/cesar-signature.webp"],
  ["Orangerie 17", "orangerie-17", "Hay Riad", "17, avenue Annakhil", 33.9589, -6.8681, "/images/tavo-table.webp"],
] as const;
const restaurantIds: Record<string, number> = {};
for (const [name, slug, sector, address, latitude, longitude, image] of restaurants) {
  restaurantIds[slug] = await insertId(`INSERT INTO restaurants(name,slug,city_id,sector_id,address,latitude,longitude,ordering_radius_m,description,image_url,status)
    VALUES($1,$2,$3,$4,$5,$6,$7,10,$8,$9,'PUBLISHED') RETURNING id`, [name, slug, rabatId, sectorIds[sector], address, latitude, longitude, "Adresse partenaire de démonstration TAVO.", image]);
}

const categoryData = ["Petit-déjeuner", "Salades", "Entrées", "Plats", "Desserts", "Boissons"];
const categoryIds: Record<string, number> = {};
for (const [index, name] of categoryData.entries()) {
  const slug = ["petit-dejeuner", "salades", "entrees", "plats", "desserts", "boissons"][index];
  categoryIds[slug] = await insertId("INSERT INTO categories(name,slug,description,sort_order,status) VALUES($1,$2,$3,$4,'PUBLISHED') RETURNING id", [name, slug, `Sélection ${name.toLowerCase()} TAVO.`, index]);
}

const collectionData = [
  ["Nouveautés", "nouveautes", "Les assiettes qui viennent d’arriver"],
  ["Pour deux", "pour-deux", "Des plats qui se partagent vraiment"],
  ["Frais & vif", "frais-et-vif", "Du croquant, du vert et de l’éclat"],
  ["Premium", "premium", "Les créations les plus singulières"],
];
const collectionIds: Record<string, number> = {};
for (const [index, [name, slug, description]] of collectionData.entries()) {
  collectionIds[slug] = await insertId("INSERT INTO collections(name,slug,description,cover_url,sort_order,status) VALUES($1,$2,$3,$4,$5,'PUBLISHED') RETURNING id", [name, slug, description, "/images/tavo-table.webp", index]);
}

const labelNames = ["HALAL", "BIO", "HEALTHY", "VEGAN", "VÉGÉTARIEN", "SPICY", "HIGH PROTEIN"];
const labelIds: Record<string, number> = {};
for (const name of labelNames) labelIds[name] = await insertId("INSERT INTO labels(name,slug,status) VALUES($1,$2,'PUBLISHED') RETURNING id", [name, name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" ", "-")]);

const dishData = [
  ["César Signature", "cesar-signature", "Salades", "Une César précise et généreuse, romaine croquante et poulet fermier.", "Romaine · poulet fermier · parmesan · levain · citron", "/images/cesar-signature.webp", 520, "ESTIMATED"],
  ["Carottes rôties", "carottes-roties", "Entrées", "Carottes au feu, harissa douce et labneh fumé.", "Carottes · labneh · harissa · herbes", "/images/tavo-table.webp", 310, "ESTIMATED"],
  ["Couscous safran", "couscous-safran", "Plats", "Semoule fine, légumes de saison et grenade.", "Semoule · légumes · safran · grenade", "/images/tavo-table.webp", 610, "VERIFIED"],
  ["Pavlova agrumes", "pavlova-agrumes", "Desserts", "Agrumes, fleur d’oranger et pistache.", "Meringue · agrumes · crème · pistache", "/images/crown-dinner.webp", 390, "ESTIMATED"],
  ["Œufs à la turque", "oeufs-turque", "Petit-déjeuner", "Yaourt aux herbes, œufs mollets et beurre pimenté.", "Œufs · yaourt · herbes · piment", "/images/tavo-table.webp", 430, "ESTIMATED"],
  ["Tartare de daurade", "tartare-daurade", "Entrées", "Daurade, agrumes et huile d’argan.", "Daurade · agrumes · argan", "/images/cesar-signature.webp", 280, "VERIFIED"],
  ["Burger Signature", "burger-signature", "Plats", "Bœuf grillé, cheddar affiné et condiment maison.", "Bœuf · pain brioché · cheddar · condiment", "/images/tavo-table.webp", 760, "ESTIMATED"],
  ["Frites au ras el-hanout", "frites-ras-el-hanout", "Plats", "Pommes de terre croustillantes et épices douces.", "Pomme de terre · ras el-hanout", "/images/tavo-table.webp", 420, "ESTIMATED"],
  ["Tiramisu café blanc", "tiramisu-cafe-blanc", "Desserts", "Mascarpone et café blanc à la fleur d’oranger.", "Mascarpone · café · fleur d’oranger", "/images/crown-dinner.webp", 470, "ESTIMATED"],
  ["Café & cardamome", "cafe-cardamome", "Boissons", "Espresso de spécialité parfumé à la cardamome.", "Café · cardamome", "/images/crown-dinner.webp", 12, "VERIFIED"],
] as const;
const dishIds: Record<string, number> = {};
for (const [name, slug, category, description, ingredients, image, kcal, kcalStatus] of dishData) {
  const categorySlug = category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(" ", "-");
  dishIds[slug] = await insertId(`INSERT INTO dishes(name,slug,description,ingredients,image_url,kcal,kcal_status,category_id,status)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,'PUBLISHED') RETURNING id`, [name, slug, description, ingredients, image, kcal, kcalStatus, categoryIds[categorySlug]]);
}

for (const slug of Object.keys(dishIds)) {
  const names = slug.includes("carottes") || slug.includes("couscous") ? ["HALAL", "VÉGÉTARIEN"] : slug.includes("cesar") || slug.includes("burger") ? ["HALAL", "HIGH PROTEIN"] : ["HALAL"];
  for (const label of names) await db.query("INSERT INTO dish_labels(dish_id,label_id,approved) VALUES($1,$2,true)", [dishIds[slug], labelIds[label]]);
}

const slugs = Object.keys(dishIds);
for (const [restaurantIndex, restaurant] of restaurants.entries()) {
  const restaurantId = restaurantIds[restaurant[1]];
  for (let i = 0; i < 8; i++) {
    const slug = slugs[(i + restaurantIndex) % slugs.length];
    await db.query(`INSERT INTO restaurant_offers(restaurant_id,dish_id,price_cents,is_featured,available,sort_order,status)
      VALUES($1,$2,$3,$4,true,$5,'PUBLISHED')`, [restaurantId, dishIds[slug], 4200 + i * 700 + restaurantIndex * 200, i < 2, i]);
  }
}

for (const slug of ["cesar-signature", "carottes-roties", "couscous-safran", "pavlova-agrumes", "tartare-daurade"]) {
  await db.query("INSERT INTO collection_dishes(collection_id,dish_id,sort_order) VALUES($1,$2,$3)", [collectionIds["frais-et-vif"], dishIds[slug], Object.keys(dishIds).indexOf(slug)]);
}

const crownData = [
  ["La table après minuit", "la-table-apres-minuit", "Un dîner en six gestes pour deux, entre côte Atlantique et parfums de l’Atlas."],
  ["Le jardin secret", "le-jardin-secret", "Une table privée au jardin et un menu végétal de saison."],
  ["Feu, sel & Atlantique", "feu-sel-atlantique", "Une dégustation autour des poissons, du feu et des agrumes."],
  ["Dimanche en grand", "dimanche-en-grand", "Un déjeuner généreux imaginé pour les longues tablées."],
];
for (const [index, [name, slug, description]] of crownData.entries()) {
  const experienceId = await insertId("INSERT INTO crown_experiences(name,slug,description,image_url,featured,status) VALUES($1,$2,$3,$4,$5,'PUBLISHED') RETURNING id", [name, slug, description, "/images/crown-dinner.webp", index === 0]);
  await db.query("INSERT INTO crown_offers(experience_id,restaurant_id,price_cents,availability_note,status) VALUES($1,$2,$3,$4,'PUBLISHED')", [experienceId, restaurantIds[restaurants[index % restaurants.length][1]], 68000 + index * 10000, "Sur réservation auprès du restaurant"]);
}

const adminHash = await bcrypt.hash(process.env.TAVO_ADMIN_PASSWORD || "TavoAdmin!2026", 12);
const managerHash = await bcrypt.hash(process.env.TAVO_MANAGER_PASSWORD || "TavoManager!2026", 12);
const partnerHash = await bcrypt.hash(process.env.TAVO_PARTNER_PASSWORD || "TavoPartner!2026", 12);
const adminId = await insertId("INSERT INTO users(email,name,password_hash,role,status) VALUES($1,'Salma Benali',$2,'ADMIN','ACTIVE') RETURNING id", [process.env.TAVO_ADMIN_EMAIL || "admin@tavo.local", adminHash]);
const managerId = await insertId("INSERT INTO users(email,name,password_hash,role,city_id,sector_id,status) VALUES($1,'Yassine Mansour',$2,'MANAGER',$3,$4,'ACTIVE') RETURNING id", [process.env.TAVO_MANAGER_EMAIL || "manager.rabat@tavo.local", managerHash, rabatId, sectorIds.Agdal]);
const partnerId = await insertId("INSERT INTO users(email,name,password_hash,role,status) VALUES($1,'Équipe Noya',$2,'PARTNER','ACTIVE') RETURNING id", [process.env.TAVO_PARTNER_EMAIL || "partner.noya@tavo.local", partnerHash]);
await db.query("INSERT INTO user_restaurants(user_id,restaurant_id) VALUES($1,$2)", [partnerId, restaurantIds["atelier-noya"]]);
await db.query("INSERT INTO settings(key,value) VALUES('default_commission_bps',$1),('visit_lifetime_minutes',$2),('presence_lifetime_minutes',$3)", [JSON.stringify(1200), JSON.stringify(180), JSON.stringify(10)]);

await db.query(`INSERT INTO proposals(restaurant_id,submitted_by,type,payload,status)
  VALUES($1,$2,'PRICE_UPDATE',$3,'PENDING'),($1,$2,'CROWN',$4,'PENDING')`, [restaurantIds["atelier-noya"], partnerId, JSON.stringify({ offerId: 1, proposedPriceCents: 7200 }), JSON.stringify({ name: "Dîner au patio", description: "Expérience privée proposée par Atelier Noya" })]);
await db.query("INSERT INTO support_tickets(restaurant_id,created_by,subject,category,message,status) VALUES($1,$2,$3,$4,$5,'OPEN')", [restaurantIds["atelier-noya"], partnerId, "Mise à jour des horaires", "INFORMATIONS", "Pouvez-vous vérifier les horaires du dimanche ?"]);
await db.query("INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id,details) VALUES($1,'SEED','SYSTEM',$2,$3)", [adminId, randomUUID(), JSON.stringify({ demo: true, managerId, partnerId })]);

console.log("TAVO demo data seeded.");
await db.close();

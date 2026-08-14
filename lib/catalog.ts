import { one, rows } from "./db";

export type CatalogDish = {
  id: number; name: string; slug: string; description: string; ingredients: string;
  image_url: string | null; kcal: number | null; kcal_status: "VERIFIED" | "ESTIMATED" | null;
  category_name: string | null; category_slug: string | null; from_price_cents: number; labels: string[];
};

export type RestaurantOffer = {
  id: number; dish_id: number; name: string; slug: string; description: string;
  ingredients: string; image_url: string | null; price_cents: number; labels: string[];
};

export type RestaurantView = {
  id: number; name: string; slug: string; address: string; sector: string;
  latitude: number; longitude: number; ordering_radius_m: number; description: string;
  offers: RestaurantOffer[];
};

async function publicDishes(where = "", params: unknown[] = []): Promise<CatalogDish[]> {
  const data = await rows<Omit<CatalogDish, "labels"> & { labels: string[] | null }>(`SELECT d.id,d.name,d.slug,d.description,d.ingredients,d.image_url,d.kcal,d.kcal_status,
    c.name AS category_name,c.slug AS category_slug,min(o.price_cents)::integer AS from_price_cents,
    COALESCE(array_agg(DISTINCT l.name) FILTER (WHERE l.name IS NOT NULL AND dl.approved), ARRAY[]::text[]) AS labels
    FROM dishes d LEFT JOIN categories c ON c.id=d.category_id
    JOIN restaurant_offers o ON o.dish_id=d.id AND o.status='PUBLISHED' AND o.available
    LEFT JOIN dish_labels dl ON dl.dish_id=d.id LEFT JOIN labels l ON l.id=dl.label_id AND l.status='PUBLISHED'
    WHERE d.status='PUBLISHED' ${where}
    GROUP BY d.id,c.name,c.slug ORDER BY d.id`, params);
  return data.map((dish) => ({ ...dish, labels: dish.labels ?? [] }));
}

export async function getHomeData() {
  const [categories, collections, dishes, crown] = await Promise.all([
    rows<{ id:number; name:string; slug:string; description:string; cover_url:string|null }>("SELECT id,name,slug,description,cover_url FROM categories WHERE status='PUBLISHED' ORDER BY sort_order,id"),
    rows<{ id:number; name:string; slug:string; description:string; cover_url:string|null }>("SELECT id,name,slug,description,cover_url FROM collections WHERE status='PUBLISHED' ORDER BY sort_order,id"),
    publicDishes("AND EXISTS (SELECT 1 FROM restaurant_offers f WHERE f.dish_id=d.id AND f.is_featured AND f.status='PUBLISHED')"),
    rows<{ id:number; name:string; slug:string; description:string; image_url:string|null }>("SELECT id,name,slug,description,image_url FROM crown_experiences WHERE status='PUBLISHED' ORDER BY featured DESC,id"),
  ]);
  return { categories, collections, dishes, crown };
}

export async function getSearchData(category = "", query = "") {
  const home = await getHomeData();
  return { ...home, dishes: await publicDishes(), searchCategory: category, searchQuery: query };
}

export async function getDishData(slug: string) {
  const dish = (await publicDishes("AND d.slug=$1", [slug]))[0] ?? null;
  if (!dish) return null;
  const offers = await rows<{ offer_id:number; restaurant_id:number; restaurant_name:string; restaurant_slug:string; sector:string; price_cents:number; latitude:number; longitude:number; description:string }>(`SELECT o.id AS offer_id,r.id AS restaurant_id,r.name AS restaurant_name,r.slug AS restaurant_slug,s.name AS sector,
    o.price_cents,r.latitude,r.longitude,r.description FROM restaurant_offers o JOIN restaurants r ON r.id=o.restaurant_id
    JOIN sectors s ON s.id=r.sector_id WHERE o.dish_id=$1 AND o.status='PUBLISHED' AND o.available AND r.status='PUBLISHED' ORDER BY o.price_cents`, [dish.id]);
  return { ...dish, offers };
}

export async function getRestaurantData(slug: string): Promise<RestaurantView | null> {
  const restaurant = await one<Omit<RestaurantView, "offers">>(`SELECT r.id,r.name,r.slug,r.address,s.name AS sector,r.latitude,r.longitude,
    r.ordering_radius_m::double precision,r.description FROM restaurants r JOIN sectors s ON s.id=r.sector_id WHERE r.slug=$1 AND r.status='PUBLISHED'`, [slug]);
  if (!restaurant) return null;
  const offersRaw = await rows<Omit<RestaurantOffer, "labels"> & { labels: string[] | null }>(`SELECT o.id,d.id AS dish_id,COALESCE(o.name_override,d.name) AS name,d.slug,
    COALESCE(o.description_override,d.description) AS description,d.ingredients,COALESCE(o.image_override,d.image_url) AS image_url,
    o.price_cents,COALESCE(array_agg(DISTINCT l.name) FILTER (WHERE l.name IS NOT NULL AND dl.approved),ARRAY[]::text[]) AS labels
    FROM restaurant_offers o JOIN dishes d ON d.id=o.dish_id
    LEFT JOIN dish_labels dl ON dl.dish_id=d.id LEFT JOIN labels l ON l.id=dl.label_id AND l.status='PUBLISHED'
    WHERE o.restaurant_id=$1 AND o.status='PUBLISHED' AND o.available AND d.status='PUBLISHED'
    GROUP BY o.id,d.id ORDER BY o.sort_order,o.id`, [restaurant.id]);
  return { ...restaurant, offers: offersRaw.map((offer) => ({ ...offer, labels: offer.labels ?? [] })) };
}

export async function getCollectionData(slug: string) {
  const collection = await one<{ id:number; name:string; slug:string; description:string; cover_url:string|null }>("SELECT id,name,slug,description,cover_url FROM collections WHERE slug=$1 AND status='PUBLISHED'", [slug]);
  if (!collection) return null;
  const dishIds = await rows<{ dish_id:number }>("SELECT dish_id FROM collection_dishes WHERE collection_id=$1 ORDER BY sort_order", [collection.id]);
  const dishes = await Promise.all(dishIds.map(async ({ dish_id }) => (await publicDishes("AND d.id=$1", [dish_id]))[0]));
  return { ...collection, dishes: dishes.filter(Boolean) };
}

export async function getCrownData(slug?: string, categorySlug = "") {
  const categories = await rows<{ id:number; name:string; slug:string; description:string; cover_url:string|null }>("SELECT id,name,slug,description,cover_url FROM crown_categories WHERE status='PUBLISHED' ORDER BY sort_order,id");
  const conditions = ["e.status='PUBLISHED'"];
  const params: unknown[] = [];
  if (slug) { params.push(slug); conditions.push(`e.slug=$${params.length}`); }
  if (categorySlug) { params.push(categorySlug); conditions.push(`c.slug=$${params.length}`); }
  const experiences = await rows<{ id:number; name:string; slug:string; description:string; image_url:string|null; featured:boolean; category_name:string|null; category_slug:string|null; capacity_label:string; included_text:string; badges_text:string; gallery_urls:string[]; sort_order:number }>(`SELECT e.id,e.name,e.slug,e.description,e.image_url,e.featured,e.capacity_label,e.included_text,e.badges_text,e.gallery_urls,e.sort_order,c.name AS category_name,c.slug AS category_slug
    FROM crown_experiences e LEFT JOIN crown_categories c ON c.id=e.category_id
    WHERE ${conditions.join(" AND ")} ORDER BY e.featured DESC,e.sort_order,e.id`, params);
  if (!slug) return { categories, experiences, selectedCategory: categorySlug };
  const experience = experiences[0];
  if (!experience) return null;
  const offers = await rows<{ restaurant_name:string; restaurant_slug:string; price_cents:number; availability_note:string }>(`SELECT r.name AS restaurant_name,r.slug AS restaurant_slug,o.price_cents,o.availability_note
    FROM crown_offers o JOIN restaurants r ON r.id=o.restaurant_id WHERE o.experience_id=$1 AND o.status='PUBLISHED' AND r.status='PUBLISHED' ORDER BY o.price_cents`, [experience.id]);
  return { categories, experience, offers };
}

export type TavoData = Awaited<ReturnType<typeof getHomeData>> & {
  dish?: Awaited<ReturnType<typeof getDishData>>;
  restaurant?: RestaurantView | null;
  collection?: Awaited<ReturnType<typeof getCollectionData>>;
  crownDetail?: Awaited<ReturnType<typeof getCrownData>>;
  searchCategory?: string;
  searchQuery?: string;
};

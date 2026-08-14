import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { canAccessRestaurant, getCurrentUser, type ProfessionalUser } from "@/lib/auth";
import { one, rows } from "@/lib/db";

function unauthorized() { return NextResponse.json({ error: "Authentification requise." }, { status: 401 }); }
function forbidden() { return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 }); }

async function scopedRestaurantIds(user: ProfessionalUser) {
  if (user.role === "ADMIN") return (await rows<{ id:number }>("SELECT id FROM restaurants WHERE status<>'ARCHIVED'")).map((r) => r.id);
  if (user.role === "PARTNER") return (await rows<{ restaurant_id:number }>("SELECT restaurant_id FROM user_restaurants WHERE user_id=$1", [user.id])).map((r) => r.restaurant_id);
  return (await rows<{ id:number }>("SELECT id FROM restaurants WHERE city_id=$1 AND ($2::integer IS NULL OR sector_id=$2) AND status<>'ARCHIVED'", [user.city_id, user.sector_id])).map((r) => r.id);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const restaurantIds = await scopedRestaurantIds(user);
  const safeIds = restaurantIds.length ? restaurantIds : [-1];
  const [restaurants, orders, offers, proposals, support, statements, categories, collections, labels, dishes, crownCategories, crown, users, cities, sectors] = await Promise.all([
    rows(`SELECT r.id,r.name,r.slug,r.city_id,r.sector_id,r.address,r.latitude::double precision,r.longitude::double precision,r.status,r.ordering_radius_m::double precision,r.commission_bps,c.name AS city,s.name AS sector
      FROM restaurants r JOIN cities c ON c.id=r.city_id JOIN sectors s ON s.id=r.sector_id WHERE r.id=ANY($1::int[]) ORDER BY r.name`, [safeIds]),
    rows(`SELECT o.id,o.reference,o.restaurant_id,r.name AS restaurant_name,o.status,o.gross_cents,o.commission_cents,o.billable,o.submitted_at,
      COALESCE(json_agg(json_build_object('name',i.item_name,'quantity',i.quantity,'unitPriceCents',i.unit_price_cents)) FILTER (WHERE i.id IS NOT NULL),'[]') AS items
      FROM orders o JOIN restaurants r ON r.id=o.restaurant_id LEFT JOIN order_items i ON i.order_id=o.id
      WHERE o.restaurant_id=ANY($1::int[]) GROUP BY o.id,r.name ORDER BY o.submitted_at DESC LIMIT 100`, [safeIds]),
    rows(`SELECT o.id,o.restaurant_id,r.name AS restaurant_name,d.name AS dish_name,d.slug,o.price_cents,o.is_featured,o.available,o.status
      FROM restaurant_offers o JOIN restaurants r ON r.id=o.restaurant_id JOIN dishes d ON d.id=o.dish_id WHERE o.restaurant_id=ANY($1::int[]) ORDER BY r.name,o.sort_order`, [safeIds]),
    rows(`SELECT p.id,p.restaurant_id,r.name AS restaurant_name,p.type,p.payload,p.status,p.created_at,u.name AS submitted_by_name
      FROM proposals p JOIN restaurants r ON r.id=p.restaurant_id JOIN users u ON u.id=p.submitted_by WHERE p.restaurant_id=ANY($1::int[]) ORDER BY p.created_at DESC`, [safeIds]),
    rows(`SELECT t.id,t.restaurant_id,r.name AS restaurant_name,t.subject,t.category,t.message,t.status,t.response,t.created_at
      FROM support_tickets t LEFT JOIN restaurants r ON r.id=t.restaurant_id WHERE t.restaurant_id=ANY($1::int[]) OR $2='ADMIN' ORDER BY t.created_at DESC`, [safeIds, user.role]),
    rows(`SELECT b.id,b.restaurant_id,r.name AS restaurant_name,b.period_start,b.period_end,b.gross_cents,b.commission_cents,b.status
      FROM billing_statements b JOIN restaurants r ON r.id=b.restaurant_id WHERE b.restaurant_id=ANY($1::int[]) ORDER BY b.period_end DESC`, [safeIds]),
    user.role === "ADMIN" ? rows("SELECT id,name,slug,description,sort_order,status FROM categories ORDER BY sort_order,id") : Promise.resolve([]),
    user.role === "ADMIN" ? rows("SELECT id,name,slug,description,sort_order,status FROM collections ORDER BY sort_order,id") : Promise.resolve([]),
    user.role === "ADMIN" ? rows("SELECT id,name,slug,status FROM labels ORDER BY name") : Promise.resolve([]),
    user.role !== "PARTNER" ? rows("SELECT d.id,d.name,d.slug,d.description,d.ingredients,d.status,d.category_id,c.name AS category_name FROM dishes d LEFT JOIN categories c ON c.id=d.category_id ORDER BY d.name") : Promise.resolve([]),
    user.role === "ADMIN" ? rows("SELECT id,name,slug,description,cover_url,sort_order,status FROM crown_categories ORDER BY sort_order,id") : Promise.resolve([]),
    user.role === "ADMIN" ? rows(`SELECT e.id,e.name,e.slug,e.description,e.image_url,e.featured,e.status,e.category_id,e.capacity_label,e.included_text,e.badges_text,e.gallery_urls,e.sort_order,c.name AS category_name
      FROM crown_experiences e LEFT JOIN crown_categories c ON c.id=e.category_id ORDER BY e.featured DESC,e.sort_order,e.id`) : Promise.resolve([]),
    user.role === "ADMIN" ? rows(`SELECT u.id,u.name,u.email,u.role,u.city_id,u.sector_id,u.status,
      COALESCE(string_agg(r.name, ', ' ORDER BY r.name),'') AS restaurant_scope
      FROM users u LEFT JOIN user_restaurants ur ON ur.user_id=u.id LEFT JOIN restaurants r ON r.id=ur.restaurant_id
      GROUP BY u.id ORDER BY u.role,u.name`) : Promise.resolve([]),
    user.role === "ADMIN" ? rows("SELECT id,name,slug,status FROM cities ORDER BY name") : Promise.resolve([]),
    user.role === "ADMIN" ? rows("SELECT id,city_id,name,slug,status FROM sectors ORDER BY name") : Promise.resolve([]),
  ]);
  const liveBilling = await rows<{ restaurant_id:number; gross_cents:number; commission_cents:number }>(`SELECT restaurant_id,COALESCE(sum(gross_cents),0)::integer AS gross_cents,
    COALESCE(sum(commission_cents),0)::integer AS commission_cents FROM orders WHERE restaurant_id=ANY($1::int[]) AND status='VALIDATED' AND billable GROUP BY restaurant_id`, [safeIds]);
  return NextResponse.json({ user, restaurants, orders, offers, proposals, support, statements, liveBilling, categories, collections, labels, dishes, crownCategories, crown, users, cities, sectors });
}

const actionSchema = z.object({ action: z.string(), payload: z.record(z.string(), z.unknown()).default({}) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const parsed = actionSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Action invalide." }, { status: 400 });
  const { action, payload } = parsed.data;

  try {
    if (action === "order-status") {
      const orderId = String(payload.orderId || "");
      const status = String(payload.status || "");
      if (!["VALIDATED", "DECLINED", "CANCELLED"].includes(status)) return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
      const order = await one<{ restaurant_id:number; status:string }>("SELECT restaurant_id,status FROM orders WHERE id=$1", [orderId]);
      if (!order || !(await canAccessRestaurant(user, order.restaurant_id))) return forbidden();
      if (order.status !== "PENDING" && !(status === "CANCELLED" && order.status === "VALIDATED")) return NextResponse.json({ error: "Transition de statut impossible." }, { status: 409 });
      await rows(`UPDATE orders SET status=$1,billable=$2,validated_at=CASE WHEN $1='VALIDATED' THEN now() ELSE validated_at END,
        cancelled_at=CASE WHEN $1='CANCELLED' THEN now() ELSE cancelled_at END WHERE id=$3`, [status, status === "VALIDATED", orderId]);
      await audit(user, "ORDER_STATUS", "ORDER", orderId, { status });
      return NextResponse.json({ ok: true });
    }

    if (action === "proposal-create") {
      if (user.role !== "PARTNER") return forbidden();
      const restaurantId = Number(payload.restaurantId);
      if (!(await canAccessRestaurant(user, restaurantId))) return forbidden();
      const type = String(payload.type);
      if (!["NEW_ITEM","PRICE_UPDATE","DESCRIPTION_UPDATE","IMAGE_UPDATE","ITEM_REMOVAL","CROWN"].includes(type)) return NextResponse.json({ error: "Type invalide." }, { status: 400 });
      await rows("INSERT INTO proposals(restaurant_id,submitted_by,type,payload,status) VALUES($1,$2,$3,$4,'PENDING')", [restaurantId, user.id, type, JSON.stringify(payload.data ?? {})]);
      return NextResponse.json({ ok: true });
    }

    if (action === "proposal-review") {
      if (user.role === "PARTNER") return forbidden();
      const proposal = await one<{ id:number; restaurant_id:number; type:string; payload:Record<string,unknown>; status:string }>("SELECT id,restaurant_id,type,payload,status FROM proposals WHERE id=$1", [Number(payload.proposalId)]);
      if (!proposal || proposal.status !== "PENDING" || !(await canAccessRestaurant(user, proposal.restaurant_id))) return forbidden();
      const decision = String(payload.decision);
      if (!['APPROVED','REJECTED'].includes(decision)) return NextResponse.json({ error: "Décision invalide." }, { status: 400 });
      if (decision === "APPROVED") await applyProposal(proposal);
      await rows("UPDATE proposals SET status=$1,reviewed_by=$2,reviewed_at=now() WHERE id=$3", [decision, user.id, proposal.id]);
      await audit(user, "PROPOSAL_REVIEW", "PROPOSAL", String(proposal.id), { decision });
      return NextResponse.json({ ok: true });
    }

    if (action === "support-create") {
      const restaurantId = Number(payload.restaurantId);
      if (!(await canAccessRestaurant(user, restaurantId))) return forbidden();
      await rows("INSERT INTO support_tickets(restaurant_id,created_by,subject,category,message,status) VALUES($1,$2,$3,$4,$5,'OPEN')", [restaurantId,user.id,String(payload.subject),String(payload.category),String(payload.message)]);
      return NextResponse.json({ ok: true });
    }

    if (action === "support-update") {
      if (user.role === "PARTNER") return forbidden();
      const ticket = await one<{ restaurant_id:number }>("SELECT restaurant_id FROM support_tickets WHERE id=$1", [Number(payload.ticketId)]);
      if (!ticket || !(await canAccessRestaurant(user,ticket.restaurant_id))) return forbidden();
      await rows("UPDATE support_tickets SET status=$1,response=$2 WHERE id=$3", [String(payload.status),String(payload.response || ""),Number(payload.ticketId)]);
      return NextResponse.json({ ok: true });
    }

    if (action === "offer-update") {
      const offer = await one<{ restaurant_id:number }>("SELECT restaurant_id FROM restaurant_offers WHERE id=$1", [Number(payload.offerId)]);
      if (!offer || !(await canAccessRestaurant(user, offer.restaurant_id)) || user.role === "PARTNER") return forbidden();
      await rows("UPDATE restaurant_offers SET is_featured=COALESCE($1,is_featured),available=COALESCE($2,available),price_cents=COALESCE($3,price_cents),status=COALESCE($4,status) WHERE id=$5", [payload.isFeatured ?? null,payload.available ?? null,payload.priceCents ?? null,payload.status ?? null,Number(payload.offerId)]);
      return NextResponse.json({ ok: true });
    }

    if (action === "offer-create") {
      if (user.role === "PARTNER") return forbidden();
      const restaurantId = Number(payload.restaurantId);
      if (!(await canAccessRestaurant(user, restaurantId))) return forbidden();
      await rows(`INSERT INTO restaurant_offers(restaurant_id,dish_id,price_cents,is_featured,available,sort_order,status)
        VALUES($1,$2,$3,$4,true,$5,$6)`, [restaurantId,Number(payload.dishId),Number(payload.priceCents),!!payload.isFeatured,Number(payload.sortOrder||0),String(payload.status||"DRAFT")]);
      await audit(user,"OFFER_CREATE","RESTAURANT",String(restaurantId),{ dishId:Number(payload.dishId) });
      return NextResponse.json({ ok: true });
    }

    if (action === "partner-create") {
      if (user.role === "PARTNER") return forbidden();
      const restaurantId = Number(payload.restaurantId);
      if (!(await canAccessRestaurant(user, restaurantId))) return forbidden();
      const created = await one<{ id:number }>(`INSERT INTO users(name,email,password_hash,role,status) VALUES($1,$2,$3,'PARTNER','ACTIVE') RETURNING id`,
        [String(payload.name),String(payload.email).toLowerCase(),await bcrypt.hash(String(payload.password),12)]);
      if (!created) throw new Error("Création du partenaire impossible.");
      await rows("INSERT INTO user_restaurants(user_id,restaurant_id) VALUES($1,$2)", [created.id,restaurantId]);
      await audit(user,"PARTNER_CREATE","USER",String(created.id),{ restaurantId });
      return NextResponse.json({ ok: true });
    }

    if (action === "dish-label-set") {
      if (user.role !== "ADMIN") return forbidden();
      if (payload.enabled === false) await rows("DELETE FROM dish_labels WHERE dish_id=$1 AND label_id=$2", [Number(payload.dishId),Number(payload.labelId)]);
      else await rows(`INSERT INTO dish_labels(dish_id,label_id,approved) VALUES($1,$2,true)
        ON CONFLICT(dish_id,label_id) DO UPDATE SET approved=true`, [Number(payload.dishId),Number(payload.labelId)]);
      return NextResponse.json({ ok: true });
    }

    if (action === "collection-dish-set") {
      if (user.role !== "ADMIN") return forbidden();
      if (payload.enabled === false) await rows("DELETE FROM collection_dishes WHERE collection_id=$1 AND dish_id=$2", [Number(payload.collectionId),Number(payload.dishId)]);
      else await rows(`INSERT INTO collection_dishes(collection_id,dish_id,sort_order) VALUES($1,$2,$3)
        ON CONFLICT(collection_id,dish_id) DO UPDATE SET sort_order=excluded.sort_order`, [Number(payload.collectionId),Number(payload.dishId),Number(payload.sortOrder||0)]);
      return NextResponse.json({ ok: true });
    }

    if (action === "crown-offer-set") {
      if (user.role !== "ADMIN") return forbidden();
      await rows(`INSERT INTO crown_offers(experience_id,restaurant_id,price_cents,availability_note,status) VALUES($1,$2,$3,$4,$5)
        ON CONFLICT(experience_id,restaurant_id) DO UPDATE SET price_cents=excluded.price_cents,availability_note=excluded.availability_note,status=excluded.status`,
        [Number(payload.experienceId),Number(payload.restaurantId),Number(payload.priceCents),String(payload.availabilityNote||""),String(payload.status||"DRAFT")]);
      return NextResponse.json({ ok: true });
    }

    if (action === "commission-set") {
      if (user.role !== "ADMIN") return forbidden();
      if (payload.restaurantId) await rows("UPDATE restaurants SET commission_bps=$1 WHERE id=$2", [Number(payload.commissionBps),Number(payload.restaurantId)]);
      else await rows("UPDATE settings SET value=$1,updated_at=now() WHERE key='default_commission_bps'", [JSON.stringify(Number(payload.commissionBps))]);
      return NextResponse.json({ ok: true });
    }

    if (action === "statement-generate") {
      if (user.role !== "ADMIN") return forbidden();
      const restaurantId = Number(payload.restaurantId);
      const periodStart = String(payload.periodStart); const periodEnd = String(payload.periodEnd);
      const totals = await one<{ gross:number; commission:number }>(`SELECT COALESCE(sum(gross_cents),0)::integer AS gross,COALESCE(sum(commission_cents),0)::integer AS commission FROM orders
        WHERE restaurant_id=$1 AND status='VALIDATED' AND billable AND submitted_at::date BETWEEN $2::date AND $3::date`, [restaurantId,periodStart,periodEnd]);
      await rows(`INSERT INTO billing_statements(restaurant_id,period_start,period_end,gross_cents,commission_cents,status) VALUES($1,$2,$3,$4,$5,'UNPAID')
        ON CONFLICT(restaurant_id,period_start,period_end) DO UPDATE SET gross_cents=excluded.gross_cents,commission_cents=excluded.commission_cents`, [restaurantId,periodStart,periodEnd,totals?.gross ?? 0,totals?.commission ?? 0]);
      return NextResponse.json({ ok: true });
    }

    if (action === "entity-save") {
      if (user.role !== "ADMIN") return forbidden();
      await saveEntity(String(payload.entity), (payload.data ?? {}) as Record<string,unknown>);
      await audit(user,"ENTITY_SAVE",String(payload.entity).toUpperCase(),String(((payload.data ?? {}) as Record<string,unknown>).id ?? "new"),{});
      return NextResponse.json({ ok: true });
    }

    if (action === "entity-remove") {
      if (user.role !== "ADMIN") return forbidden();
      await removeEntity(String(payload.entity), Number(payload.id));
      await audit(user,"ENTITY_REMOVE",String(payload.entity).toUpperCase(),String(payload.id),{});
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action impossible.";
    return NextResponse.json({ error: message.includes("at most two") ? "Deux plats maximum peuvent être mis en avant par restaurant." : message }, { status: 409 });
  }
}

async function applyProposal(proposal: { restaurant_id:number; type:string; payload:Record<string,unknown> }) {
  if (proposal.type === "NEW_ITEM") {
    const name = String(proposal.payload.name || "Nouveau plat");
    const baseSlug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");
    const dish = await one<{ id:number }>("INSERT INTO dishes(name,slug,description,status) VALUES($1,$2,$3,'DRAFT') RETURNING id", [name,`${baseSlug}-${Date.now()}`,String(proposal.payload.description||"")]);
    if (dish) await rows("INSERT INTO restaurant_offers(restaurant_id,dish_id,price_cents,status) VALUES($1,$2,$3,'DRAFT')", [proposal.restaurant_id,dish.id,Number(proposal.payload.proposedPriceCents||0)]);
  }
  if (proposal.type === "PRICE_UPDATE") await rows("UPDATE restaurant_offers SET price_cents=$1 WHERE id=$2 AND restaurant_id=$3", [Number(proposal.payload.proposedPriceCents),Number(proposal.payload.offerId),proposal.restaurant_id]);
  if (proposal.type === "DESCRIPTION_UPDATE") await rows("UPDATE restaurant_offers SET description_override=$1 WHERE id=$2 AND restaurant_id=$3", [String(proposal.payload.description),Number(proposal.payload.offerId),proposal.restaurant_id]);
  if (proposal.type === "ITEM_REMOVAL") await rows("UPDATE restaurant_offers SET status='ARCHIVED' WHERE id=$1 AND restaurant_id=$2", [Number(proposal.payload.offerId),proposal.restaurant_id]);
  if (proposal.type === "CROWN") {
    const change = String(proposal.payload.change || "NEW");
    const offerId = Number(proposal.payload.offerId || 0);
    if (change === "PRICE") await rows("UPDATE crown_offers SET price_cents=$1 WHERE id=$2 AND restaurant_id=$3", [Number(proposal.payload.proposedPriceCents),offerId,proposal.restaurant_id]);
    else if (change === "CONTENT") await rows(`UPDATE crown_experiences SET description=$1 WHERE id=(SELECT experience_id FROM crown_offers WHERE id=$2 AND restaurant_id=$3)`, [String(proposal.payload.description || ""),offerId,proposal.restaurant_id]);
    else if (change === "WITHDRAWAL") await rows("UPDATE crown_offers SET status='ARCHIVED' WHERE id=$1 AND restaurant_id=$2", [offerId,proposal.restaurant_id]);
    else {
      const slug = String(proposal.payload.name || "experience-crown").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-");
      await rows("INSERT INTO crown_experiences(name,slug,description,status) VALUES($1,$2,$3,'PUBLISHED')", [String(proposal.payload.name),`${slug}-${Date.now()}`,String(proposal.payload.description || "")]);
    }
  }
}

async function saveEntity(entity: string, data: Record<string,unknown>) {
  const id = data.id ? Number(data.id) : null;
  if (entity === "category" || entity === "collection") {
    const table = entity === "category" ? "categories" : "collections";
    if (id) await rows(`UPDATE ${table} SET name=$1,slug=$2,description=$3,sort_order=$4,status=$5 WHERE id=$6`, [String(data.name),String(data.slug),String(data.description||""),Number(data.sortOrder||0),String(data.status||"DRAFT"),id]);
    else await rows(`INSERT INTO ${table}(name,slug,description,sort_order,status) VALUES($1,$2,$3,$4,$5)`, [String(data.name),String(data.slug),String(data.description||""),Number(data.sortOrder||0),String(data.status||"DRAFT")]);
  } else if (entity === "label") {
    if (id) await rows("UPDATE labels SET name=$1,slug=$2,status=$3 WHERE id=$4", [String(data.name),String(data.slug),String(data.status||"DRAFT"),id]);
    else await rows("INSERT INTO labels(name,slug,status) VALUES($1,$2,$3)", [String(data.name),String(data.slug),String(data.status||"DRAFT")]);
  } else if (entity === "dish") {
    if (id) await rows("UPDATE dishes SET name=$1,slug=$2,description=$3,ingredients=$4,image_url=$5,kcal=$6,kcal_status=$7,category_id=$8,status=$9 WHERE id=$10", [data.name,data.slug,data.description||"",data.ingredients||"",data.imageUrl||null,data.kcal||null,data.kcalStatus||null,data.categoryId||null,data.status||"DRAFT",id]);
    else await rows("INSERT INTO dishes(name,slug,description,ingredients,image_url,kcal,kcal_status,category_id,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)", [data.name,data.slug,data.description||"",data.ingredients||"",data.imageUrl||null,data.kcal||null,data.kcalStatus||null,data.categoryId||null,data.status||"DRAFT"]);
  } else if (entity === "crown") {
    const gallery = String(data.galleryUrls || "").split(/[,\n]/).map((value) => value.trim()).filter(Boolean);
    if (id) await rows("UPDATE crown_experiences SET name=$1,slug=$2,description=$3,image_url=$4,featured=$5,status=$6,category_id=$7,capacity_label=$8,included_text=$9,badges_text=$10,gallery_urls=$11,sort_order=$12 WHERE id=$13", [data.name,data.slug,data.description||"",data.imageUrl||null,!!data.featured,data.status||"DRAFT",data.categoryId||null,data.capacityLabel||"",data.includedText||"",data.badgesText||"",gallery,Number(data.sortOrder||0),id]);
    else await rows("INSERT INTO crown_experiences(name,slug,description,image_url,featured,status,category_id,capacity_label,included_text,badges_text,gallery_urls,sort_order) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [data.name,data.slug,data.description||"",data.imageUrl||null,!!data.featured,data.status||"DRAFT",data.categoryId||null,data.capacityLabel||"",data.includedText||"",data.badgesText||"",gallery,Number(data.sortOrder||0)]);
  } else if (entity === "crown-category") {
    if (id) await rows("UPDATE crown_categories SET name=$1,slug=$2,description=$3,cover_url=$4,sort_order=$5,status=$6 WHERE id=$7", [data.name,data.slug,data.description||"",data.imageUrl||null,Number(data.sortOrder||0),data.status||"DRAFT",id]);
    else await rows("INSERT INTO crown_categories(name,slug,description,cover_url,sort_order,status) VALUES($1,$2,$3,$4,$5,$6)", [data.name,data.slug,data.description||"",data.imageUrl||null,Number(data.sortOrder||0),data.status||"DRAFT"]);
  } else if (entity === "user") {
    if (id) await rows("UPDATE users SET name=$1,email=$2,role=$3,city_id=$4,sector_id=$5,status=$6 WHERE id=$7", [data.name,data.email,data.role,data.cityId||null,data.sectorId||null,data.status||"ACTIVE",id]);
    else await rows("INSERT INTO users(name,email,password_hash,role,city_id,sector_id,status) VALUES($1,$2,$3,$4,$5,$6,'ACTIVE')", [data.name,data.email,await bcrypt.hash(String(data.password),12),data.role,data.cityId||null,data.sectorId||null]);
  } else if (entity === "restaurant") {
    if (id) await rows("UPDATE restaurants SET name=$1,slug=$2,city_id=$3,sector_id=$4,address=$5,latitude=$6,longitude=$7,ordering_radius_m=$8,commission_bps=$9,description=$10,status=$11 WHERE id=$12", [data.name,data.slug,data.cityId,data.sectorId,data.address,data.latitude,data.longitude,data.radius||10,data.commissionBps||null,data.description||"",data.status||"DRAFT",id]);
    else await rows("INSERT INTO restaurants(name,slug,city_id,sector_id,address,latitude,longitude,ordering_radius_m,commission_bps,description,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [data.name,data.slug,data.cityId,data.sectorId,data.address,data.latitude,data.longitude,data.radius||10,data.commissionBps||null,data.description||"",data.status||"DRAFT"]);
  } else if (entity === "city") {
    if (id) await rows("UPDATE cities SET name=$1,slug=$2,status=$3 WHERE id=$4", [data.name,data.slug,data.status||"DRAFT",id]);
    else await rows("INSERT INTO cities(name,slug,status) VALUES($1,$2,$3)", [data.name,data.slug,data.status||"DRAFT"]);
  } else if (entity === "sector") {
    if (id) await rows("UPDATE sectors SET city_id=$1,name=$2,slug=$3,status=$4 WHERE id=$5", [data.cityId,data.name,data.slug,data.status||"DRAFT",id]);
    else await rows("INSERT INTO sectors(city_id,name,slug,status) VALUES($1,$2,$3,$4)", [data.cityId,data.name,data.slug,data.status||"DRAFT"]);
  } else throw new Error("Entité non prise en charge.");
}

async function removeEntity(entity: string, id: number) {
  const table = ({ category:"categories",collection:"collections",label:"labels",dish:"dishes",crown:"crown_experiences","crown-category":"crown_categories",user:"users",restaurant:"restaurants",city:"cities",sector:"sectors" } as Record<string,string>)[entity];
  if (!table) throw new Error("Entité non prise en charge.");
  try { await rows(`DELETE FROM ${table} WHERE id=$1`,[id]); }
  catch { await rows(`UPDATE ${table} SET status='ARCHIVED' WHERE id=$1`,[id]); }
}

async function audit(user: ProfessionalUser, action:string, entityType:string, entityId:string, details:Record<string,unknown>) {
  await rows("INSERT INTO audit_log(actor_user_id,action,entity_type,entity_id,details) VALUES($1,$2,$3,$4,$5)",[user.id,action,entityType,entityId,JSON.stringify(details)]);
}

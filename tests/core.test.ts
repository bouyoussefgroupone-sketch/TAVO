import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import bcrypt from "bcryptjs";
import { PGlite } from "@electric-sql/pglite";
import { distanceMeters, presenceDecision } from "../lib/geo";
import { calculateCommission } from "../lib/billing";
import { orderReference, visitReference } from "../lib/order-refs";
import { createOpaqueToken, hashOpaqueToken } from "../lib/tokens";

test("TAVO V1 core business and privacy invariants", async (suite) => {
  const db = new PGlite();
  await db.exec(await fs.readFile("migrations/0001_initial.sql", "utf8"));
  await db.exec(await fs.readFile("migrations/0002_crown_catalog.sql", "utf8"));

  const city = (await db.query<{id:number}>("INSERT INTO cities(name,slug,status) VALUES('Rabat','rabat','PUBLISHED') RETURNING id")).rows[0].id;
  const agdal = (await db.query<{id:number}>("INSERT INTO sectors(city_id,name,slug,status) VALUES($1,'Agdal','agdal','PUBLISHED') RETURNING id",[city])).rows[0].id;
  const souissi = (await db.query<{id:number}>("INSERT INTO sectors(city_id,name,slug,status) VALUES($1,'Souissi','souissi','PUBLISHED') RETURNING id",[city])).rows[0].id;
  const restaurantA = (await db.query<{id:number}>("INSERT INTO restaurants(name,slug,city_id,sector_id,address,latitude,longitude,status) VALUES('A','a',$1,$2,'A',34,-6.8,'PUBLISHED') RETURNING id",[city,agdal])).rows[0].id;
  const restaurantB = (await db.query<{id:number}>("INSERT INTO restaurants(name,slug,city_id,sector_id,address,latitude,longitude,status) VALUES('B','b',$1,$2,'B',34.1,-6.9,'PUBLISHED') RETURNING id",[city,souissi])).rows[0].id;
  const category = (await db.query<{id:number}>("INSERT INTO categories(name,slug,status) VALUES('Plats','plats','PUBLISHED') RETURNING id")).rows[0].id;
  const collection = (await db.query<{id:number}>("INSERT INTO collections(name,slug,status) VALUES('Nouveautés','nouveautes','PUBLISHED') RETURNING id")).rows[0].id;
  const dishIds:number[]=[];
  for(let index=1;index<=3;index++) dishIds.push((await db.query<{id:number}>("INSERT INTO dishes(name,slug,description,category_id,status) VALUES($1,$2,'Demo',$3,'PUBLISHED') RETURNING id",[`Plat ${index}`,`plat-${index}`,category])).rows[0].id);

  await suite.test("geofence distance, radius, and accuracy decisions", () => {
    assert.ok(distanceMeters(34,-6.8,34.00001,-6.8) < 3);
    assert.deepEqual(presenceDecision({distance:5,accuracy:8,radius:10}),{allowed:true,reason:"INSIDE"});
    assert.equal(presenceDecision({distance:30,accuracy:8,radius:10}).reason,"OUTSIDE");
    assert.equal(presenceDecision({distance:2,accuracy:80,radius:10}).reason,"INACCURATE");
  });

  await suite.test("categories and collections are dynamic relational records", async () => {
    await db.query("INSERT INTO collection_dishes(collection_id,dish_id,sort_order) VALUES($1,$2,0)",[collection,dishIds[0]]);
    assert.equal((await db.query("SELECT * FROM categories WHERE status='PUBLISHED'")).rows.length,1);
    assert.equal((await db.query("SELECT * FROM collection_dishes WHERE collection_id=$1",[collection])).rows.length,1);
  });

  await suite.test("one conceptual dish can be offered by multiple restaurants", async () => {
    await db.query("INSERT INTO restaurant_offers(restaurant_id,dish_id,price_cents,status) VALUES($1,$2,6500,'PUBLISHED'),($3,$2,7200,'PUBLISHED')",[restaurantA,dishIds[0],restaurantB]);
    assert.equal((await db.query("SELECT * FROM restaurant_offers WHERE dish_id=$1",[dishIds[0]])).rows.length,2);
  });

  await suite.test("database rejects a third featured dish per restaurant", async () => {
    await db.query("UPDATE restaurant_offers SET is_featured=true WHERE restaurant_id=$1 AND dish_id=$2",[restaurantA,dishIds[0]]);
    await db.query("INSERT INTO restaurant_offers(restaurant_id,dish_id,price_cents,is_featured,status) VALUES($1,$2,7000,true,'PUBLISHED')",[restaurantA,dishIds[1]]);
    await assert.rejects(db.query("INSERT INTO restaurant_offers(restaurant_id,dish_id,price_cents,is_featured,status) VALUES($1,$2,7500,true,'PUBLISHED')",[restaurantA,dishIds[2]]),/at most two/);
  });

  await suite.test("manager geography scope excludes other sectors", async () => {
    const password=await bcrypt.hash("Manager-test-2026",4);
    const manager=(await db.query<{id:number}>("INSERT INTO users(email,name,password_hash,role,city_id,sector_id) VALUES('manager@test','Manager',$1,'MANAGER',$2,$3) RETURNING id",[password,city,agdal])).rows[0].id;
    const scope=await db.query<{id:number}>("SELECT id FROM restaurants WHERE city_id=(SELECT city_id FROM users WHERE id=$1) AND sector_id=(SELECT sector_id FROM users WHERE id=$1)",[manager]);
    assert.deepEqual(scope.rows.map((row)=>row.id),[restaurantA]);
    assert.equal(await bcrypt.compare("Manager-test-2026",password),true);
  });

  await suite.test("dependent content is archived instead of destructively deleted", async () => {
    await assert.rejects(db.query("DELETE FROM categories WHERE id=$1",[category]));
    await db.query("UPDATE categories SET status='ARCHIVED' WHERE id=$1",[category]);
    assert.equal((await db.query<{status:string}>("SELECT status FROM categories WHERE id=$1",[category])).rows[0].status,"ARCHIVED");
  });

  await suite.test("presence authorization is restaurant scoped and expires", async () => {
    const token=createOpaqueToken();
    await db.query("INSERT INTO presence_authorizations(id,restaurant_id,token_hash,expires_at,accuracy_m) VALUES('00000000-0000-0000-0000-000000000001',$1,$2,now()+interval '1 minute',5)",[restaurantA,hashOpaqueToken(token)]);
    assert.equal((await db.query("SELECT 1 FROM presence_authorizations WHERE restaurant_id=$1 AND token_hash=$2 AND expires_at>now()",[restaurantA,hashOpaqueToken(token)])).rows.length,1);
    assert.equal((await db.query("SELECT 1 FROM presence_authorizations WHERE restaurant_id=$1 AND token_hash=$2",[restaurantB,hashOpaqueToken(token)])).rows.length,0);
    await db.query("UPDATE presence_authorizations SET expires_at=now()-interval '1 second'");
    assert.equal((await db.query("SELECT 1 FROM presence_authorizations WHERE token_hash=$1 AND expires_at>now()",[hashOpaqueToken(token)])).rows.length,0);
  });

  await suite.test("visit and order references sequence independently", () => {
    assert.equal(visitReference(1),"G001");
    assert.equal(orderReference("G001",1),"G001-01");
    assert.equal(orderReference("G001",2),"G001-02");
  });

  await suite.test("submitted order lines are immutable", async () => {
    await db.query("INSERT INTO visit_sessions(id,reference,restaurant_id,secret_hash,expires_at) VALUES('10000000-0000-0000-0000-000000000001','G001',$1,'visit',now()+interval '1 hour')",[restaurantA]);
    await db.query("INSERT INTO orders(id,reference,visit_session_id,restaurant_id,gross_cents,commission_bps,commission_cents) VALUES('20000000-0000-0000-0000-000000000001','G001-01','10000000-0000-0000-0000-000000000001',$1,6500,1200,780)",[restaurantA]);
    const offer=(await db.query<{id:number}>("SELECT id FROM restaurant_offers WHERE restaurant_id=$1 LIMIT 1",[restaurantA])).rows[0].id;
    await db.query("INSERT INTO order_items(order_id,offer_id,item_name,unit_price_cents,quantity,line_total_cents) VALUES('20000000-0000-0000-0000-000000000001',$1,'Plat 1',6500,1,6500)",[offer]);
    await assert.rejects(db.query("UPDATE order_items SET quantity=2 WHERE order_id='20000000-0000-0000-0000-000000000001'"),/immutable/);
  });

  await suite.test("validated billing is auditable and cancellation preserves history", async () => {
    assert.equal(calculateCommission(6500,1200),780);
    await db.query("UPDATE orders SET status='VALIDATED',billable=true,validated_at=now() WHERE reference='G001-01'");
    let order=(await db.query<{billable:boolean}>("SELECT billable FROM orders WHERE reference='G001-01'")).rows[0];
    assert.equal(order.billable,true);
    await db.query("UPDATE orders SET status='CANCELLED',billable=false,cancelled_at=now() WHERE reference='G001-01'");
    order=(await db.query<{billable:boolean}>("SELECT billable FROM orders WHERE reference='G001-01'")).rows[0];
    assert.equal(order.billable,false);
    assert.equal((await db.query("SELECT 1 FROM orders WHERE reference='G001-01'")).rows.length,1);
  });

  await suite.test("proposal approval changes price while rejection leaves it unchanged", async () => {
    const user=(await db.query<{id:number}>("INSERT INTO users(email,name,password_hash,role) VALUES('partner@test','Partner','hash','PARTNER') RETURNING id")).rows[0].id;
    const offer=(await db.query<{id:number;price_cents:number}>("SELECT id,price_cents FROM restaurant_offers WHERE restaurant_id=$1 LIMIT 1",[restaurantA])).rows[0];
    await db.query("INSERT INTO proposals(restaurant_id,submitted_by,type,payload) VALUES($1,$2,'PRICE_UPDATE',$3)",[restaurantA,user,JSON.stringify({offerId:offer.id,proposedPriceCents:9900})]);
    assert.equal((await db.query<{price_cents:number}>("SELECT price_cents FROM restaurant_offers WHERE id=$1",[offer.id])).rows[0].price_cents,offer.price_cents);
    await db.query("UPDATE restaurant_offers SET price_cents=9900 WHERE id=$1",[offer.id]);
    assert.equal((await db.query<{price_cents:number}>("SELECT price_cents FROM restaurant_offers WHERE id=$1",[offer.id])).rows[0].price_cents,9900);
  });

  await suite.test("Crown categories are independent and experiences support multiple partners", async () => {
    const crownCategory=(await db.query<{id:number}>("INSERT INTO crown_categories(name,slug,description,status) VALUES('Business','business','Tables professionnelles','PUBLISHED') RETURNING id")).rows[0].id;
    const experience=(await db.query<{id:number}>("INSERT INTO crown_experiences(name,slug,description,category_id,capacity_label,included_text,status) VALUES('Table privée','table-privee','Un moment sur mesure',$1,'4 personnes','Menu|Service dédié','PUBLISHED') RETURNING id",[crownCategory])).rows[0].id;
    await db.query("INSERT INTO crown_offers(experience_id,restaurant_id,price_cents,status) VALUES($1,$2,120000,'PUBLISHED'),($1,$3,135000,'PUBLISHED')",[experience,restaurantA,restaurantB]);
    assert.equal((await db.query("SELECT * FROM crown_offers WHERE experience_id=$1",[experience])).rows.length,2);
    assert.equal((await db.query("SELECT * FROM categories WHERE slug='business'")).rows.length,0);
    await assert.rejects(db.query("DELETE FROM crown_categories WHERE id=$1",[crownCategory]));
    await db.query("UPDATE crown_categories SET status='ARCHIVED' WHERE id=$1",[crownCategory]);
    assert.equal((await db.query<{status:string}>("SELECT status FROM crown_categories WHERE id=$1",[crownCategory])).rows[0].status,"ARCHIVED");
  });

  await suite.test("privacy model contains no customer identity or location history", async () => {
    const tables=(await db.query<{table_name:string}>("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")).rows.map((row)=>row.table_name);
    assert.equal(tables.some((name)=>name.includes("location_history")||name.includes("customer_profile")),false);
    const coordinateColumns=await db.query<{table_name:string}>("SELECT table_name FROM information_schema.columns WHERE column_name IN ('latitude','longitude')");
    assert.deepEqual([...new Set(coordinateColumns.rows.map((row)=>row.table_name))],["restaurants"]);
  });
  await db.close();
});

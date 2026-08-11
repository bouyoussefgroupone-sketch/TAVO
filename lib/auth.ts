import bcrypt from "bcryptjs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { one, rows } from "./db";

export type Role = "ADMIN" | "MANAGER" | "PARTNER";
export type ProfessionalUser = {
  id: number;
  email: string;
  name: string;
  role: Role;
  city_id: number | null;
  sector_id: number | null;
};

const COOKIE_NAME = "tavo_professional_session";
const SESSION_MS = 12 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function authenticate(email: string, password: string) {
  const user = await one<ProfessionalUser & { password_hash: string; status: string }>(
    "SELECT id,email,name,role,city_id,sector_id,password_hash,status FROM users WHERE lower(email)=lower($1)",
    [email],
  );
  if (!user || user.status !== "ACTIVE" || !(await bcrypt.compare(password, user.password_hash))) return null;
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_MS);
  await rows("DELETE FROM professional_sessions WHERE user_id=$1 OR expires_at < now()", [user.id]);
  await rows("INSERT INTO professional_sessions(id,user_id,token_hash,expires_at) VALUES($1,$2,$3,$4)", [randomUUID(), user.id, hashToken(token), expiresAt]);
  return { token, expiresAt, user };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (token) await rows("DELETE FROM professional_sessions WHERE token_hash=$1", [hashToken(token)]);
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<ProfessionalUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return one<ProfessionalUser>(`SELECT u.id,u.email,u.name,u.role,u.city_id,u.sector_id
    FROM professional_sessions s JOIN users u ON u.id=s.user_id
    WHERE s.token_hash=$1 AND s.expires_at>now() AND u.status='ACTIVE'`, [hashToken(token)]);
}

export async function requireRole(roles: Role[]): Promise<ProfessionalUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) redirect(user.role === "ADMIN" ? "/admin" : user.role === "MANAGER" ? "/manager" : "/partner");
  return user;
}

export async function canAccessRestaurant(user: ProfessionalUser, restaurantId: number) {
  if (user.role === "ADMIN") return true;
  if (user.role === "PARTNER") {
    return !!(await one("SELECT 1 AS ok FROM user_restaurants WHERE user_id=$1 AND restaurant_id=$2", [user.id, restaurantId]));
  }
  return !!(await one(`SELECT 1 AS ok FROM restaurants WHERE id=$1 AND city_id=$2
    AND ($3::integer IS NULL OR sector_id=$3)`, [restaurantId, user.city_id, user.sector_id]));
}

export function roleHome(role: Role) {
  return role === "ADMIN" ? "/admin" : role === "MANAGER" ? "/manager" : "/partner";
}

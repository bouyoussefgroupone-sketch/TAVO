import { redirect } from "next/navigation";
import { getCurrentUser, roleHome } from "@/lib/auth";
import { ProfessionalLogin } from "./professional-login";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(roleHome(user.role));
  return <ProfessionalLogin />;
}

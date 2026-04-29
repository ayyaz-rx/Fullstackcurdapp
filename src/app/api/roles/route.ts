import { ROLES } from "@/constants/roles";

export async function GET() {
  try {
    const rolesList = Object.values(ROLES);
    return Response.json({ roles: rolesList });
  } catch {
    return Response.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}
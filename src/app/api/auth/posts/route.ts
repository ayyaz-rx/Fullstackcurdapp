import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAuthenticatedUser, checkPermission } from "@/lib/permission";
import { PERMISSIONS } from "@/constants/roles";

function isPermissionError(error: unknown) {
  return error instanceof Error && error.message.includes("permission");
}

export async function POST(req: Request) {
  try {
    await connectDB();
const token = req.headers.get("authorization")?.split(" ")[1];
    
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getAuthenticatedUser(token);

    if (!user) {
      return Response.json({ error: "Invalid token" }, { status: 401 });
    }

    //  Only admin + editor
    checkPermission(user.role, PERMISSIONS.CREATE_POST);

    const { title, content } = await req.json();

    const post = await Post.create({
      title,
      content,
      authorId: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return Response.json(post, { status: 201 });
  } catch (error: unknown) {
    if (isPermissionError(error)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}

import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";
import { getAuthenticatedUser, checkPermission } from "@/lib/permission";
import { PERMISSIONS } from "@/constants/roles";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find()
      .populate("authorId", "name email")
      .sort({ createdAt: -1 });

    return Response.json({ posts });
  } catch {
    return Response.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

function isPermissionError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.includes("does not have permission")
  );
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // TOKEN GET
    const headerToken = req.headers
      .get("authorization")
      ?.replace("Bearer ", "");

    const cookieHeader = req.headers.get("cookie") || "";
    const cookieToken = cookieHeader
      .split("; ")
      .find((part) => part.startsWith("token="))
      ?.split("=")[1];

    const token = headerToken || cookieToken;

    if (!token) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // USER VERIFY
    const user = await getAuthenticatedUser(token);

    if (!user) {
      return Response.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // PERMISSION CHECK
    checkPermission(user.role, PERMISSIONS.CREATE_POST);

    const { title, content } = await req.json();

    if (!title || !content) {
      return Response.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // CREATE POST
    const post = await Post.create({
      title,
      content,
      authorId: user.id,
      authorName: user.email,
    });

    return Response.json(
      { message: "Post created", post },
      { status: 201 }
    );

  } catch (error: unknown) {
    if (isPermissionError(error)) {
      return Response.json(
        { error: "Forbidden: No permission to create posts" },
        { status: 403 }
      );
    }

    return Response.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}
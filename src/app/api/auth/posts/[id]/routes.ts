import { connectDB } from "@/lib/db";
import { Post } from "@/models/Post";

export async function GET(req: Request) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const title = url.searchParams.get("title");

    let posts;

    // 🔍 simple search logic
    if (title) {
      posts = await Post.find().then((data) =>
        data.filter((post) =>
          post.title.toLowerCase().includes(title.toLowerCase())
        )
      );
    } else {
      posts = await Post.find();
    }

    return Response.json({ posts });

  } catch {
    return Response.json({ error: "Failed to fetch posts" });
  }
}
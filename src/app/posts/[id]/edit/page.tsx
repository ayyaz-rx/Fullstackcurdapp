"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import type { IPost } from "@/type";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();

  //  Get Post ID
  const rawPostId = params?.id;
  const postId = Array.isArray(rawPostId) ? rawPostId[0] : rawPostId;

  //  States
  const [post, setPost] = useState<IPost | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  //  FETCH DATA + AUTH CHECK
  useEffect(() => {
    async function initialize() {
      //  No ID
      if (!postId) {
        setError("Invalid post ID");
        setLoading(false);
        return;
      }

      try {
        //  Verify user
        const verifyRes = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!verifyRes.ok) {
          router.push("/login");
          return;
        }

        //  Fetch post
        const postRes = await fetch(`/api/posts/${postId}`, {
          method: "GET",
          credentials: "include",
        });

        const data = await postRes.json();

        if (!postRes.ok || !data.post) {
          setError("Post not found");
          return;
        }

        //  Set data
        setPost(data.post);
        setTitle(data.post.title || "");
        setContent(data.post.content || "");
      } catch (err) {
        console.error(err);
        setError("Something went wrong while fetching post");
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [postId, router]);

  //  UPDATE POST
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title, content }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update post");
        return;
      }

      //  Redirect after success
      router.push("/posts");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while updating");
    } finally {
      setSaving(false);
    }
  }

  //  LOADING UI
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-lg font-semibold">
        Loading post...
      </div>
    );
  }

  //  ERROR / NOT FOUND UI
  if (!post) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            {error || "Post not found"}
          </p>
          <Button onClick={() => router.push("/posts")}>
            Back to Posts
          </Button>
        </div>
      </div>
    );
  }

  //  MAIN UI
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-2xl mx-auto">

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-center mb-6">
          Edit Post
        </h1>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* FORM CARD */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* TITLE INPUT */}
            <div>
              <label className="block font-medium mb-1">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
                required
              />
            </div>

            {/* CONTENT INPUT */}
            <div>
              <label className="block font-medium mb-1">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter content"
                rows={6}
                required
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>

              <Button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
              >
                Cancel
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
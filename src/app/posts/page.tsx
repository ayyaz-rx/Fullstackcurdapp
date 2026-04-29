"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import type { IUser, IPost } from "@/type";

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        router.push("/login");
        return;
      }

      setToken(storedToken);

      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: storedToken }),
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUser(data.user);
        await fetchPosts();
        setLoading(false);
      } catch {
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    verifyUser();
  }, [router]);

  async function deletePost(postId: string) {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== postId));
        toast.success("Post deleted successfully");
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Failed to delete post");
      }
    } catch {
      toast.error("Error deleting post");
    }
  }

  function requestDeleteConfirmation(postId: string) {
    setPostIdToDelete(postId);
  }

  async function confirmDeletePost() {
    if (!postIdToDelete) return;
    const currentPostId = postIdToDelete;
    setPostIdToDelete(null);
    await deletePost(currentPostId);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  const canCreate = user?.role === "admin" || user?.role === "editor";
  const canDelete = user?.role === "admin";

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Posts</h1>
          <div className="flex gap-4">
            {canCreate && (
              <Link href="/posts/create">
                <Button>Create Post</Button>
              </Link>
            )}
            <Link href="/dashboard">
              <Button className="bg-gray-600 hover:bg-gray-700">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col gap-4">
                  
                  {/* Content */}
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4 whitespace-pre-line">
                      {post.content}
                    </p>

                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>By: {post.authorName}</span>
                      <span>
                        {post.createdAt
                          ? new Date(post.createdAt as string).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 flex-wrap pt-2 border-t border-gray-100">
                    {(user?.role === "admin" ||
                      user?.role === "editor") && (
                      <Link href={`/posts/${post._id}/edit`}>
                        <Button className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2">
                          <FiEdit2 />
                          Edit
                        </Button>
                      </Link>
                    )}

                    {canDelete && (
                      <Button
                        onClick={() =>
                          requestDeleteConfirmation(post._id)
                        }
                        className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                      >
                        <FiTrash2 />
                        Delete
                      </Button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {postIdToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg border bg-white p-4 text-gray-800 shadow-lg">
            <p className="mb-3 font-semibold">Delete this post?</p>
            <div className="flex justify-end gap-2">
              <button
                className="rounded bg-gray-100 px-3 py-1.5 text-sm hover:bg-gray-200"
                onClick={() => setPostIdToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="rounded bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                onClick={() => {
                  void confirmDeletePost();
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

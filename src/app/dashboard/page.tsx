"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import type { IUser, IPost } from "@/type";

export default function Dashboard() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);

  const [posts, setPosts] = useState<IPost[]>([]);
  const [postIdToDelete, setPostIdToDelete] = useState<string | null>(null);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/posts", { cache: "no-store" });
      const data = await res.json();
      setPosts(data.posts || []);
    } catch {
      setPosts([]);
    }
  }

  const handleAuthFailure = useCallback(async () => {
    localStorage.removeItem("user");
    setAuthorized(false);
    setUser(null);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          signal: controller.signal,
        });

        const data = await res.json();

        if (!res.ok || !data.user) {
          await handleAuthFailure();
          return;
        }

        setUser(data.user);
        setAuthorized(true);
      } catch {
        await handleAuthFailure();
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    })();
  }, [handleAuthFailure]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPosts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      void fetchPosts();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  async function handleLogout() {
    localStorage.removeItem("user");
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        cache: "no-store",
      });
    } finally {
      window.location.assign("/login");
    }
  }


  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!authorized || !user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Unauthorized
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const canManageUsers = Boolean(user?.isSuperAdmin) || isAdmin;
  const canCreatePosts = user?.role === "admin" || user?.role === "editor";
  const canEditPosts = user?.role === "admin" || user?.role === "editor";

  async function deletePost(postId: string) {
    if (!isAdmin) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setPosts((prevPosts) => prevPosts.filter((post) => post._id !== postId));
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

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <Button onClick={handleLogout} className="bg-red-600">
          Logout
        </Button>
      </div>

      {/* ROLE INFO */}
      <div className="bg-white p-4 rounded shadow mb-4">
        <p>
          Logged in as:{" "}
          <b className="text-blue-600">
            {user?.name?.trim() || user?.email || "UNKNOWN"}
          </b>
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Role:{" "}
          <b className="text-indigo-600">
            {user?.role?.toUpperCase() || "UNKNOWN"}
          </b>
        </p>
        {user?.isSuperAdmin && (
          <p className="mt-1 text-sm text-green-700 font-semibold">
            Super Admin Access Enabled
          </p>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 mb-4">
        {canCreatePosts && (
          <button
            onClick={() => router.push("/posts/create")}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Post
          </button>
        )}
      </div>

      {/* POSTS LIST */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-3">All Posts</h2>

        {posts.length === 0 ? (
          <p>No posts found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
            {posts.map((post) => {
              return (
                <div key={post._id} className="border p-3 rounded hover:shadow-md transition-shadow h-80 flex flex-col">
                  <div className="min-w-0 flex-1 overflow-y-auto pr-1">
                      <h3 className="font-bold">{post.title}</h3>
                      <p className="whitespace-pre-line">{post.content}</p>
                  </div>

                  {(canEditPosts || isAdmin) && (
                    <div className="mt-3 flex justify-end items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
                      {canEditPosts && (
                        <Link href={`/posts/${post._id}/edit`}>
                          <Button className="bg-yellow-600 hover:bg-yellow-700 flex items-center gap-2">
                            <FiEdit2 />
                            Edit
                          </Button>
                        </Link>
                      )}

                      {isAdmin && (
                        <Button
                          onClick={() => requestDeleteConfirmation(post._id)}
                          className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
                        >
                          <FiTrash2 />
                          Delete
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADMIN LINK */}
      {canManageUsers && (
        <div className="mt-6">
          <Button
            onClick={() => router.push("/users")}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Manage Role
          </Button>
        </div>
      )}

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

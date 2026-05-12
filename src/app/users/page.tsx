"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Link from "next/link";
import toast from "react-hot-toast";
import { FiTrash2, FiPlus, FiEdit2 } from "react-icons/fi";
import type { IUser, IAdminUser } from "@/type";

export default function UsersPage() {
  const router = useRouter();

  const [users, setUsers] = useState<IAdminUser[]>([]);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);

  // ---------------- FETCH USERS ----------------
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users", { credentials: "include" });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        return;
      }

      const data = await res.json().catch(() => ({}));
      toast.error(data.error || "Unable to load users");

      if (res.status === 403 || res.status === 401) {
        router.push("/dashboard");
      }
    } catch {
      toast.error("Error fetching users");
    }
  }, [router]);

  // ---------------- VERIFY ADMIN ----------------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          router.push("/login");
          return;
        }

        const data = await res.json();

        if (!data.user.isSuperAdmin && data.user.role !== "admin") {
          router.push("/dashboard");
          return;
        }

        setCurrentUser(data.user);
        await fetchUsers();
        setLoading(false);
      } catch {
        router.push("/login");
      }
    })();
  }, [router, fetchUsers]);

  // ---------------- ROLE CHANGE ----------------
  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);

    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: data.user.role } : u))
        );
        toast.success("Role updated");
      } else {
        toast.error("Failed to update role");
      }
    } catch {
      toast.error("Error updating role");
    } finally {
      setUpdatingId(null);
    }
  }

  // ---------------- DELETE ----------------
  async function handleDeleteUser(userId: string) {
    setDeletingId(userId);

    try {
      const res = await fetch(`/api/users/${userId}/delete`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        toast.success("User deleted");
      } else {
        const errorMsg = data.error || "Failed to delete user";
        toast.error(errorMsg);
        console.error("Delete error:", data);
      }
    } catch (error) {
      toast.error("Error deleting user");
      console.error("Delete exception:", error);
    } finally {
      setDeletingId(null);
    }
  }

  // ---------------- EDIT NAME ----------------
  function startEdit(id: string, name?: string) {
    setEditingId(id);
    setEditingName(name || "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveName(userId: string) {
    const newName = editingName.trim();

    if (!newName) {
      toast.error("Name required");
      return;
    }

    setIsSavingName(true);

    try {
      const res = await fetch(`/api/users/${userId}/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newName }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, name: data.user.name } : u
          )
        );
        toast.success("Name updated");
        cancelEdit();
      } else {
        toast.error("Update failed");
      }
    } catch {
      toast.error("Error updating name");
    } finally {
      setIsSavingName(false);
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!currentUser) return <div className="h-screen flex items-center justify-center">Unauthorized</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">User Management</h1>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/users/create")}
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <FiPlus /> Create
            </button>

            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded shadow overflow-hidden">
          <table className="w-full">

            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Role</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b">

                  {/* NAME */}
                  <td className="px-6 py-4">
                    {editingId === user._id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="border px-2 py-1 rounded"
                        />

                        {/* SAVE */}
                        <button
                          onClick={() => saveName(user._id)}
                          disabled={isSavingName}
                          className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {isSavingName ? "Saving..." : "Save"}
                        </button>

                        {/* CANCEL */}
                        <button
                          onClick={cancelEdit}
                          disabled={isSavingName}
                          className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      user.name
                    )}
                  </td>

                  <td className="px-6 py-4">{user.email}</td>

                  {/* ROLE */}
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={updatingId === user._id}
                      className="border px-2 py-1 rounded"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">

                      <button
                        onClick={() => startEdit(user._id, user.name)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEdit2 />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={deletingId === user._id}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                      >
                        <FiTrash2 />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}
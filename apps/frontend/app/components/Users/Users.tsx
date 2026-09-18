"use client";

import { useAuth } from "@/app/AuthContext";
import { Stack } from "@mui/material";
import Link from "next/link";

export default function Users() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";

  if (!isAuthenticated || !isAdmin) {
    return (
      <div
        data-testid="users-forbidden"
        style={{ padding: "10px", textAlign: "center" }}
      >
        <div style={{ padding: "10px" }}>No access. Only for admins.</div>
        <div style={{ padding: "10px" }}>
          <Link
            href="/tasks"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            Back to tasks
          </Link>{" "}
          or{" "}
          <Link
            href="/login"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Stack direction="column" spacing={2} data-testid="users" padding={2}>
      <h1>Users</h1>
      <p>Users list will be here</p>
    </Stack>
  );
}

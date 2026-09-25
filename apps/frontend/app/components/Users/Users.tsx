"use client";

import { useQuery, useApolloClient } from "@apollo/client/react";
import {
  USERS_QUERY,
  DELETE_USER_MUTATION,
  RESTORE_USER_MUTATION,
  ACTIVE_TASKS_QUERY,
  BIN_TASKS_QUERY,
} from "@/app/lib/graphql/operations";
import { useAuth } from "@/app/AuthContext";
import { Stack } from "@mui/material";
import Link from "next/link";
import Btn from "../Btn";
import { useContext, useState } from "react";
import { ThemeContext } from "@/app/ThemeContext";
import { CombinedGraphQLErrors } from "@apollo/client";
import {
  canAccessUsers,
  canSoftDeleteUser,
  canRestoreUser,
} from "@repo/permissions";

export default function Users() {
  const theme = useContext(ThemeContext);
  const { user, isAuthenticated } = useAuth();
  // const isAdmin = user?.role === "admin";

  const client = useApolloClient();

  const [actionError, setActionError] = useState<string | null>(null);
  const messageFromApollo = (err: unknown, fallback: string) => {
    if (CombinedGraphQLErrors.is(err)) {
      return err.errors[0]?.message ?? fallback;
    }
    return fallback;
  };

  const canOpenUsers = Boolean(user && canAccessUsers(user));

  const { data, loading, error } = useQuery(USERS_QUERY, {
    // skip: !isAuthenticated || !isAdmin,
    skip: !isAuthenticated || !canOpenUsers,
  });
  const users = data?.users ?? [];

  // if (!isAuthenticated || !isAdmin) {
  if (!isAuthenticated || !canOpenUsers) {
    return (
      <div
        data-testid="users-forbidden"
        style={{ padding: "10px", textAlign: "center" }}
      >
        <div style={{ padding: "10px" }}>Forbidden: No access.</div>
        <div style={{ padding: "10px" }}>
          {isAuthenticated && (
            <Link
              href="/tasks"
              style={{ color: "blue", textDecoration: "underline" }}
            >
              Back to tasks
            </Link>
          )}{" "}
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

  const deleteUser = async (id: number, email: string) => {
    setActionError(null);
    if (
      !confirm(
        `Delete user ${email}?\n\nThis user's email on tasks will be marked as (deleted)`,
      )
    ) {
      return;
    }
    try {
      await client.mutate({
        mutation: DELETE_USER_MUTATION,
        variables: { id },
        refetchQueries: [
          { query: USERS_QUERY },
          { query: ACTIVE_TASKS_QUERY },
          { query: BIN_TASKS_QUERY },
        ],
      });
    } catch (error) {
      console.error(`Error deleting user ${email}: `, error);
      setActionError(messageFromApollo(error, `Error deleting user ${email}`));
    }
  };

  const restoreUser = async (id: number, email: string) => {
    setActionError(null);
    try {
      await client.mutate({
        mutation: RESTORE_USER_MUTATION,
        variables: { id },
        refetchQueries: [
          { query: USERS_QUERY },
          { query: ACTIVE_TASKS_QUERY },
          { query: BIN_TASKS_QUERY },
        ],
      });
    } catch (error) {
      console.error(`Error restoring user ${email}: `, error);
      setActionError(messageFromApollo(error, `Error restoring user ${email}`));
    }
  };

  return (
    // <Stack direction="column" spacing={2} data-testid="users" padding={2}>
    //   <h1>Users</h1>
    //   <p>Users list will be here</p>
    // </Stack>
    <Stack direction="column" spacing={2} data-testid="users" padding={2}>
      <h1>Users</h1>
      {actionError && (
        <p style={{ color: "red" }} data-testid="users-action-error">
          {actionError}
        </p>
      )}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error.message}</p>}
      {!loading && !error && (
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            maxWidth: 900,
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom:
                  theme === "dark"
                    ? "1px solid var(--foreground)"
                    : "1px solid var(--background)",
              }}
            >
              <th style={{ textAlign: "left", padding: 8 }}>Id</th>
              <th style={{ textAlign: "left", padding: 8 }}>Email</th>
              <th style={{ textAlign: "left", padding: 8 }}>Role</th>
              <th style={{ textAlign: "left", padding: 8 }}>Created</th>
              <th style={{ textAlign: "left", padding: 8 }}>Deleted</th>
              <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((row) => (
              <tr
                key={row.id}
                style={{
                  borderBottom:
                    theme === "dark"
                      ? "1px solid var(--foreground)"
                      : "1px solid var(--background)",
                }}
              >
                <td style={{ padding: 8 }}>{row.id}</td>
                <td style={{ padding: 8 }}>{row.email}</td>
                <td style={{ padding: 8 }}>{row.role}</td>
                <td style={{ padding: 8 }}>
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td style={{ padding: 8 }}>
                  {row.deletedAt
                    ? new Date(row.deletedAt).toLocaleString()
                    : "—"}
                </td>
                <td style={{ padding: 8 }}>
                  {/* {user &&
                    canSoftDeleteUser(user, row) &&
                    canRestoreUser(user, row) && ( */}
                  {/* {row.id !== user?.id && row.role !== "admin" && ( */}
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    alignItems="center"
                    spacing={2}
                  >
                    {user && canSoftDeleteUser(user, row) && (
                      <Btn
                        variant="contained"
                        size="small"
                        disabled={!!row.deletedAt}
                        onClick={() => deleteUser(row.id, row.email)}
                      >
                        Del
                      </Btn>
                    )}
                    {user &&
                      canSoftDeleteUser(user, row) &&
                      canRestoreUser(user, row) && (
                        <Btn
                          variant="contained"
                          size="small"
                          disabled={!row.deletedAt}
                          onClick={() => restoreUser(row.id, row.email)}
                        >
                          Restore
                        </Btn>
                      )}
                  </Stack>
                  {/* )} */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Stack>
  );
}

"use client";

import { Stack } from "@mui/material";
import { useAuth } from "../../AuthContext";

export default function Profile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <p>Not logged in.</p>;
  }

  return (
    <>
      <Stack direction="column" spacing={2}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            maxWidth: 900,
          }}
        >
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Information</th>
              <th style={{ textAlign: "left", padding: 8 }}>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 8 }}>ID</td>
              <td style={{ padding: 8 }}>{user.id}</td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>Email</td>
              <td style={{ padding: 8 }}>{user.email}</td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>Role</td>
              <td style={{ padding: 8 }}>{user.role}</td>
            </tr>
            <tr>
              <td style={{ padding: 8 }}>Created</td>
              <td style={{ padding: 8 }}>
                {new Date(user.createdAt).toLocaleString()}
              </td>
            </tr>
            {/* {users.map((row) => (
              <tr key={row.id}>
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
              </tr>
            ))} */}
          </tbody>
        </table>
      </Stack>
    </>
  );
}

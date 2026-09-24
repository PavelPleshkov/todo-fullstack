"use client";

import { Icon } from "@mui/material";
import Link from "next/link";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import { ThemeContext } from "../ThemeContext";
import Btn from "./Btn";

interface HeaderProps {
  setTheme: (theme: string) => void;
}

export default function Header({ setTheme }: HeaderProps): React.ReactNode {
  const theme: string = useContext(ThemeContext);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const className: string = "header header-" + theme;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header className={className} data-testid="header">
      <div className="header-inner">
        <h1 className="header-title">
          <span className="header-title-wrapper">
            <Icon className="header-title-icon" fontSize="small">
              star
            </Icon>
            <span className="header-title-text">
              React, TS, Next.js, Nest.js, PostgreSQL, Formik with Yup, RTL,
              Jest, GraphQL, AI, App Router, optimization, Auth
            </span>
          </span>
        </h1>

        <div className="header-auth">
          {isAuthenticated && user ? (
            <>
              <span data-testid="header-user-email" style={{ fontSize: 14 }}>
                {user.email}
                {user.role === "admin" ? " (admin)" : ""}
              </span>
              <Btn
                data-testid="logout-btn"
                variant="contained"
                size="small"
                onClick={handleLogout}
              >
                Logout
              </Btn>
            </>
          ) : (
            <Btn
              data-testid="login-link-btn"
              component={Link}
              href="/login"
              variant="contained"
              size="small"
            >
              Login
            </Btn>
          )}
        </div>
        <Btn
          className="theme-btn"
          data-testid="theme-btn"
          variant="contained"
          size="small"
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
        >
          {theme === "dark" ? "Light" : "Dark"}
        </Btn>
      </div>
    </header>
  );
}

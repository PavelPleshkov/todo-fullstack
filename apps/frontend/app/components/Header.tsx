"use client";

import { Button, Icon } from "@mui/material";
import Link from "next/link";
import { useContext } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import { ThemeContext } from "../ThemeContext";

interface HeaderProps {
  setTheme: (theme: string) => void;
}

export default function Header({ setTheme }: HeaderProps): React.ReactNode {
  const theme: string = useContext(ThemeContext);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const className: string = "header header-" + theme;
  const classNameThemeBtn: string = "theme-btn theme-btn-" + theme;
  const classNameLoginBtn: string = "login-btn login-btn-" + theme;

  const handleLogout = () => {
    logout();
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
              React, TS, Next.js, Nest.js, PostgreSQL, formik, yup, RTL, Jest,
              GraphQL, AI, App Router, optimization, Auth
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
              <Button
                className={classNameLoginBtn}
                data-testid="logout-btn"
                onClick={handleLogout}
                variant="contained"
                size="small"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              className={classNameLoginBtn}
              data-testid="login-link-btn"
              component={Link}
              href="/login"
              variant="contained"
              size="small"
            >
              Login
            </Button>
          )}
        </div>
        <Button
          className={classNameThemeBtn}
          data-testid="theme-btn"
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          variant="contained"
          size="small"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
      </div>
    </header>
  );
}

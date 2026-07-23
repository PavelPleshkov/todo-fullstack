"use client";
import { Button, Icon } from "@mui/material";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

interface HeaderProps {
  setTheme: (theme: string) => void;
}

export default function Header({ setTheme }: HeaderProps): React.ReactNode {
  const theme: string = useContext(ThemeContext);
  const className: string = "header header-" + theme;
  const classNameBtn: string = "theme-btn theme-btn-" + theme;

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
              GraphQL, AI, App Router, optimization
            </span>
          </span>
        </h1>
        <Button
          className={classNameBtn}
          data-testid="theme-btn"
          onClick={() => {
            setTheme(theme === "dark" ? "light" : "dark");
          }}
          variant="contained"
        >
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
      </div>
    </header>
  );
}

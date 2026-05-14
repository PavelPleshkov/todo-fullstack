"use client";
import { Button, Grid, Icon } from "@mui/material";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

interface HeaderProps {
  setTheme: (theme: string) => void;
}

export default function Header({ setTheme }: HeaderProps): React.ReactNode {
  const theme: string = useContext(ThemeContext);
  const className: string = "header-" + theme;
  const classNameBtn: string = "theme-btn-" + theme;
  // const classNameBtn: string = "theme-btn theme-btn-" + theme;

  return (
    <header className={className} data-testid="header">
      <Grid
        container
        direction={"row"}
        justifyContent={"space-between"}
        spacing={2}
        padding={"10px"}
      >
        <h1 style={{ display: "flex", alignItems: "center" }}>
          <Grid container spacing={2} direction={"row"} alignItems={"center"}>
            <Icon sx={{ display: "block" }}>star</Icon>
            <div>
              React, TS, Next.js, Nest.js, PostgreSQL, formik, yup, RTL, Jest,
              GraphQL
            </div>
          </Grid>
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
      </Grid>
    </header>
  );
}

"use client";
import { Button, Grid, Icon } from "@mui/material";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

export default function Header({ setTheme }) {
  const theme = useContext(ThemeContext);
  const className = "header-" + theme;
  const classNameBtn = "theme-btn-" + theme;

  return (
    <header className={className}>
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
            <div>React app</div>
          </Grid>
        </h1>
        <Button
          className={classNameBtn}
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

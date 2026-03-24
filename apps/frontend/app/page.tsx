"use client";

import { Grid } from "@mui/material";
import Content from "./components/Content";
import Header from "./components/Header";
import { useState } from "react";
import { ThemeContext } from "./ThemeContext";

export default function Home() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeContext value={theme}>
      <div
        data-testid="main-container"
        style={{ width: "100vw", maxWidth: "100vw", overflowX: "hidden" }}
      >
        <Grid
          container
          direction={"column"}
          size={12}
          gridTemplateRows={"auto"}
          sx={{
            backgroundColor: theme === "dark" ? "#363636" : "#f3f2f2cd",
            height: "100%",
          }}
        >
          <Grid size={12}>
            <Header setTheme={setTheme}></Header>
          </Grid>
          <Grid size={12}>
            <Content></Content>
          </Grid>
        </Grid>
      </div>
    </ThemeContext>
  );
}

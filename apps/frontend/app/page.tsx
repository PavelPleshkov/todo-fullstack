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
      <Grid
        container
        direction={"column"}
        spacing={2}
        size={12}
        gridTemplateRows={"auto"}
        sx={
          theme === "dark"
            ? { backgroundColor: "#363636", height: "100%" }
            : { backgroundColor: "#f3f2f2cd", height: "100%" }
        }
      >
        <Grid size={12}>
          <Header setTheme={setTheme}></Header>
        </Grid>
        <Grid size={12}>
          <Content></Content>
        </Grid>
      </Grid>
    </ThemeContext>
  );
}

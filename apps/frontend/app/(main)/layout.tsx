"use client";

import { Grid } from "@mui/material";
import { useState } from "react";
import Header from "../components/Header";
import TabNav from "../components//TabNav";
import { ThemeContext } from "../ThemeContext";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState("light");

  return (
    <ThemeContext value={theme}>
      <div
        data-testid="main-container"
        style={{
          width: "100vw",
          minHeight: "100%",
          maxWidth: "100vw",
          overflowX: "hidden",
          backgroundColor: theme === "dark" ? "#363636" : "#f3f2f2cd",
        }}
      >
        <Grid
          container
          direction="column"
          size={12}
          // gridTemplateRows={"auto"}
          sx={{
            backgroundColor: theme === "dark" ? "#363636" : "#f3f2f2cd",
            height: "100%",
          }}
        >
          <Grid size={12}>
            <Header setTheme={setTheme} />
          </Grid>

          <Grid size={12}>
            <TabNav />
          </Grid>

          <Grid size={12}>
            <div className={`content content-${theme}`} data-testid="content">
              <Grid container direction={"column"} spacing={2}>
                {children}
              </Grid>
            </div>
          </Grid>
        </Grid>
      </div>
    </ThemeContext>
  );
}

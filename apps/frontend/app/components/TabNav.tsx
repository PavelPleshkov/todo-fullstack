"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tab, Tabs } from "@mui/material";
import { useContext } from "react";
import { ThemeContext } from "../ThemeContext";

const TABS = [
  { label: "Login", href: "/login" },
  { label: "Tasks", href: "/tasks" },
  { label: "Form", href: "/form" },
  { label: "Stopwatch", href: "/stopwatch" },
] as const;

export default function TabNav() {
  const pathname = usePathname();
  const theme = useContext(ThemeContext);
  const activeIndex = TABS.findIndex((tab) => pathname === tab.href);

  return (
    <nav
      className={`tab-nav tab-nav-${theme}`}
      data-testid="tab-nav"
      aria-label="Main navigation"
    >
      <Tabs
        value={activeIndex === -1 ? false : activeIndex}
        // variant="fullWidth"
        // indicatorColor="primary"
        textColor="inherit"
        centered
      >
        {TABS.map((tab, index) => (
          <Tab
            key={tab.href}
            label={tab.label}
            value={index}
            component={Link}
            href={tab.href}
            data-testid={`tab-${tab.href.slice(1)}`}
            sx={{
              ":hover": {
                backgroundColor: theme === "dark" ? "#1d1d1d" : "#e0e0e0",
                color: theme === "dark" ? "#ffffff" : "#000000",
                borderRadius: "5px",
              },
            }}
          />
        ))}
      </Tabs>
    </nav>
  );
}

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ThemeContext } from "../ThemeContext";
import Header from "./Header";
import { useState } from "react";

function HeaderWithTheme() {
  const [theme, setTheme] = useState("dark");

  return (
    <ThemeContext value={theme}>
      <Header setTheme={setTheme} />
    </ThemeContext>
  );
}

describe("Header", () => {
  beforeEach(() => render(<HeaderWithTheme />));
  afterEach(() => cleanup());

  it("renders header", async () => {
    const header = screen.getByTestId("header");

    expect(header).toBeInTheDocument();
  });

  it("title has correct text", async () => {
    const title = screen.getByText("React,", {
      exact: false,
    });
    expect(title).toBeTruthy();
  });

  it("theme button changes theme", async () => {
    const header = screen.getByTestId("header");
    const themeBtn = screen.getByTestId("theme-btn");

    expect(themeBtn).toBeInTheDocument();
    expect(header).toHaveClass("header-dark");
    expect(themeBtn).toHaveTextContent("Light");

    await userEvent.click(themeBtn);

    expect(header).toHaveClass("header-light");
    expect(themeBtn).toHaveTextContent("Dark");

    await userEvent.click(themeBtn);

    expect(header).toHaveClass("header-dark");
    expect(themeBtn).toHaveTextContent("Light");
  });
});

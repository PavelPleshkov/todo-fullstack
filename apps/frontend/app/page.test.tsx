import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import Home from "./page";
import { ThemeContext } from "./ThemeContext";

function HomeWithTheme() {
  const theme = "dark";

  return (
    <ThemeContext value={theme}>
      <Home />
    </ThemeContext>
  );
}

describe("Main container", () => {
  it("renders a main container", async () => {
    render(<HomeWithTheme />);
    const mainContainer = screen.getByTestId("main-container");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/tasks",
      );
    });

    expect(mainContainer).toBeInTheDocument();
  });

  it("theme changes", async () => {
    render(<HomeWithTheme />);
    const mainContainer = screen.getByTestId("main-container");
    const themeBtn = screen.getByTestId("theme-btn");

    expect(mainContainer.firstChild).toHaveStyle({
      backgroundColor: "#363636",
    });

    await userEvent.click(themeBtn);

    expect(mainContainer.firstChild).toHaveStyle({
      backgroundColor: "#f3f2f2cd",
    });
  });
});

import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import TabNav from "./TabNav";
import { ThemeContext } from "../ThemeContext";

jest.mock("next/navigation");

describe("TabNav", () => {
  it("renders all tabs", () => {
    (usePathname as jest.Mock).mockReturnValue("/tasks");

    render(
      <ThemeContext value="dark">
        <TabNav />
      </ThemeContext>,
    );

    expect(screen.getByTestId("tab-nav")).toBeInTheDocument();
    expect(screen.getByTestId("tab-form")).toBeInTheDocument();
    expect(screen.getByTestId("tab-stopwatch")).toBeInTheDocument();
    expect(screen.getByTestId("tab-tasks")).toBeInTheDocument();
  });

  it("links point to correct routes", () => {
    (usePathname as jest.Mock).mockReturnValue("/form");

    render(
      <ThemeContext value="dark">
        <TabNav />
      </ThemeContext>,
    );

    expect(screen.getByTestId("tab-form").closest("a")).toHaveAttribute(
      "href",
      "/form",
    );
    expect(screen.getByTestId("tab-stopwatch").closest("a")).toHaveAttribute(
      "href",
      "/stopwatch",
    );
    expect(screen.getByTestId("tab-tasks").closest("a")).toHaveAttribute(
      "href",
      "/tasks",
    );
  });
});

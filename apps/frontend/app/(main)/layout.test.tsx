import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApolloWrapper } from "../ApolloWrapper";
import MainLayout from "./layout";

function renderLayout(children: React.ReactNode = <div>child</div>) {
  return render(
    <ApolloWrapper>
      <MainLayout>{children}</MainLayout>
    </ApolloWrapper>,
  );
}

describe("MainLayout", () => {
  it("renders main container and content area", () => {
    renderLayout();
    expect(screen.getByTestId("main-container")).toBeInTheDocument();
    expect(screen.getByTestId("content")).toBeInTheDocument();
    expect(screen.getByTestId("tab-nav")).toBeInTheDocument();
  });

  it("theme changes", async () => {
    renderLayout();
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

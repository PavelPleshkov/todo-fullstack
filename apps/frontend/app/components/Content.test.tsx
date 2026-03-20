import { act, render, screen, waitFor } from "@testing-library/react";
import Content from "./Content";

describe("Content", () => {
  it("renders content", async () => {
    render(<Content />);
    const content = screen.getByTestId("content");

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/tasks",
      );
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(content).toBeInTheDocument();
  });
});

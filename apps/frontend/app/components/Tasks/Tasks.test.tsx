import { render, screen, waitFor } from "@testing-library/react";
import Tasks from "./Tasks";
import userEvent from "@testing-library/user-event";

describe("Tasks", () => {
  it("renders tasks", async () => {
    render(<Tasks />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/tasks",
      );
    });

    const tasks = screen.getByTestId("tasks");
    expect(tasks).toBeInTheDocument();
  });

  it("renders bin", async () => {
    render(<Tasks />);

    const binButton = screen.getByRole("button", { name: "Bin" });

    await userEvent.click(binButton);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/bin",
      );
    });

    const bin = screen.getByTestId("bin");
    expect(bin).toBeInTheDocument();
  });
});

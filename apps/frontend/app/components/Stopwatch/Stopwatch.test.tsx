import { render, screen } from "@testing-library/react";
import Stopwatch from "./Stopwatch";
import userEvent from "@testing-library/user-event";

describe("Stopwatch", () => {
  it("renders stopwatch", async () => {
    render(<Stopwatch />);
    const stopwatch = screen.getByTestId("stopwatch");

    expect(stopwatch).toBeInTheDocument();
  });

  it("stopwatch time(seconds) works correctly", async () => {
    render(<Stopwatch />);
    const stopwatch = screen.getByTestId("stopwatch");
    const runBtn = screen.getByRole("button", { name: /^Run$/i });
    const resetBtn = screen.getByRole("button", { name: /^Reset$/i });

    expect(stopwatch).toHaveTextContent(/00 : 00 : 00/i);
    await userEvent.click(runBtn);

    const stopBtn = screen.getByRole("button", { name: /^Stop$/i });

    expect(stopBtn).toBeInTheDocument();

    setTimeout(async () => {
      expect(stopwatch).toHaveTextContent(/00 : 00 : 01/i);
      await userEvent.click(stopBtn);
      expect(runBtn).toBeInTheDocument();
      await userEvent.click(resetBtn);
      expect(stopwatch).toHaveTextContent(/00 : 00 : 00/i);
    }, 1000);
  });

  it("stopwatch control buttons work correctly", async () => {
    render(<Stopwatch />);
    const runBtn = screen.getByRole("button", { name: /^Run$/i });
    const resetBtn = screen.getByRole("button", { name: /^Reset$/i });

    expect(runBtn).toBeInTheDocument();
    expect(resetBtn).toBeInTheDocument();

    expect(runBtn).toHaveTextContent("Run");
    await userEvent.click(runBtn);
    // expect(runBtn).not.toBeInTheDocument();
    const stopBtn = screen.getByRole("button", { name: /^Stop$/i });
    expect(stopBtn).toBeInTheDocument();

    expect(stopBtn).toHaveTextContent("Stop");
    await userEvent.click(resetBtn);
    expect(runBtn).toHaveTextContent("Run");

    await userEvent.click(runBtn);
    expect(stopBtn).toBeInTheDocument();
    await userEvent.click(stopBtn);
    expect(runBtn).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import AddTask from "./AddTask";
import userEvent from "@testing-library/user-event";

describe("AddTask", () => {
  it("renders add task", async () => {
    render(
      <AddTask
        tasks={[]}
        setTasks={() => {}}
        sortTasks={() => {}}
        sortOrder="asc"
        bin={[]}
        setBin={() => {}}
        isBin={false}
        setIsBin={() => {}}
      />,
    );

    const addTask = screen.getByTestId("add-task");

    expect(addTask).toBeInTheDocument();
  });

  it("add task button works correctly", async () => {
    const setTasks = jest.fn();

    render(
      <AddTask
        tasks={[]}
        setTasks={setTasks}
        sortTasks={() => {}}
        sortOrder="asc"
        bin={[]}
        setBin={() => {}}
        isBin={false}
        setIsBin={() => {}}
      />,
    );

    const addTaskInput = screen.getByTestId("add-task-input");
    const addTaskButton = screen.getByRole("button", { name: "Add" });

    await userEvent.type(addTaskInput, "Test task");
    expect(addTaskButton).toBeInTheDocument();

    await userEvent.click(addTaskButton);

    expect(setTasks).toHaveBeenCalled();
  });

  it("delete completed button works correctly", async () => {
    const setTasks = jest.fn();

    render(
      <AddTask
        tasks={[]}
        setTasks={setTasks}
        sortTasks={() => {}}
        sortOrder="asc"
        bin={[]}
        setBin={() => {}}
        isBin={false}
        setIsBin={() => {}}
      />,
    );

    const deleteCompletedButton = screen.getByRole("button", {
      name: "Delete completed",
    });
    expect(deleteCompletedButton).toBeInTheDocument();

    await userEvent.click(deleteCompletedButton);

    expect(setTasks).toHaveBeenCalled();
  });

  it("mark all button works correctly", async () => {
    const setTasks = jest.fn();

    render(
      <AddTask
        tasks={[]}
        setTasks={setTasks}
        sortTasks={() => {}}
        sortOrder="asc"
        bin={[]}
        setBin={() => {}}
        isBin={false}
        setIsBin={() => {}}
      />,
    );

    const markAllButton = screen.getByRole("button", { name: "Mark all" });
    expect(markAllButton).toBeInTheDocument();

    await userEvent.click(markAllButton);

    expect(setTasks).toHaveBeenCalled();
  });

  it("unmark all button works correctly", async () => {
    const setTasks = jest.fn();

    render(
      <AddTask
        tasks={[]}
        setTasks={setTasks}
        sortTasks={() => {}}
        sortOrder="asc"
        bin={[]}
        setBin={() => {}}
        isBin={false}
        setIsBin={() => {}}
      />,
    );

    const unmarkAllButton = screen.getByRole("button", { name: "Unmark all" });
    expect(unmarkAllButton).toBeInTheDocument();

    await userEvent.click(unmarkAllButton);

    expect(setTasks).toHaveBeenCalled();
  });

  it("sort button works correctly", async () => {
    const sortTasks = jest.fn();

    render(
      <AddTask
        tasks={[]}
        setTasks={() => {}}
        sortTasks={sortTasks}
        sortOrder="asc"
        bin={[]}
        setBin={() => {}}
        isBin={false}
        setIsBin={() => {}}
      />,
    );

    const sortButton = screen.getByRole("button", { name: "Sort asc" });
    expect(sortButton).toBeInTheDocument();

    await userEvent.click(sortButton);

    expect(sortTasks).toHaveBeenCalled();
  });

  it("bin button works correctly", async () => {
    const setIsBin = jest.fn();

    render(
      <AddTask
        tasks={[]}
        setTasks={() => {}}
        sortTasks={() => {}}
        sortOrder="asc"
        bin={[]}
        setBin={() => {}}
        isBin={false}
        setIsBin={setIsBin}
      />,
    );

    const binButton = screen.getByRole("button", { name: "Bin" });
    expect(binButton).toBeInTheDocument();

    await userEvent.click(binButton);

    expect(setIsBin).toHaveBeenCalled();
  });

  it("exit bin button works correctly", async () => {
    const setIsBin = jest.fn();

    render(
      <AddTask
        tasks={[]}
        setTasks={() => {}}
        sortTasks={() => {}}
        sortOrder="asc"
        bin={[]}
        setBin={() => {}}
        isBin={true}
        setIsBin={setIsBin}
      />,
    );

    const exitBinButton = screen.getByRole("button", { name: "Exit bin" });
    expect(exitBinButton).toBeInTheDocument();

    await userEvent.click(exitBinButton);

    expect(setIsBin).toHaveBeenCalled();
  });
});

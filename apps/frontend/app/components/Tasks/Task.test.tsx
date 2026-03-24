import { render, screen } from "@testing-library/react";
import Task from "./Task";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

describe("Task", () => {
  it("renders task", async () => {
    render(
      <Task
        task={{ id: 1, text: "Test task", isDone: false, date: "2021-01-01" }}
        tasks={[]}
        setTasks={() => {}}
        toggleTask={() => {}}
        bin={[]}
        setBin={() => {}}
        isBin={false}
      />,
    );
    const task = screen.getByTestId("task");
    expect(task).toBeInTheDocument();
  });

  it("task checkbox works correctly", async () => {
    function TaskWithWorkingCheckbox() {
      const [task, setTask] = useState({
        id: 1,
        text: "Test task",
        isDone: false,
        date: "2021-01-01",
      });
      const toggleTask = (id: number) => {
        setTask((t) => (t.id === id ? { ...t, isDone: !t.isDone } : t));
      };
      return (
        <Task
          task={task}
          tasks={[task]}
          setTasks={() => {}}
          toggleTask={toggleTask}
          bin={[]}
          setBin={() => {}}
          isBin={false}
        />
      );
    }

    render(<TaskWithWorkingCheckbox />);
    const checkbox = screen.getByRole("checkbox");

    expect(checkbox).toBeInTheDocument();
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    // const toggleTask = jest.fn();
    // render(
    //   <Task
    //     task={{ id: 1, text: "Test task", isDone: false, date: "2021-01-01" }}
    //     tasks={[]}
    //     setTasks={() => {}}
    //     toggleTask={toggleTask}
    //     bin={[]}
    //     setBin={() => {}}
    //     isBin={false}
    //   />,
    // );
    // const checkbox = screen.getByRole("checkbox");
    // expect(checkbox).toBeInTheDocument();
    // await userEvent.click(checkbox);
    // expect(toggleTask).toHaveBeenCalledWith(1);
  });
});

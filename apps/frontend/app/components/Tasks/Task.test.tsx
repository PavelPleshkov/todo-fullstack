import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useApolloClient } from "@apollo/client/react";
import { AuthContext } from "@/app/AuthContext";
import type { StoredUser } from "@/app/lib/auth-storage";
import {
  UPDATE_TASK_MUTATION,
  MOVE_TO_BIN_MUTATION,
  MOVE_TO_ACTIVE_MUTATION,
  PERMANENTLY_DELETE_MUTATION,
  ACTIVE_TASKS_QUERY,
  BIN_TASKS_QUERY,
} from "@/app/lib/graphql/operations";
import Task, { type Task as TaskType } from "./Task";

jest.mock("@apollo/client/react", () => ({
  useApolloClient: jest.fn(),
}));

const mockMutate = jest.fn().mockResolvedValue({ data: {} });

const sampleTask: TaskType = {
  id: 1,
  text: "Test task",
  isDone: false,
  date: "2025-01-01",
  userId: 1,
  ownerEmail: "owner@test.com",
};

const admin: StoredUser = {
  id: 1,
  email: "admin@test.com",
  role: "admin",
};

const user: StoredUser = {
  id: 2,
  email: "user@test.com",
  role: "user",
};

function renderTask(
  props: { task?: TaskType; isBin?: boolean } = {},
  authUser: StoredUser | null = user,
) {
  render(
    <AuthContext
      value={{
        user: authUser,
        token: authUser ? "token" : null,
        isAuthenticated: Boolean(authUser),
        setSession: jest.fn(),
        logout: jest.fn(),
      }}
    >
      <Task task={props.task ?? sampleTask} isBin={props.isBin ?? false} />
    </AuthContext>,
  );
}

describe("Task", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    (useApolloClient as jest.Mock).mockReturnValue({
      mutate: mockMutate,
    });
  });

  afterEach(() => {
    if (
      jest.spyOn(window, "confirm").mockReturnValue(true) ||
      jest.spyOn(window, "confirm").mockReturnValue(false)
    ) {
      (window.confirm as jest.Mock).mockRestore();
    }
  });

  it("renders task, task text, date and owner email", async () => {
    renderTask();

    const task = screen.getByTestId("task");
    const text = screen.getByText("Test task");
    const date = screen.getByText("2025-01-01");
    const email = screen.getByTestId("task-owner-email");

    expect(task).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(date).toBeInTheDocument();
    expect(email).toHaveTextContent("owner@test.com");
  });

  it("toggles completion via UPDATE_TASK_MUTATION", async () => {
    renderTask();

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: UPDATE_TASK_MUTATION,
      variables: {
        id: 1,
        input: { isDone: true },
      },
    });

    // checkbox stays unchecked - state comes from outside via task.isDone prop
    expect(checkbox).not.toBeChecked();
  });

  it("renders checked checkbox when task is done", async () => {
    renderTask({ task: { ...sampleTask, isDone: true } });

    const checkbox = screen.getByRole("checkbox");
    const editBtn = screen.getByTitle("Edit task");
    expect(checkbox).toBeChecked();
    expect(editBtn).toBeDisabled();
  });

  it("doesn't toggle checkbox when task is in bin", async () => {
    renderTask({ isBin: true });

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();

    await userEvent.click(checkbox);

    expect(checkbox).toBeDisabled();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("edit and save task text work", async () => {
    renderTask();

    const editBtn = screen.getByTitle("Edit task");
    expect(editBtn).toBeEnabled();

    await userEvent.click(editBtn);

    const textarea = screen.getByTestId("task-textarea");
    const saveBtn = screen.getByTitle("Save task");

    await userEvent.clear(textarea);
    await userEvent.type(textarea, "Updated task");
    await userEvent.click(saveBtn);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: UPDATE_TASK_MUTATION,
      variables: {
        id: 1,
        input: { text: "Updated task" },
      },
      refetchQueries: [{ query: ACTIVE_TASKS_QUERY }],
    });
    // expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    // expect(screen.getByText("Updated task")).toBeInTheDocument();
    expect(textarea).not.toBeInTheDocument();
    const text = screen.getByText("Updated task");
    expect(text).toBeInTheDocument();
    expect(editBtn).toBeInTheDocument();
    expect(editBtn).toBeEnabled();
  });

  it("move an active task to bin works", async () => {
    renderTask();

    await userEvent.click(screen.getByTitle("Move to bin"));

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MOVE_TO_BIN_MUTATION,
      variables: {
        id: 1,
      },
      refetchQueries: [
        { query: ACTIVE_TASKS_QUERY },
        { query: BIN_TASKS_QUERY },
      ],
    });
  });

  it("Restore btn is shown for user in bin, Delete btn isn't", async () => {
    renderTask({ isBin: true }, user);

    const restoreBtn = screen.getByTitle("Restore from bin");
    const deleteBtn = screen.queryByTitle("Delete");

    expect(restoreBtn).toBeInTheDocument();
    expect(deleteBtn).not.toBeInTheDocument();
  });

  it("Restore and Delete btns are shown for admin in bin", async () => {
    renderTask({ isBin: true }, admin);

    const restoreBtn = screen.getByTitle("Restore from bin");
    const deleteBtn = screen.queryByTitle("Delete");

    expect(restoreBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();
  });

  it("Restore btn works", async () => {
    renderTask({ isBin: true });

    const restoreBtn = screen.getByTitle("Restore from bin");
    await userEvent.click(restoreBtn);

    expect(mockMutate).toHaveBeenCalledWith({
      mutation: MOVE_TO_ACTIVE_MUTATION,
      variables: {
        id: 1,
      },
      refetchQueries: [
        { query: ACTIVE_TASKS_QUERY },
        { query: BIN_TASKS_QUERY },
      ],
    });
  });

  it("Delete btn works only after confirm", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(true);
    renderTask({ isBin: true }, admin);

    const deleteBtn = screen.getByTitle("Delete");
    await userEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockMutate).toHaveBeenCalledWith({
      mutation: PERMANENTLY_DELETE_MUTATION,
      variables: {
        id: 1,
      },
      refetchQueries: [{ query: BIN_TASKS_QUERY }],
    });

    // (window.confirm as jest.Mock).mockRestore();
  });

  it("doesn't delete task if confirm is cancelled", async () => {
    jest.spyOn(window, "confirm").mockReturnValue(false);
    renderTask({ isBin: true }, admin);

    const deleteBtn = screen.getByTitle("Delete");
    await userEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockMutate).not.toHaveBeenCalled();

    // (window.confirm as jest.Mock).mockRestore();
  });
});

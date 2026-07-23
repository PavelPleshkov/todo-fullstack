import { Grid } from "@mui/material";
import { memo, useContext, useState } from "react";
import Btn from "./Btn";
import { ThemeContext } from "@/app/ThemeContext";
// import { useApolloClient, useMutation } from "@apollo/client/react";
import { useApolloClient } from "@apollo/client/react";

import {
  CREATE_TASK_MUTATION,
  MARK_ALL_MUTATION,
  MOVE_COMPLETED_MUTATION,
  UNMARK_ALL_MUTATION,
  ACTIVE_TASKS_QUERY,
  BIN_TASKS_QUERY,
} from "@/app/lib/graphql/operations";

interface AddTaskProps {
  // tasks: TaskType[];
  // setTasks: (tasks: TaskType[]) => void;
  // searchValue: string;
  isSearchActive: boolean;
  sortTasks: () => void;
  sortDirection: "asc" | "desc";
  // bin: TaskType[];
  // setBin: (bin: TaskType[]) => void;
  isBin: boolean;
  setIsBin: (isBin: boolean) => void;
  // refetchActive: () => Promise<unknown>;
  // refetchBin: () => Promise<unknown>;
}

export default memo(function AddTask({
  // tasks,
  // setTasks,
  // searchValue,
  isSearchActive,
  sortTasks,
  sortDirection,
  // bin,
  // setBin,
  isBin,
  setIsBin,
  // refetchActive,
  // refetchBin,
}: AddTaskProps): React.ReactNode {
  const [text, setText] = useState<string>("");
  const [isAddTaskFailed, setIsAddTaskFailed] = useState<boolean>(false);
  const theme: string = useContext(ThemeContext);
  const className: string = "add-task-" + theme;

  // const [createTaskMut] = useMutation(CREATE_TASK_MUTATION, {
  //   refetchQueries: [{ query: ACTIVE_TASKS_QUERY }],
  // });
  // const [moveCompletedMut] = useMutation(MOVE_COMPLETED_MUTATION, {
  //   refetchQueries: [{ query: ACTIVE_TASKS_QUERY }, { query: BIN_TASKS_QUERY }],
  // });
  // const [markAllMut] = useMutation(MARK_ALL_MUTATION, {
  //   refetchQueries: [{ query: ACTIVE_TASKS_QUERY }],
  // });
  // const [unmarkAllMut] = useMutation(UNMARK_ALL_MUTATION, {
  //   refetchQueries: [{ query: ACTIVE_TASKS_QUERY }],
  // });
  const client = useApolloClient();

  const addTask = async () => {
    if (!text.trim()) {
      setIsAddTaskFailed(true);

      return;
    }

    setIsAddTaskFailed(false);
    // try {
    //   const response = await fetch("http://localhost:3001/api/tasks", {
    //     method: "POST",
    //     body: JSON.stringify({ text: text.trim(), isDone: false }),
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   });

    //   if (response.ok) {
    //     const newTask = await response.json();

    //     setTasks([newTask, ...tasks]);
    //     setText("");
    //   }
    // } catch (error) {
    //   console.error("Add task failed:", error);
    // }

    try {
      // const { data } = await createTaskMut({
      //   variables: { input: { text: text.trim(), isDone: false } },
      // });
      const { data } = await client.mutate({
        mutation: CREATE_TASK_MUTATION,
        variables: { input: { text: text.trim(), isDone: false } },
        refetchQueries: [{ query: ACTIVE_TASKS_QUERY }],
      });
      if (data?.createTask) {
        // setTasks([data.createTask, ...tasks]);
        setText("");
        // await refetchActive();
      }
    } catch (error) {
      console.error("Add task failed:", error);
    }
  };

  const deleteCompleted = async () => {
    // try {
    //   const response = await fetch(
    //     "http://localhost:3001/api/completed-to-bin",
    //     { method: "POST" },
    //   );

    //   if (response.ok) {
    //     const { moved, tasks: remainingTasks } = await response.json();

    //     setTasks(Array.isArray(remainingTasks) ? remainingTasks : []);
    //     // setBin((prev: TaskType[]) => [...(Array.isArray(moved) ? moved : []), ...prev]);
    //     setBin([...(Array.isArray(moved) ? moved : []), ...bin]);
    //   }
    // } catch (error) {
    //   console.log("Delete completed error: ", error);
    // }

    const shureQuestion = window.confirm(
      "Are you sure you want to delete completed tasks?",
    );
    if (!shureQuestion) {
      return;
    } else {
      try {
        const data = await client.query({ query: ACTIVE_TASKS_QUERY });
        const completedTasks = data.data?.activeTasks.filter(
          (task) => task.isDone,
        );
        if (completedTasks && completedTasks.length > 0) {
          await client.mutate({
            mutation: MOVE_COMPLETED_MUTATION,
            refetchQueries: [
              { query: ACTIVE_TASKS_QUERY },
              { query: BIN_TASKS_QUERY },
            ],
          });
        } else {
          console.log("No completed tasks to delete");
        }
      } catch (error) {
        console.log("Delete completed error: ", error);
      }
    }

    // try {
    //   // const { data } = await moveCompletedMut();
    //   // await moveCompletedMut();
    //   await client.mutate({
    //     mutation: MOVE_COMPLETED_MUTATION,
    //     refetchQueries: [
    //       { query: ACTIVE_TASKS_QUERY },
    //       { query: BIN_TASKS_QUERY },
    //     ],
    //   });
    //   // if (data?.moveCompletedToBin) {
    //   //   // setTasks(
    //   //   //   Array.isArray(data.moveCompletedToBin.tasks)
    //   //   //     ? data.moveCompletedToBin.tasks
    //   //   //     : [],
    //   //   // );
    //   //   // setBin([
    //   //   //   ...(Array.isArray(data.moveCompletedToBin.moved)
    //   //   //     ? data.moveCompletedToBin.moved
    //   //   //     : []),
    //   //   //   ...bin,
    //   //   // ]);
    //   // await refetchActive();
    //   // await refetchBin();
    //   // }
    // } catch (error) {
    //   console.log("Delete completed error: ", error);
    // }
  };

  const markAll = async () => {
    // try {
    //   const response = await fetch("http://localhost:3001/api/tasks/mark-all", {
    //     method: "POST",
    //   });

    //   if (response.ok) {
    //     const markedTasks = await response.json();

    //     setTasks(markedTasks);
    //   }
    // } catch (error) {
    //   console.log("marking all tasks error: ", error);
    // }

    try {
      // const { data } = await markAllMut();
      // await markAllMut();
      await client.mutate({
        mutation: MARK_ALL_MUTATION,
        refetchQueries: [{ query: ACTIVE_TASKS_QUERY }],
      });
      // if (data?.markAllActiveTasks) {
      //   // setTasks(data.markAllActiveTasks);
      // await refetchActive();
      // }
    } catch (error) {
      console.log("Mark all tasks error: ", error);
    }
  };

  const unmarkAll = async () => {
    // try {
    //   const response = await fetch(
    //     "http://localhost:3001/api/tasks/unmark-all",
    //     { method: "POST" },
    //   );

    //   if (response.ok) {
    //     const unmarkedTasks = await response.json();

    //     setTasks(unmarkedTasks);
    //   }
    // } catch (error) {
    //   console.log("unmarking all tasks error: ", error);
    // }

    try {
      // const { data } = await unmarkAllMut();
      // await unmarkAllMut();
      await client.mutate({
        mutation: UNMARK_ALL_MUTATION,
        refetchQueries: [{ query: ACTIVE_TASKS_QUERY }],
      });
      // if (data?.unmarkAllActiveTasks) {
      //   // setTasks(data.unmarkAllActiveTasks);
      // await refetchActive();
      // }
    } catch (error) {
      console.log("Unmark all tasks error: ", error);
    }
  };

  return (
    <Grid
      container
      size={12}
      direction={"row"}
      spacing={2}
      alignItems={"center"}
      sx={{ padding: "10px 10px 10px" }}
      className={className}
      data-testid="add-task"
    >
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <textarea
          aria-label="Add task input"
          data-testid="add-task-input"
          className={isAddTaskFailed ? "failed-adding" : ""}
          rows={2}
          style={{
            backgroundColor: theme === "dark" ? "#363636" : "#ffffff",
            border: "1px solid #1d1d1d",
            borderRadius: "5px",
            outlineColor: "#1d1d1d",
            padding: "10px",
            width: "100%",
          }}
          name="new task"
          // type="text"
          value={text}
          placeholder={isAddTaskFailed ? "<--- Type new task here" : "New task"}
          onChange={(e) => setText(e.target.value)}
        />
      </Grid>
      <Grid container spacing={2} size={{ xs: 12, md: 6, lg: 8 }}>
        <Grid container>
          <Btn
            // disabled={isBin || searchValue !== ""}
            disabled={isBin || isSearchActive}
            variant="contained"
            onClick={() => {
              if (isBin === false) {
                addTask();
              }
            }}
          >
            Add
          </Btn>
          <Btn
            // disabled={isBin || searchValue !== ""}
            disabled={isBin || isSearchActive}
            variant="contained"
            onClick={() => deleteCompleted()}
          >
            Delete completed
          </Btn>
        </Grid>
        <Grid container>
          <Btn
            // disabled={isBin || searchValue !== ""}
            disabled={isBin || isSearchActive}
            variant="contained"
            onClick={() => markAll()}
          >
            Mark all
          </Btn>
          <Btn
            // disabled={isBin || searchValue !== ""}
            disabled={isBin || isSearchActive}
            variant="contained"
            onClick={() => unmarkAll()}
          >
            Unmark all
          </Btn>
          <Btn
            variant="contained"
            onClick={() => {
              sortTasks();
            }}
          >
            {/* Sort {sortDirection} */}
            {sortDirection === "asc" ? "↑" : "↓"} Sort{" "}
            {sortDirection === "asc" ? "↑" : "↓"}
          </Btn>
        </Grid>
        <Grid>
          <Btn
            variant="contained"
            onClick={() => {
              setIsBin(isBin ? false : true);
            }}
          >
            {!isBin ? "Bin" : "Exit bin"}
          </Btn>
        </Grid>
      </Grid>
    </Grid>
  );
});

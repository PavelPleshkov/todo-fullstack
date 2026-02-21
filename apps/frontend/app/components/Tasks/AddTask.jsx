import { colors, Grid } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import Btn from "./Btn";
import { ThemeContext } from "@/app/ThemeContext";

export default function AddTask({
  tasks,
  setTasks,
  sortTasks,
  sortOrder,
  bin,
  setBin,
  isBin,
  setIsBin,
}) {
  const [text, setText] = useState("");
  const [isAddTaskFailed, setIsAddTaskFailed] = useState(false);
  const theme = useContext(ThemeContext);
  const className = "add-task-" + theme;

  const addTask = async () => {
    if (!text.trim()) {
      setIsAddTaskFailed(true);

      return;
    }

    setIsAddTaskFailed(false);

    try {
      const response = await fetch("http://localhost:3001/api/tasks", {
        method: "POST",
        body: JSON.stringify({ text: text.trim(), isDone: false }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const newTask = await response.json();

        setTasks([newTask, ...tasks]);
        setText("");
      }
    } catch (error) {
      console.warn("❌ Add task failed:", error);
    }
  };

  const deleteCompleted = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/completed-to-bin",
        { method: "POST" },
      );

      if (response.ok) {
        const movedTasks = await response.json();

        setTasks(tasks.filter((t) => !t.isDone));
        setBin([...movedTasks, ...bin]);
      }
    } catch (error) {
      console.log("Delete completed error: ", error);
    }
  };

  const markAll = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/tasks/mark-all", {
        method: "POST",
      });

      if (response.ok) {
        const markedTasks = await response.json();

        setTasks(markedTasks);
      }
    } catch (error) {
      console.log("marking all tasks error: ", error);
    }
  };

  const unmarkAll = async () => {
    try {
      const response = await fetch(
        "http://localhost:3001/api/tasks/unmark-all",
        { method: "POST" },
      );

      if (response.ok) {
        const unmarkedTasks = await response.json();

        setTasks(unmarkedTasks);
      }
    } catch (error) {
      console.log("unmarking all tasks error: ", error);
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
    >
      <Grid size={4}>
        <input
          className={isAddTaskFailed ? "failed-adding" : ""}
          style={{
            backgroundColor: theme === "dark" ? "#363636" : "#ffffff",
            border: "1px solid #1d1d1d",
            borderRadius: "5px",
            outlineColor: "#1d1d1d",
            padding: "10px",
            width: "100%",
          }}
          name="new task"
          type="text"
          value={text}
          placeholder={isAddTaskFailed ? "<--- Type new task here" : "New task"}
          onChange={(e) => setText(e.target.value)}
        />
      </Grid>
      <Grid container spacing={2} size={8}>
        <Grid container>
          <Btn
            disabled={isBin}
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
            disabled={isBin}
            variant="contained"
            onClick={() => deleteCompleted()}
          >
            Delete completed
          </Btn>
        </Grid>
        <Grid container>
          <Btn disabled={isBin} variant="contained" onClick={() => markAll()}>
            Mark all
          </Btn>
          <Btn disabled={isBin} variant="contained" onClick={() => unmarkAll()}>
            Unmark all
          </Btn>
          <Btn
            variant="contained"
            onClick={() => {
              sortTasks(!isBin ? tasks : bin);
            }}
          >
            Sort {sortOrder === "asc" ? "asc" : "desc"}
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
}

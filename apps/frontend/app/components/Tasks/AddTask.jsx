import { Grid } from "@mui/material";
import { useContext, useState } from "react";
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
  const theme = useContext(ThemeContext);
  const className = "add-task-" + theme;

  function addTask() {
    setTasks([
      {
        id: Date.now(),
        text: text,
        isDone: false,
        date: new Date().toLocaleString(),
      },
      ...tasks,
    ]);
    setText("");
  }

  function deleteCompleted() {
    setTasks(
      tasks.filter((t) => {
        return !t.isDone;
      }),
    );
    const deletedTasks = tasks.filter((t) => {
      return t.isDone;
    });

    setBin([...deletedTasks, ...bin]);
  }

  return (
    <Grid
      container
      size={12}
      direction={"row"}
      spacing={2}
      alignItems={"center"}
      sx={{ padding: "10px" }}
      className={className}
    >
      <Grid size={4}>
        <input
          style={{
            backgroundColor: theme === "dark" ? "#363636" : "#ffffff",
            border: "1px solid #1d1d1d",
            borderRadius: "5px",
            outlineColor: "#1d1d1d",
            padding: "10px",
            width: "100%",
          }}
          type="text"
          value={text}
          placeholder="Type new task here"
          onChange={(e) => {
            // changeText(e);
            setText(e.target.value);
          }}
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
            onClick={() => {
              deleteCompleted();
            }}
          >
            Delete completed
          </Btn>
        </Grid>
        <Grid container>
          <Btn
            disabled={isBin}
            variant="contained"
            onClick={() => {
              setTasks(
                tasks.map((t) => {
                  if (t.isDone === false) {
                    return { ...t, isDone: true };
                  } else {
                    return t;
                  }
                }),
              );
            }}
          >
            Mark all
          </Btn>
          <Btn
            disabled={isBin}
            variant="contained"
            onClick={() => {
              setTasks(
                tasks.map((t) =>
                  t.isDone === true ? { ...t, isDone: false } : t,
                ),
              );
            }}
          >
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

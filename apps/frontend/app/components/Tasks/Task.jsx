"use client";

import { Delete } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useContext, useState } from "react";

import Btn from "./Btn";
import { ThemeContext } from "@/app/ThemeContext";

export default function Task({
  task,
  tasks,
  setTasks,
  toggleTask,
  bin,
  setBin,
  isBin,
}) {
  const [selfText, setSelfText] = useState(task.text);
  const [isEditable, setIsEditable] = useState(false);

  const theme = useContext(ThemeContext);

  const editTask = async (id) => {
    if (isEditable) {
      try {
        const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: selfText }),
        });

        if (response.ok) {
          const updatedTask = await response.json();

          setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
        }
      } catch (error) {
        console.log("Edit error: ", error);
      }
    }
    setIsEditable((prev) => !prev);
  };

  const deleteTask = async (id) => {
    if (!isBin) {
      try {
        const response = await fetch(`http://localhost:3001/api/bin/${id}`, {
          method: "POST",
        });

        if (response.ok) {
          setTasks(tasks.filter((t) => t.id !== id));
          setBin([task, ...bin]);
        }
      } catch (error) {
        console.log("Delete error: ", error);
      }
    } else {
      const response = await fetch(`http://localhost:3001/api/bin/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBin(bin.filter((t) => t.id !== id));
      }
    }
  };

  return (
    <li style={{ padding: "5px 10px" }}>
      <Grid container spacing={2} size={12} direction={"row"}>
        <Grid size={6}>
          {!isEditable ? (
            <label
              style={{
                display: "block",
                border: "1px solid #1d1d1d",
                borderRadius: "5px",
                width: "100%",
                height: "100%",
                padding: "5px",
                overflow: "hidden",
                opacity: task.isDone ? ".5" : "1",
              }}
            >
              <Grid
                container
                size={12}
                direction={"row"}
                wrap="nowrap"
                alignItems={"center"}
              >
                <Grid direction={"row"}>
                  <input
                    key={task.isDone ? "checked" : "unchecked"}
                    id={task.id}
                    type="checkbox"
                    checked={task.isDone}
                    onChange={() => toggleTask(task.id)}
                    style={{
                      display: "block",
                      margin: "0 10px",
                    }}
                  />
                </Grid>
                <Grid>
                  <div>{task.date}</div>
                  <div>
                    <b>{selfText}</b>
                  </div>
                </Grid>
              </Grid>
            </label>
          ) : (
            <input
              id={task.id}
              type="text"
              value={selfText}
              autoFocus={isEditable}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  editTask(task.id);
                }
              }}
              onChange={(e) => {
                setSelfText(e.target.value);
                setTasks(
                  tasks.map((t) => {
                    if (t.id === +e.target.id) {
                      return { ...t, text: e.target.value };
                    } else {
                      return t;
                    }
                  }),
                );
              }}
              style={{
                width: "100%",
                backgroundColor: theme === "dark" ? "#363636" : "#ffffff",
                outlineColor: "#1d1d1d",
                padding: "5px",
              }}
            />
          )}
        </Grid>
        <Grid container direction={"row"} size={6} spacing={2}>
          <Grid>
            <Btn onClick={() => deleteTask(task.id)} variant="contained">
              <Delete />
            </Btn>
          </Grid>
          <Grid>
            <Btn
              disabled={isBin}
              variant="contained"
              onClick={() => editTask(task.id)}
            >
              {isEditable ? "Save" : "Edit"}
            </Btn>
          </Grid>
        </Grid>
      </Grid>
    </li>
  );
}

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

  function editTask() {
    if (isEditable) {
      setTasks(
        tasks.map((t) => {
          if (t.id === task.id) {
            return {
              ...t,
              id: Date.now(),
              text: selfText,
              date: new Date().toLocaleString(),
            };
          } else {
            return t;
          }
        }),
      );
    }
    setIsEditable((prev) => !prev);
  }

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
                  editTask();
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
            <Btn
              onClick={() => {
                if (!isBin) {
                  setTasks(tasks.filter((t) => t.id !== task.id));
                  setBin([
                    {
                      id: task.id,
                      text: task.text,
                      isDone: task.isDone,
                      date: task.date,
                    },
                    ...bin,
                  ]);
                } else {
                  setBin(bin.filter((t) => t.id !== task.id));
                }
              }}
              variant="contained"
            >
              <Delete />
            </Btn>
          </Grid>
          <Grid>
            <Btn
              disabled={isBin}
              variant="contained"
              onClick={() => {
                editTask();
              }}
            >
              {isEditable ? "Save" : "Edit"}
            </Btn>
          </Grid>
        </Grid>
      </Grid>
    </li>
  );
}

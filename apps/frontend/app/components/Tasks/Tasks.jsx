"use client";

import { Grid } from "@mui/material";
import { useState } from "react";
import AddTask from "./AddTask";
import Task from "./Task";

const initialTasks = [
  {
    id: Date.now() + 1,
    text: "2 task",
    isDone: true,
    date: new Date().toLocaleString(),
  },
  {
    id: Date.now(),
    text: "1 task",
    isDone: false,
    date: new Date().toLocaleString(),
  },
];

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [sortOrder, setSortOrder] = useState("asc");
  const [bin, setBin] = useState([]);
  const [isBin, setIsBin] = useState(false);

  const sortTasks = (tasks) => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (sortOrder === "asc") {
        return a.id - b.id;
      } else {
        return b.id - a.id;
      }
    });
    if (!isBin) {
      setTasks(sortedTasks);
    } else {
      setBin(sortedTasks);
    }

    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          return { ...t, isDone: !t.isDone };
        } else {
          return t;
        }
      }),
    );
  };

  return (
    <Grid container size={12} direction={"column"} spacing={2}>
      <AddTask
        tasks={tasks}
        setTasks={setTasks}
        sortTasks={sortTasks}
        sortOrder={sortOrder}
        bin={bin}
        setBin={setBin}
        isBin={isBin}
        setIsBin={setIsBin}
      />

      <Grid size={12}>
        <h1 style={{ padding: "10px 20px" }}>
          {!isBin ? "Tasks" : bin.length ? "Bin" : "Bin empty"}
        </h1>
        <ul>
          {!isBin
            ? tasks.map((task) => {
                return (
                  <Task
                    task={task}
                    tasks={tasks}
                    setTasks={setTasks}
                    toggleTask={() => toggleTask(task.id)}
                    key={task.id}
                    bin={bin}
                    setBin={setBin}
                  />
                );
              })
            : bin.map((task) => {
                return (
                  <Task
                    task={task}
                    tasks={tasks}
                    setTasks={setTasks}
                    toggleTask={() => toggleTask(task.id)}
                    key={task.id}
                    bin={bin}
                    setBin={setBin}
                    isBin={isBin}
                  />
                );
              })}
        </ul>
      </Grid>
    </Grid>
  );
}

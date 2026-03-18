"use client";

import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import AddTask from "./AddTask";
import Task, { Task as TaskType } from "./Task";

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [bin, setBin] = useState<TaskType[]>([]);
  const [isBin, setIsBin] = useState<boolean>(false);

  useEffect(() => {
    fetch("http://localhost:3001/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data))
      .catch((err) => console.error("API error: ", err));
  }, []);

  useEffect(() => {
    if (isBin) {
      fetch("http://localhost:3001/api/bin")
        .then((res) => res.json())
        .then((data) => setBin(data))
        .catch((err) => console.log("API error: ", err));
    }
  }, [isBin]);

  const sortTasks = (tasks: TaskType[]) => {
    const sortedTasks: TaskType[] = [...tasks].sort(
      (a: TaskType, b: TaskType) => {
        if (sortOrder === "asc") {
          return a.id - b.id;
        } else {
          return b.id - a.id;
        }
      },
    );

    if (!isBin) {
      setTasks(sortedTasks);
    } else {
      setBin(sortedTasks);
    }

    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const toggleTask = async (id: number) => {
    const task: TaskType | undefined = tasks.find((t: TaskType) => t.id === id);
    if (!task) return;

    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDone: !task.isDone }),
      });

      const data = await response.json();

      if (response.ok && data.id !== undefined && !data.error) {
        setTasks((prev: TaskType[]) =>
          prev.map((t: TaskType) =>
            t.id === id ? { ...t, ...data, isDone: Boolean(data.isDone) } : t,
          ),
        );
      }
    } catch (error) {
      console.error("Toggle error: ", error);
    }
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
          {!isBin ? "Tasks" : bin.length ? "Bin" : "Bin is empty"}
        </h1>
        <ul>
          {!isBin
            ? tasks.map((task: TaskType) => {
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
              })
            : bin.map((task: TaskType) => {
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

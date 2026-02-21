"use client";

import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import AddTask from "./AddTask";
import Task from "./Task";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc");
  const [bin, setBin] = useState([]);
  const [isBin, setIsBin] = useState(false);

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

  const toggleTask = async (id) => {
    const task = tasks.find((t) => t.id === id);

    try {
      const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isDone: !task.isDone }),
      });

      if (response.ok) {
        const updatedTask = await response.json();

        setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
      }
    } catch (error) {
      console.log("Toggle error: ", error);
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

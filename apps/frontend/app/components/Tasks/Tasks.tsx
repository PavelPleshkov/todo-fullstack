"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { Grid } from "@mui/material";
import { useEffect, useState } from "react";
import AddTask from "./AddTask";
import Task, { Task as TaskType } from "./Task";
import {
  ACTIVE_TASKS_QUERY,
  BIN_TASKS_QUERY,
  UPDATE_TASK_MUTATION,
} from "@/app/lib/graphql/operations";

export default function Tasks() {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [sortOrder, setSortOrder] = useState<string>("asc");
  const [bin, setBin] = useState<TaskType[]>([]);
  const [isBin, setIsBin] = useState<boolean>(false);

  const { data: activeData, refetch: refetchActive } =
    useQuery(ACTIVE_TASKS_QUERY);
  const { data: binData, refetch: refetchBin } = useQuery(BIN_TASKS_QUERY, {
    skip: !isBin,
  });

  const [updateTaskMutation] = useMutation(UPDATE_TASK_MUTATION);

  // useEffect(() => {
  //   fetch("http://localhost:3001/api/tasks")
  //     .then((res) => res.json())
  //     .then((data) => setTasks(data))
  //     .catch((err) => console.error("API error: ", err));
  // }, []);

  useEffect(() => {
    if (activeData?.activeTasks) {
      setTasks(activeData.activeTasks);
    }
  }, [activeData]);

  // useEffect(() => {
  //   if (isBin) {
  //     fetch("http://localhost:3001/api/bin")
  //       .then((res) => res.json())
  //       .then((data) => setBin(data))
  //       .catch((err) => console.log("API error: ", err));
  //   }
  // }, [isBin]);

  useEffect(() => {
    if (isBin && binData?.binTasks) {
      setBin(binData.binTasks);
    }
  }, [isBin, binData]);

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

    // try {
    //   const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
    //     method: "PUT",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ isDone: !task.isDone }),
    //   });

    //   const data = await response.json();

    //   if (response.ok && data.id !== undefined && !data.error) {
    //     setTasks((prev: TaskType[]) =>
    //       prev.map((t: TaskType) =>
    //         t.id === id ? { ...t, ...data, isDone: Boolean(data.isDone) } : t,
    //       ),
    //     );
    //   }
    // } catch (error) {
    //   console.error("Toggle error: ", error);
    // }

    try {
      await updateTaskMutation({
        variables: { id, input: { isDone: !task.isDone } },
      });

      await refetchActive();
    } catch (error) {
      console.error("Toggle error: ", error);
    }
  };

  return (
    <Grid
      container
      size={12}
      direction={"column"}
      spacing={2}
      data-testid={!isBin ? "tasks" : "bin"}
    >
      <AddTask
        tasks={tasks}
        setTasks={setTasks}
        sortTasks={sortTasks}
        sortOrder={sortOrder}
        bin={bin}
        setBin={setBin}
        isBin={isBin}
        setIsBin={setIsBin}
        refetchActive={refetchActive}
        refetchBin={refetchBin}
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
                    refetchActive={refetchActive}
                    refetchBin={refetchBin}
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
                    refetchActive={refetchActive}
                    refetchBin={refetchBin}
                  />
                );
              })}
        </ul>
      </Grid>
    </Grid>
  );
}

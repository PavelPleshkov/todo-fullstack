"use client";

// import { useMutation, useQuery } from "@apollo/client/react";
import { useQuery } from "@apollo/client/react";
import { Grid } from "@mui/material";
// import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  lazy,
  Suspense,
  useCallback,
  // useContext,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import AddTask from "./AddTask";
// import Task, { Task as TaskType } from "./Task";
import { Task as TaskType } from "./Task";
import {
  ACTIVE_TASKS_QUERY,
  BIN_TASKS_QUERY,
  // UPDATE_TASK_MUTATION,
} from "@/app/lib/graphql/operations";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";

// import { ThemeContext } from "@/app/ThemeContext";
// import Btn from "./Btn";
import Search from "./Search";

const Loading = () => {
  return <div style={{ padding: "10px 20px" }}>Loading...</div>;
};

const LoadingError = () => {
  return (
    <div style={{ color: "red", padding: "10px 20px" }}>Loading error</div>
  );
};

const EMPTY_TASKS: TaskType[] = [];

// function wait(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }
// const Task = lazy(() => wait(1000).then(() => import("./Task")));
const Task = lazy(() => import("./Task"));

export default function Tasks() {
  // const theme: string = useContext(ThemeContext);

  // const [tasks, setTasks] = useState<TaskType[]>([]);
  // const [sortOrder, setSortOrder] = useState<string>("asc");
  const [sortDirectionActive, setSortDirectionActive] = useState<
    "asc" | "desc"
  >("desc");
  const [sortDirectionBin, setSortDirectionBin] = useState<"asc" | "desc">(
    "desc",
  );
  // const [bin, setBin] = useState<TaskType[]>([]);
  const [isBin, setIsBin] = useState<boolean>(false);

  // const { data: activeData, refetch: refetchActive } =
  //   useQuery(ACTIVE_TASKS_QUERY);
  const { data: activeData } = useQuery(ACTIVE_TASKS_QUERY);
  // const tasks: TaskType[] = useMemo(
  //   () => activeData?.activeTasks ?? [],
  //   [activeData],
  // );
  // const tasks: TaskType[] = useMemo(
  //   () => activeData?.activeTasks ?? EMPTY_TASKS,
  //   [activeData],
  // );
  const tasks: TaskType[] = activeData?.activeTasks ?? EMPTY_TASKS;

  // const { data: binData, refetch: refetchBin } = useQuery(BIN_TASKS_QUERY, {
  //   skip: !isBin,
  // });
  const { data: binData } = useQuery(BIN_TASKS_QUERY, {
    skip: !isBin,
  });
  // const bin: TaskType[] = useMemo(() => binData?.binTasks ?? [], [binData]);
  // const bin: TaskType[] = useMemo(
  //   () => binData?.binTasks ?? EMPTY_TASKS,
  //   [binData],
  // );
  const bin: TaskType[] = binData?.binTasks ?? EMPTY_TASKS;

  // const [updateTaskMutation] = useMutation(UPDATE_TASK_MUTATION);

  // useEffect(() => {
  //   fetch("http://localhost:3001/api/tasks")
  //     .then((res) => res.json())
  //     .then((data) => setTasks(data))
  //     .catch((err) => console.error("API error: ", err));
  // }, []);

  // useEffect(() => {
  //   if (activeData?.activeTasks) {
  //     setTasks(activeData.activeTasks);
  //   }
  // }, [activeData]);

  // useEffect(() => {
  //   if (isBin) {
  //     fetch("http://localhost:3001/api/bin")
  //       .then((res) => res.json())
  //       .then((data) => setBin(data))
  //       .catch((err) => console.log("API error: ", err));
  //   }
  // }, [isBin]);

  // useEffect(() => {
  //   if (isBin && binData?.binTasks) {
  //     setBin(binData.binTasks);
  //   }
  // }, [isBin, binData]);

  function sortTasksByDirection(
    tasks: TaskType[],
    direction: "asc" | "desc",
  ): TaskType[] {
    return [...tasks].sort((a: TaskType, b: TaskType) =>
      direction === "asc" ? a.id - b.id : b.id - a.id,
    );
  }

  const sortDirection = isBin ? sortDirectionBin : sortDirectionActive;

  const sortTasks = useCallback(() => {
    if (isBin) {
      setSortDirectionBin((direction) =>
        direction === "asc" ? "desc" : "asc",
      );
    } else {
      setSortDirectionActive((direction) =>
        direction === "asc" ? "desc" : "asc",
      );
    }
  }, [isBin]);

  //SEARCHING

  const [searchValue, setSearchValue] = useState<string>("");

  const deferredSearchValue = useDeferredValue(searchValue);

  const showedTasks = useMemo(() => {
    const source = isBin ? bin : tasks;
    const direction = isBin ? sortDirectionBin : sortDirectionActive;
    const sorted = sortTasksByDirection(source, direction);
    const searchText = deferredSearchValue.trim().toLowerCase();

    if (!searchText) return sorted;

    return sorted.filter((task) =>
      task.text.toLowerCase().includes(searchText),
    );
  }, [
    isBin,
    bin,
    tasks,
    sortDirectionBin,
    sortDirectionActive,
    deferredSearchValue,
  ]);

  // const displayTasks: TaskType[] = useMemo(() => {
  //   const sortedTasks: TaskType[] = sortTasksByDirection(
  //     tasks,
  //     sortDirectionActive,
  //   );
  //   const searchText: string = searchValue.trim().toLowerCase();

  //   if (searchText) {
  //     return sortedTasks.filter((task: TaskType) => {
  //       return task.text.toLowerCase().includes(searchText);
  //     });
  //   }
  //   return sortedTasks;
  // }, [tasks, sortDirectionActive, searchValue]);

  // const displayBin: TaskType[] = useMemo(() => {
  //   const sortedBin: TaskType[] = sortTasksByDirection(bin, sortDirectionBin);
  //   const searchText: string = searchValue.trim().toLowerCase();

  //   if (searchText) {
  //     return sortedBin.filter((task: TaskType) => {
  //       return task.text.toLowerCase().includes(searchText);
  //     });
  //   }
  //   return sortedBin;
  // }, [bin, sortDirectionBin, searchValue]);

  // const showedTasks: TaskType[] = !isBin ? displayTasks : displayBin;

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const clearSearch = useCallback(() => {
    setSearchValue("");
  }, []);

  // const toggleTask = async (id: number) => {
  //   const task: TaskType | undefined = displayTasks.find(
  //     (t: TaskType) => t.id === id,
  //   );
  //   if (!task) return;

  //   // try {
  //   //   const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
  //   //     method: "PUT",
  //   //     headers: {
  //   //       "Content-Type": "application/json",
  //   //     },
  //   //     body: JSON.stringify({ isDone: !task.isDone }),
  //   //   });

  //   //   const data = await response.json();

  //   //   if (response.ok && data.id !== undefined && !data.error) {
  //   //     setTasks((prev: TaskType[]) =>
  //   //       prev.map((t: TaskType) =>
  //   //         t.id === id ? { ...t, ...data, isDone: Boolean(data.isDone) } : t,
  //   //       ),
  //   //     );
  //   //   }
  //   // } catch (error) {
  //   //   console.error("Toggle error: ", error);
  //   // }

  //   try {
  //     await updateTaskMutation({
  //       variables: { id, input: { isDone: !task.isDone } },
  //     });

  //     // await refetchActive();
  //   } catch (error) {
  //     console.error("Toggle error: ", error);
  //   }
  // };

  return (
    <Grid
      container
      size={12}
      direction={"column"}
      spacing={2}
      data-testid={!isBin ? "tasks" : "bin"}
    >
      <AddTask
        // tasks={tasks}
        // setTasks={setTasks}
        // searchValue={searchValue}
        isSearchActive={searchValue.trim() !== ""}
        sortTasks={sortTasks}
        sortDirection={sortDirection}
        // bin={bin}
        // setBin={setBin}
        isBin={isBin}
        setIsBin={setIsBin}
        // refetchActive={refetchActive}
        // refetchBin={refetchBin}
      />

      <Grid
        container
        direction={"column"}
        size={12}
        sx={{ paddingBottom: "20px" }}
      >
        <h1 style={{ margin: "0 10px", padding: "10px 10px" }}>
          {!isBin ? "Tasks" : bin.length ? "Bin" : "Bin is empty"}
          {/* {!isBin ? "Tasks" : displayBin.length ? "Bin" : "Bin is empty"} */}
        </h1>
        <Grid
          container
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          size={{ xs: 12, md: 10, lg: 8 }}
          sx={{
            px: "10px",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <Search
            searchValue={searchValue}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
          />
        </Grid>

        <ErrorBoundary errorComponent={() => <LoadingError />}>
          <Suspense fallback={<Loading />}>
            {showedTasks.length === 0 && deferredSearchValue.trim() !== "" ? (
              <div style={{ padding: "10px 20px" }}>
                No tasks found with {`"${deferredSearchValue}"`}
              </div>
            ) : (
              <ul>
                {showedTasks.map((task: TaskType) => {
                  return <Task task={task} key={task.id} isBin={isBin} />;
                })}
                {/* {!isBin
                ? displayTasks.map((task: TaskType) => {
                    return (
                      <Task
                        task={task}
                        // tasks={displayTasks}
                        // setTasks={setTasks}
                        // toggleTask={() => toggleTask(task.id)}
                        key={task.id}
                        // bin={displayBin}
                        // setBin={setBin}
                        isBin={isBin}
                        // refetchActive={refetchActive}
                        // refetchBin={refetchBin}
                      />
                    );
                  })
                : displayBin.map((task: TaskType) => {
                    return (
                      <Task
                        task={task}
                        // tasks={displayBin}
                        // setTasks={setTasks}
                        // toggleTask={() => toggleTask(task.id)}
                        key={task.id}
                        // bin={displayBin}
                        // setBin={setBin}
                        isBin={isBin}
                        // refetchActive={refetchActive}
                        // refetchBin={refetchBin}
                      />
                    );
                  })} */}
              </ul>
            )}
          </Suspense>
        </ErrorBoundary>
      </Grid>
    </Grid>
  );
}

"use client";

// import { useMutation, useQuery } from "@apollo/client/react";
import { useQuery } from "@apollo/client/react";
import { Grid } from "@mui/material";
import {
  lazy,
  Suspense,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from "react";
import AddTask from "./AddTask";
import Search from "./Search";
import type { Task as TaskType } from "./Task";
import {
  ACTIVE_TASKS_QUERY,
  BIN_TASKS_QUERY,
} from "@/app/lib/graphql/operations";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import { useAuth } from "@/app/AuthContext";
import Link from "next/link";

const Loading = () => {
  return <div style={{ padding: "10px 20px" }}>Loading...</div>;
};

const LoadingError = ({
  listError,
  retryList,
}: {
  listError: Error;
  retryList: () => void;
}) => {
  return (
    <div style={{ color: "red", padding: "10px 20px" }} role="alert">
      <div>Failed to load tasks.</div>
      <div style={{ margin: "8px 0" }}>{listError.message}</div>
      <button
        type="button"
        style={{
          padding: "10px 20px",
          border: "1px solid red",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={retryList}
      >
        Retry
      </button>
    </div>
  );
};

// const RenderError = () => {
//   return <div style={{ color: "red", padding: "10px 20px" }}>Render error</div>;
// };
const RenderError = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div style={{ color: "red", padding: "10px 20px" }} role="alert">
      <div>Render error</div>
      <pre style={{ margin: "8px 0" }}>{getErrorMessage(error)}</pre>
      <button
        type="button"
        style={{
          padding: "10px 20px",
          border: "1px solid red",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
};

const EMPTY_TASKS: TaskType[] = [];

const Task = lazy(() => import("./Task"));

export default function Tasks() {
  const { isAuthenticated } = useAuth();

  const [sortDirectionActive, setSortDirectionActive] = useState<
    "asc" | "desc"
  >("desc");
  const [sortDirectionBin, setSortDirectionBin] = useState<"asc" | "desc">(
    "desc",
  );

  const [isBin, setIsBin] = useState<boolean>(false);

  // const { data: activeData } = useQuery(ACTIVE_TASKS_QUERY);
  const {
    data: activeData,
    loading: activeLoading,
    error: activeError,
    refetch: refetchActive,
  } = useQuery(ACTIVE_TASKS_QUERY);
  const tasks: TaskType[] = activeData?.activeTasks ?? EMPTY_TASKS;

  // const { data: binData } = useQuery(BIN_TASKS_QUERY, {
  //   skip: !isBin,
  // });
  const {
    data: binData,
    loading: binLoading,
    error: binError,
    refetch: refetchBin,
  } = useQuery(BIN_TASKS_QUERY, {
    skip: !isBin,
  });
  const bin: TaskType[] = binData?.binTasks ?? EMPTY_TASKS;

  const listLoading = isBin ? binLoading : activeLoading;
  const listError = isBin ? binError : activeError;

  const retryList = () => {
    if (isBin) {
      refetchBin();
    } else {
      refetchActive();
    }
  };

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

  const sourceTasks = isBin ? bin : tasks;

  //SEARCH

  const [searchValue, setSearchValue] = useState<string>("");

  const deferredSearchValue = useDeferredValue(searchValue);

  const showedTasks = useMemo(() => {
    const direction = isBin ? sortDirectionBin : sortDirectionActive;
    const sorted = sortTasksByDirection(sourceTasks, direction);
    const searchText = deferredSearchValue.trim().toLowerCase();

    if (!searchText) return sorted;

    return sorted.filter((task) =>
      task.text.toLowerCase().includes(searchText),
    );
  }, [
    isBin,
    sourceTasks,
    sortDirectionBin,
    sortDirectionActive,
    deferredSearchValue,
  ]);

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

  if (!isAuthenticated) {
    return (
      <div data-testid="tasks-login-required" style={{ padding: 16 }}>
        To work with tasks -{" "}
        <Link
          href={"/login"}
          style={{ color: "blue", textDecoration: "underline" }}
        >
          login
        </Link>
      </div>
    );
  }

  return (
    <Grid
      container
      size={12}
      direction={"column"}
      spacing={2}
      data-testid={"tasks"}
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
          {!isBin ? "Tasks" : sourceTasks.length ? "Bin" : "Bin is empty"}
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
            disabled={listLoading || sourceTasks.length === 0}
            searchValue={searchValue}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
          />
        </Grid>

        <ErrorBoundary FallbackComponent={RenderError} onReset={retryList}>
          {listLoading ? (
            <div style={{ padding: "10px 20px" }}>Loading tasks...</div>
          ) : listError ? (
            <LoadingError listError={listError} retryList={retryList} />
          ) : (
            <Suspense fallback={<Loading />}>
              {showedTasks.length ? (
                <ul>
                  {showedTasks.map((task: TaskType) => {
                    return <Task task={task} key={task.id} isBin={isBin} />;
                  })}
                </ul>
              ) : sourceTasks.length === 0 ? (
                <div style={{ padding: "10px 20px" }}>No tasks found</div>
              ) : (
                deferredSearchValue.trim() !== "" && (
                  <div style={{ padding: "10px 20px" }}>
                    No tasks found with {`"${deferredSearchValue}"`}
                  </div>
                )
              )}
            </Suspense>
          )}
        </ErrorBoundary>
      </Grid>
    </Grid>
  );
}

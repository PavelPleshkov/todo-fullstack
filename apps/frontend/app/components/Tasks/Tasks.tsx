"use client";

// import { useMutation, useQuery } from "@apollo/client/react";
import { useQuery } from "@apollo/client/react";
import { Grid, Select, Stack } from "@mui/material";
import {
  lazy,
  Suspense,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
  useContext,
} from "react";
import AddTask from "./AddTask";
import Search from "./Search";
import type { Task as TaskType } from "./Task";
import {
  ACTIVE_TASKS_QUERY,
  BIN_TASKS_QUERY,
  USERS_QUERY,
} from "@/app/lib/graphql/operations";
import { canAccessUsers } from "@repo/permissions";
import { ErrorBoundary, getErrorMessage } from "react-error-boundary";
import type { FallbackProps } from "react-error-boundary";
import { useAuth } from "@/app/AuthContext";
import { ThemeContext } from "@/app/ThemeContext";
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

export type TaskScopeKey =
  | "visible"
  | "self"
  | "role:user"
  | "role:manager"
  | `user:${number}`;

export function toTaskQueryVars(
  scope: TaskScopeKey,
  viewerId: number,
): { ownerId: number | null; ownerRole: string | null } {
  if (scope === "self") {
    return { ownerId: viewerId, ownerRole: null };
  }

  if (scope === "role:user" || scope === "role:manager") {
    return {
      ownerId: null,
      ownerRole: scope === "role:user" ? "user" : "manager",
    };
  }

  if (scope.startsWith("user:")) {
    return { ownerId: Number(scope.slice("user:".length)), ownerRole: null };
  }

  return { ownerId: null, ownerRole: null };
}

function newTaskForLabel(
  scope: TaskScopeKey,
  people: { id: number; email: string; deletedAt?: string | null }[],
): string {
  if (!scope.startsWith("user:")) {
    return "you";
  }

  const id = Number(scope.slice("user:".length));
  const row = people.find((person) => person.id === id);

  if (!row) return "you";

  return row.deletedAt ? `${row.email} (deleted)` : row.email;
}

export default function Tasks() {
  const { isAuthenticated, user } = useAuth();
  const theme = useContext(ThemeContext);

  const [taskScope, setTaskScope] = useState<TaskScopeKey>("visible");

  const taskQueryVars = toTaskQueryVars(taskScope, user?.id ?? 0);

  const canPickScope = Boolean(user && canAccessUsers(user));
  const { data: usersData } = useQuery(USERS_QUERY, {
    skip: !isAuthenticated || !canPickScope,
  });
  const people = usersData?.users ?? [];
  const managers = people.filter((person) => person.role === "manager");
  const users = people.filter((person) => person.role === "user");

  const [sortDirectionActive, setSortDirectionActive] = useState<
    "asc" | "desc"
  >("desc");
  const [sortDirectionBin, setSortDirectionBin] = useState<"asc" | "desc">(
    "desc",
  );

  const [isBin, setIsBin] = useState<boolean>(false);

  // User-clicked/selected task ids. May still contain tasks that were already deleted
  const [selectedIdsRaw, setSelectedIdsRaw] = useState<number[]>([]);

  const handleSelectTask = (task: TaskType) => {
    setSelectedIdsRaw((prev) =>
      prev.includes(task.id)
        ? prev.filter((id) => id !== task.id)
        : [...prev, task.id],
    );
  };

  const {
    data: activeData,
    loading: activeLoading,
    error: activeError,
    refetch: refetchActive,
  } = useQuery(ACTIVE_TASKS_QUERY, {
    skip: !isAuthenticated,
    variables: taskQueryVars,
    fetchPolicy: "cache-and-network",
  });

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
    skip: !isAuthenticated || !isBin,
    variables: taskQueryVars,
    fetchPolicy: "cache-and-network",
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

  // Ids that exist in the current list (active or bin).
  const sourceIdSet = useMemo(
    () => new Set(sourceTasks.map((task) => task.id)),
    [sourceTasks],
  );

  // What UI and children use: selection minus ids that are no longer in the list.
  const selectedIds = selectedIdsRaw.filter((id) => sourceIdSet.has(id));

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
    <Stack direction={"column"} spacing={2} data-testid={"tasks"}>
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
        canPickScope={canPickScope}
        // taskScope={taskScope}
        people={people}
        taskQueryVars={taskQueryVars}
        newTaskFor={newTaskForLabel(taskScope, people)}
        selectedIds={selectedIds}
        setSelectedIdsRaw={setSelectedIdsRaw}
        showedTasksIds={showedTasks.map((task) => task.id)}
        // refetchActive={refetchActive}
        // refetchBin={refetchBin}
      />

      <Stack direction={"column"} spacing={2} sx={{ padding: "0px 20px 30px" }}>
        {canPickScope && (
          <Select
            native
            value={taskScope}
            onChange={(event) => {
              setSelectedIdsRaw([]);
              setTaskScope(event.target.value as TaskScopeKey);
            }}
            inputProps={{ "aria-label": "Whose tasks" }}
            sx={{
              color: "inherit",
              // margin: "0px 10px",
              width: { xs: "calc(100% - 20px)", sm: "fit-content" },
              // width: "fit-content",
              // "& .MuiNativeSelect-select": { color: "inherit" },
              "& .MuiSvgIcon-root": { color: "inherit" },
              "& option": {
                color: "#1d1d1d",
                backgroundColor: "#ffffff",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1d1d1d",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#1d1d1d",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor:
                  theme === "dark" ? "var(--foreground)" : "var(--background)",
                borderWidth: "2px",
              },
              "& .MuiNativeSelect-select:focus": {
                backgroundColor: "transparent",
              },
            }}
          >
            <option value="self">My tasks</option>
            <option value="visible">All tasks</option>

            {user?.role === "admin" && (
              <optgroup label="Managers">
                <option value="role:manager">All managers</option>
                {managers.map((row) => (
                  <option key={row.id} value={`user:${row.id}`}>
                    {row.deletedAt ? `${row.email} (deleted)` : row.email}
                  </option>
                ))}
              </optgroup>
            )}

            <optgroup label="Users">
              <option value="role:user">All users</option>
              {users.map((row) => (
                <option key={row.id} value={`user:${row.id}`}>
                  {row.deletedAt ? `${row.email} (deleted)` : row.email}
                </option>
              ))}
            </optgroup>
          </Select>
        )}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          // padding={"10px"}
        >
          <h1>
            {!isBin
              ? deferredSearchValue.trim() === ""
                ? selectedIds.length === 0
                  ? `Tasks (${showedTasks.length})`
                  : `Tasks (${showedTasks.length}, ${selectedIds.length} selected)`
                : selectedIds.length === 0
                  ? `Tasks (${showedTasks.length} of ${sourceTasks.length})`
                  : `Tasks (${showedTasks.length} of ${sourceTasks.length}, ${selectedIds.length} selected)`
              : sourceTasks.length === 0
                ? "Bin is empty"
                : deferredSearchValue.trim() === ""
                  ? `Bin (${showedTasks.length})`
                  : `Bin (${showedTasks.length} of ${sourceTasks.length})`}
          </h1>
          {/* <h1 style={{ margin: "0 10px", padding: "10px 0px" }}>
            {!isBin
              ? `Tasks (${showedTasks.length})`
              : sourceTasks.length === 0
                ? "Bin is empty"
                : `Bin (${showedTasks.length})`}
          </h1> */}

          <div>
            Source tasks: {sourceTasks.length}
            {/* , showed tasks:{" "} {showedTasks.length}, selected tasks: {selectedIds.length} */}
          </div>
          <div>
            {/* Source tasks: {sourceTasks.length},  */}
            Showed tasks: {showedTasks.length}
            {/* , selected tasks: {selectedIds.length} */}
          </div>
          <div>
            {/* Source tasks: {sourceTasks.length}, showed tasks:{" "}
            {showedTasks.length},  */}
            Selected tasks: {selectedIds.length}
          </div>
        </Stack>

        <Grid
          container
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          spacing={2}
          size={{ xs: 12, md: 10, lg: 8 }}
          sx={{
            // px: "10px",
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
                  <Stack direction={"column"} spacing={2}>
                    {showedTasks.map((task: TaskType) => {
                      return (
                        <Task
                          task={task}
                          key={task.id}
                          isBin={isBin}
                          taskQueryVars={taskQueryVars}
                          isSelected={selectedIds.includes(task.id)}
                          handleSelectTask={handleSelectTask}
                        />
                      );
                    })}
                  </Stack>
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
      </Stack>
    </Stack>
  );
}

"use client";

import { Delete } from "@mui/icons-material";
import { Grid } from "@mui/material";
import { useContext, useState, memo } from "react";

import Btn from "./Btn";
import { ThemeContext } from "@/app/ThemeContext";
import { useAuth } from "@/app/AuthContext";

// import { useApolloClient, useMutation } from "@apollo/client/react";
import { useApolloClient } from "@apollo/client/react";
import {
  MOVE_TO_BIN_MUTATION,
  MOVE_TO_ACTIVE_MUTATION,
  PERMANENTLY_DELETE_MUTATION,
  UPDATE_TASK_MUTATION,
  ACTIVE_TASKS_QUERY,
  BIN_TASKS_QUERY,
} from "@/app/lib/graphql/operations";

export interface Task {
  id: number;
  text: string;
  isDone: boolean;
  date: string;
}

export interface TaskProps {
  task: Task;
  // tasks: Task[];
  // setTasks: (tasks: Task[]) => void;
  // toggleTask?: (id: number) => void;
  // bin: Task[];
  // setBin: (bin: Task[]) => void;
  isBin: boolean;
  // refetchActive: () => Promise<unknown>;
  // refetchBin: () => Promise<unknown>;
}

const Task = memo(function Task({
  task,
  // tasks,
  // setTasks,
  // toggleTask,
  // bin,
  // setBin,
  isBin,
  // refetchActive,
  // refetchBin,
}: TaskProps): React.ReactNode {
  const [selfText, setSelfText] = useState(task.text);
  const [isEditable, setIsEditable] = useState(false);

  const theme = useContext(ThemeContext);

  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // const [updateTaskMut] = useMutation(UPDATE_TASK_MUTATION);
  // const [moveToBinMut] = useMutation(MOVE_TO_BIN_MUTATION);
  // const [permanentlyDeleteMut] = useMutation(PERMANENTLY_DELETE_MUTATION);

  //to prevent re-rendering because of the useMutation hook
  const client = useApolloClient();

  const toggleTask = async () => {
    if (isBin) return;
    await client.mutate({
      mutation: UPDATE_TASK_MUTATION,
      variables: {
        id: task.id,
        input: { isDone: !task.isDone },
      },
    });
  };

  const saveTask = async (id: number) => {
    if (isEditable) {
      // try {
      //   const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ text: selfText }),
      //   });

      //   if (response.ok) {
      //     const updatedTask = await response.json();

      //     setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
      //   }
      // } catch (error) {
      //   console.log("Edit error: ", error);
      // }

      try {
        // const { data } = await updateTaskMut({
        //   variables: { id, input: { text: selfText } },
        // });
        // await updateTaskMut({ variables: { id, input: { text: selfText } } });
        await client.mutate({
          mutation: UPDATE_TASK_MUTATION,
          variables: { id, input: { text: selfText } },
          refetchQueries: [{ query: ACTIVE_TASKS_QUERY }],
        });
        // await updateTaskMut({ variables: { id, input: { text: selfText } } });

        // if (data?.updateTask) {
        //   // setTasks(
        //   //   tasks.map((task) => (task.id === id ? data.updateTask : task)),
        //   // );
        // await refetchActive();
        // }
      } catch (error) {
        console.log("Edit error: ", error);
      }
    }
    setIsEditable((prev) => !prev);
  };

  const deleteTask = async (id: number) => {
    if (!isBin) {
      //   try {
      //     const response = await fetch(`http://localhost:3001/api/bin/${id}`, {
      //       method: "POST",
      //     });

      //     if (response.ok) {
      //       setTasks(tasks.filter((t) => t.id !== id));
      //       setBin([task, ...bin]);
      //     }
      //   } catch (error) {
      //     console.log("Delete error: ", error);
      //   }
      // } else {
      //   const response = await fetch(`http://localhost:3001/api/bin/${id}`, {
      //     method: "DELETE",
      //   });

      //   if (response.ok) {
      //     setBin(bin.filter((t) => t.id !== id));
      //   }
      // }

      try {
        // const { data } = await moveToBinMut({ variables: { id } });
        // await moveToBinMut({ variables: { id } });
        await client.mutate({
          mutation: MOVE_TO_BIN_MUTATION,
          variables: { id },
          refetchQueries: [
            { query: ACTIVE_TASKS_QUERY },
            { query: BIN_TASKS_QUERY },
          ],
        });
        // if (data?.moveTaskToBin) {
        //   // setTasks(tasks.filter((task) => task.id !== id));
        //   // setBin([task, ...bin]);
        // await refetchActive();
        // await refetchBin();
        // }
      } catch (error) {
        console.log("Delete error: ", error);
      }
    } else {
      try {
        // const { data } = await permanentlyDeleteMut({ variables: { id } });
        // await permanentlyDeleteMut({ variables: { id } });
        if (confirm("Are you sure you want to delete this task?")) {
          await client.mutate({
            mutation: PERMANENTLY_DELETE_MUTATION,
            variables: { id },
            refetchQueries: [{ query: BIN_TASKS_QUERY }],
          });
          // if (data?.permanentlyDeleteTask) {
          //   // setBin(bin.filter((task) => task.id !== id));
          // await refetchBin();
          // }
        }
      } catch (error) {
        console.log("Delete error: ", error);
      }
    }
  };

  const restoreTaskFromBin = async (id: number) => {
    try {
      await client.mutate({
        mutation: MOVE_TO_ACTIVE_MUTATION,
        variables: { id },
        refetchQueries: [
          { query: ACTIVE_TASKS_QUERY },
          { query: BIN_TASKS_QUERY },
        ],
      });
    } catch (error) {
      console.log("Restore error: ", error);
    }
  };

  return (
    <li style={{ padding: "5px 10px" }} data-testid="task">
      <Grid container spacing={2} size={12} direction={"row"}>
        <Grid size={{ xs: 9, lg: 8 }}>
          {!isEditable ? (
            <label
              className={isBin ? "" : "task-label"}
              title={
                isBin
                  ? "Can't edit in bin"
                  : task.isDone
                    ? "Set as incomplete"
                    : "Set as complete"
              }
              style={{
                display: "block",
                position: "relative",
                // backgroundColor: task.isDone ? "transparent" : "#363636",
                border: "1px solid rgba(29, 29, 29, 0.24)",
                borderRadius: "5px",
                width: "100%",
                height: "100%",
                padding: "10px 30px 10px 20px",
                // overflow: "hidden",
                // boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                opacity: isBin || task.isDone ? ".7" : "1",
                cursor: isBin ? "not-allowed" : "pointer",
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
                    // key={task.isDone ? "checked" : "unchecked"}
                    id={task.id.toString()}
                    type="checkbox"
                    disabled={isBin}
                    checked={task.isDone}
                    // onChange={() =>
                    //   toggleTask ? toggleTask(task.id) : undefined
                    // }
                    onChange={() => toggleTask()}
                    style={{
                      accentColor: theme === "dark" ? "#69696950" : "#994747",
                      display: "block",
                      // display: "none",
                      position: "absolute",
                      right: "0",
                      top: "0",
                      margin: "10px",
                      cursor: isBin ? "not-allowed" : "pointer",
                    }}
                  />
                </Grid>
                <Grid>
                  <div>{task.date}</div>
                  <div
                    style={{
                      whiteSpace: "pre-wrap",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical",
                      WebkitLineClamp: "4",
                    }}
                  >
                    <b>{selfText}</b>
                  </div>
                </Grid>
              </Grid>
            </label>
          ) : (
            <textarea
              className={isBin ? "" : "task-textarea"}
              id={task.id.toString()}
              // type="text"
              rows={5}
              value={selfText}
              autoFocus={isEditable}
              // onKeyDown={(e) => {
              //   if (e.key === "Enter") {
              //     saveTask(task.id);
              //   }
              // }}
              // onBlur={() => {
              // saveTask(task.id);
              // }}
              onFocus={(e) => {
                e.target.setSelectionRange(
                  e.target.value.length,
                  e.target.value.length,
                );
                e.target.scrollTo({
                  top: e.target.scrollHeight,
                  behavior: "smooth",
                });
              }}
              onChange={(e) => {
                setSelfText(e.target.value);

                // setTasks(
                //   tasks.map((t) => {
                //     if (t.id === +e.target.id) {
                //       return { ...t, text: e.target.value };
                //     } else {
                //       return t;
                //     }
                //   }),
                // );
              }}
              style={{
                width: "100%",
                backgroundColor: theme === "dark" ? "#363636" : "#ffffff",
                outlineColor: "#1d1d1d",
                padding: "10px 30px 10px 20px",
                resize: "vertical",
                minHeight: "content-fit",
              }}
            />
          )}
        </Grid>
        <Grid container direction={"row"} size={{ xs: 3, lg: 4 }} spacing={2}>
          <Grid>
            {!isBin ? (
              <Btn
                title="Move to bin"
                onClick={() => deleteTask(task.id)}
                variant="contained"
              >
                <Delete />
              </Btn>
            ) : (
              isAdmin && (
                <Btn
                  title="Delete"
                  onClick={() => deleteTask(task.id)}
                  variant="contained"
                >
                  <Delete />
                </Btn>
              )
            )}

            {/* <Btn
              title={isBin ? "Delete" : "Move to bin"}
              onClick={() => deleteTask(task.id)}
              variant="contained"
            >
              <Delete />
            </Btn> */}
          </Grid>
          <Grid>
            {/* <Btn
              disabled={isBin || task.isDone}
              variant="contained"
              onClick={() => {
                if (isEditable) {
                  saveTask(task.id);
                } else {
                  setIsEditable(true);
                }
              }}
            >
              {isEditable ? "Save" : "Edit"}
            </Btn> */}
            {isBin ? (
              <Btn
                title="Restore from bin"
                variant="contained"
                onClick={() => restoreTaskFromBin(task.id)}
              >
                Restore
              </Btn>
            ) : (
              <Btn
                title={isEditable ? "Save task" : "Edit task"}
                disabled={isBin || task.isDone}
                variant="contained"
                onClick={() => {
                  if (isEditable) {
                    saveTask(task.id);
                  } else {
                    setIsEditable(true);
                  }
                }}
              >
                {isEditable ? "Save" : "Edit"}
              </Btn>
            )}
          </Grid>
        </Grid>
      </Grid>
    </li>
  );
});

export default Task;
// export default function Task({
//   task,
//   // tasks,
//   // setTasks,
//   toggleTask,
//   // bin,
//   // setBin,
//   isBin,
//   refetchActive,
//   refetchBin,
// }: TaskProps): React.ReactNode {
//   const [selfText, setSelfText] = useState(task.text);
//   const [isEditable, setIsEditable] = useState(false);

//   const theme = useContext(ThemeContext);

//   const [updateTaskMut] = useMutation(UPDATE_TASK_MUTATION);
//   const [moveToBinMut] = useMutation(MOVE_TO_BIN_MUTATION);
//   const [permanentlyDeleteMut] = useMutation(PERMANENTLY_DELETE_MUTATION);

//   const saveTask = async (id: number) => {
//     if (isEditable) {
//       // try {
//       //   const response = await fetch(`http://localhost:3001/api/tasks/${id}`, {
//       //     method: "PUT",
//       //     headers: {
//       //       "Content-Type": "application/json",
//       //     },
//       //     body: JSON.stringify({ text: selfText }),
//       //   });

//       //   if (response.ok) {
//       //     const updatedTask = await response.json();

//       //     setTasks(tasks.map((t) => (t.id === id ? updatedTask : t)));
//       //   }
//       // } catch (error) {
//       //   console.log("Edit error: ", error);
//       // }
//       try {
//         const { data } = await updateTaskMut({
//           variables: { id, input: { text: selfText } },
//         });

//         if (data?.updateTask) {
//           // setTasks(
//           //   tasks.map((task) => (task.id === id ? data.updateTask : task)),
//           // );
//           await refetchActive();
//         }
//       } catch (error) {
//         console.log("Edit error: ", error);
//       }
//     }
//     setIsEditable((prev) => !prev);
//   };

//   const deleteTask = async (id: number) => {
//     if (!isBin) {
//       //   try {
//       //     const response = await fetch(`http://localhost:3001/api/bin/${id}`, {
//       //       method: "POST",
//       //     });

//       //     if (response.ok) {
//       //       setTasks(tasks.filter((t) => t.id !== id));
//       //       setBin([task, ...bin]);
//       //     }
//       //   } catch (error) {
//       //     console.log("Delete error: ", error);
//       //   }
//       // } else {
//       //   const response = await fetch(`http://localhost:3001/api/bin/${id}`, {
//       //     method: "DELETE",
//       //   });

//       //   if (response.ok) {
//       //     setBin(bin.filter((t) => t.id !== id));
//       //   }
//       // }

//       try {
//         const { data } = await moveToBinMut({ variables: { id } });
//         if (data?.moveTaskToBin) {
//           // setTasks(tasks.filter((task) => task.id !== id));
//           // setBin([task, ...bin]);
//           await refetchActive();
//           await refetchBin();
//         }
//       } catch (error) {
//         console.log("Delete error: ", error);
//       }
//     } else {
//       try {
//         const { data } = await permanentlyDeleteMut({ variables: { id } });
//         if (data?.permanentlyDeleteTask) {
//           // setBin(bin.filter((task) => task.id !== id));
//           await refetchBin();
//         }
//       } catch (error) {
//         console.log("Delete error: ", error);
//       }
//     }
//   };

//   return (
//     <li style={{ padding: "5px 10px" }} data-testid="task">
//       <Grid container spacing={2} size={12} direction={"row"}>
//         <Grid size={{ xs: 9, md: 6 }}>
//           {!isEditable ? (
//             <label
//               className={isBin ? "" : "task-label"}
//               title={isBin ? "Can't edit in bin" : "Click to edit"}
//               style={{
//                 display: "block",
//                 position: "relative",
//                 // backgroundColor: task.isDone ? "transparent" : "#363636",
//                 border: "1px solid rgba(29, 29, 29, 0.24)",
//                 borderRadius: "5px",
//                 width: "100%",
//                 height: "100%",
//                 padding: "10px 30px 10px 20px",
//                 // overflow: "hidden",
//                 // boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
//                 opacity: isBin || task.isDone ? ".7" : "1",
//                 cursor: isBin ? "not-allowed" : "pointer",
//               }}
//             >
//               <Grid
//                 container
//                 size={12}
//                 direction={"row"}
//                 wrap="nowrap"
//                 alignItems={"center"}
//               >
//                 <Grid direction={"row"}>
//                   <input
//                     key={task.isDone ? "checked" : "unchecked"}
//                     id={task.id.toString()}
//                     type="checkbox"
//                     disabled={isBin}
//                     checked={task.isDone}
//                     onChange={() =>
//                       toggleTask ? toggleTask(task.id) : undefined
//                     }
//                     style={{
//                       display: "block",
//                       // display: "none",
//                       position: "absolute",
//                       right: "0",
//                       top: "0",
//                       margin: "10px",
//                       cursor: isBin ? "not-allowed" : "pointer",
//                     }}
//                   />
//                 </Grid>
//                 <Grid>
//                   <div>{task.date}</div>
//                   <div
//                   // style={{
//                   //   overflow: "hidden",
//                   // }}
//                   >
//                     <b>{selfText}</b>
//                   </div>
//                 </Grid>
//               </Grid>
//             </label>
//           ) : (
//             <input
//               className={isBin ? "" : "task-input"}
//               id={task.id.toString()}
//               type="text"
//               value={selfText}
//               autoFocus={isEditable}
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") {
//                   saveTask(task.id);
//                 }
//               }}
//               onChange={(e) => {
//                 setSelfText(e.target.value);
//                 // setTasks(
//                 //   tasks.map((t) => {
//                 //     if (t.id === +e.target.id) {
//                 //       return { ...t, text: e.target.value };
//                 //     } else {
//                 //       return t;
//                 //     }
//                 //   }),
//                 // );
//               }}
//               style={{
//                 width: "100%",
//                 backgroundColor: theme === "dark" ? "#363636" : "#ffffff",
//                 outlineColor: "#1d1d1d",
//                 padding: "5px",
//               }}
//             />
//           )}
//         </Grid>
//         <Grid container direction={"row"} size={{ xs: 3, md: 6 }} spacing={2}>
//           <Grid>
//             <Btn
//               title={isBin ? "Delete" : "Move to bin"}
//               onClick={() => deleteTask(task.id)}
//               variant="contained"
//             >
//               <Delete />
//             </Btn>
//           </Grid>
//           <Grid>
//             <Btn
//               disabled={isBin || task.isDone}
//               variant="contained"
//               onClick={() => saveTask(task.id)}
//             >
//               {isEditable ? "Save" : "Edit"}
//             </Btn>
//           </Grid>
//         </Grid>
//       </Grid>
//     </li>
//   );
// }

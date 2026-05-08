//with codegen
export {
  ActiveTasksDocument as ACTIVE_TASKS_QUERY,
  BinTasksDocument as BIN_TASKS_QUERY,
  CreateTaskDocument as CREATE_TASK_MUTATION,
  UpdateTaskDocument as UPDATE_TASK_MUTATION,
  MoveTaskToBinDocument as MOVE_TO_BIN_MUTATION,
  PermanentlyDeleteTaskDocument as PERMANENTLY_DELETE_MUTATION,
  MoveCompletedToBinDocument as MOVE_COMPLETED_MUTATION,
  MarkAllActiveTasksDocument as MARK_ALL_MUTATION,
  UnmarkAllActiveTasksDocument as UNMARK_ALL_MUTATION,
} from "./generated/graphql";

export type {
  ActiveTasksQuery,
  BinTasksQuery,
  CreateTaskMutation,
  CreateTaskMutationVariables,
  UpdateTaskMutation,
  UpdateTaskMutationVariables,
  MoveTaskToBinMutation,
  PermanentlyDeleteTaskMutation,
  MoveCompletedToBinMutation,
  MarkAllActiveTasksMutation,
  UnmarkAllActiveTasksMutation,
  Task as GqlTask,
} from "./generated/graphql";

// import { gql } from "@apollo/client";

// export const ACTIVE_TASKS_QUERY = gql`
//   query ActiveTasks {
//     activeTasks {
//       id
//       text
//       isDone
//       date
//     }
//   }
// `;

// export const BIN_TASKS_QUERY = gql`
//   query BinTasks {
//     binTasks {
//       id
//       text
//       isDone
//       date
//     }
//   }
// `;

// export const CREATE_TASK_MUTATION = gql`
//   mutation CreateTask($input: CreateTaskInput!) {
//     createTask(input: $input) {
//       id
//       text
//       isDone
//       date
//     }
//   }
// `;

// export const UPDATE_TASK_MUTATION = gql`
//   mutation UpdateTask($id: Int!, $input: UpdateTaskInput!) {
//     updateTask(id: $id, input: $input) {
//       id
//       text
//       isDone
//       date
//     }
//   }
// `;

// export const MOVE_TO_BIN_MUTATION = gql`
//   mutation MoveTaskToBin($id: Int!) {
//     moveTaskToBin(id: $id) {
//       id
//       text
//       isDone
//       date
//     }
//   }
// `;

// export const PERMANENTLY_DELETE_MUTATION = gql`
//   mutation PermanentlyDeleteTask($id: Int!) {
//     permanentlyDeleteTask(id: $id)
//   }
// `;

// export const MOVE_COMPLETED_MUTATION = gql`
//   mutation MoveCompletedToBin {
//     moveCompletedToBin {
//       moved {
//         id
//         text
//         isDone
//         date
//       }
//       tasks {
//         id
//         text
//         isDone
//         date
//       }
//     }
//   }
// `;

// export const MARK_ALL_MUTATION = gql`
//   mutation MarkAllActiveTasks {
//     markAllActiveTasks {
//       id
//       text
//       isDone
//       date
//     }
//   }
// `;

// export const UNMARK_ALL_MUTATION = gql`
//   mutation UnmarkAllActiveTasks {
//     unmarkAllActiveTasks {
//       id
//       text
//       isDone
//       date
//     }
//   }
// `;

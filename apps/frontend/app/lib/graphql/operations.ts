//with codegen
// export {
//   ActiveTasksDocument as ACTIVE_TASKS_QUERY,
//   BinTasksDocument as BIN_TASKS_QUERY,
//   CreateTaskDocument as CREATE_TASK_MUTATION,
//   UpdateTaskDocument as UPDATE_TASK_MUTATION,
//   MoveTaskToBinDocument as MOVE_TO_BIN_MUTATION,
//   MoveTaskToActiveDocument as MOVE_TO_ACTIVE_MUTATION,
//   PermanentlyDeleteTaskDocument as PERMANENTLY_DELETE_MUTATION,
//   MoveCompletedToBinDocument as MOVE_COMPLETED_MUTATION,
//   MarkAllActiveTasksDocument as MARK_ALL_MUTATION,
//   UnmarkAllActiveTasksDocument as UNMARK_ALL_MUTATION,
// } from "./generated/graphql";

import { graphql } from "./generated/gql";

export const LOGIN_MUTATION = graphql(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
        role
        createdAt
      }
    }
  }
`);

export const REGISTER_MUTATION = graphql(`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        email
        role
        createdAt
      }
    }
  }
`);

export const DELETE_USER_MUTATION = graphql(`
  mutation DeleteUser($id: Int!) {
    deleteUser(id: $id) {
      id
      email
      role
      createdAt
      deletedAt
    }
  }
`);

export const RESTORE_USER_MUTATION = graphql(`
  mutation RestoreUser($id: Int!) {
    restoreUser(id: $id) {
      id
      email
      role
      createdAt
      deletedAt
    }
  }
`);

export const USERS_QUERY = graphql(`
  query Users {
    users {
      id
      email
      role
      createdAt
      deletedAt
    }
  }
`);

export const ACTIVE_TASKS_QUERY = graphql(`
  query ActiveTasks {
    activeTasks {
      id
      text
      isDone
      date
      userId
      ownerEmail
      ownerDeleted
    }
  }
`);

export const BIN_TASKS_QUERY = graphql(`
  query BinTasks {
    binTasks {
      id
      text
      isDone
      date
      userId
      ownerEmail
      ownerDeleted
    }
  }
`);

export const CREATE_TASK_MUTATION = graphql(`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      text
      isDone
      date
      userId
      ownerEmail
      ownerDeleted
    }
  }
`);

export const UPDATE_TASK_MUTATION = graphql(`
  mutation UpdateTask($id: Int!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      text
      isDone
      date
      userId
      ownerEmail
      ownerDeleted
    }
  }
`);

export const MOVE_TO_BIN_MUTATION = graphql(`
  mutation MoveTaskToBin($id: Int!) {
    moveTaskToBin(id: $id) {
      id
      text
      isDone
      date
    }
  }
`);

export const MOVE_TO_ACTIVE_MUTATION = graphql(`
  mutation MoveTaskToActive($id: Int!) {
    moveTaskToActive(id: $id) {
      id
      text
      isDone
      date
      userId
      ownerEmail
      ownerDeleted
    }
  }
`);

export const PERMANENTLY_DELETE_MUTATION = graphql(`
  mutation PermanentlyDeleteTask($id: Int!) {
    permanentlyDeleteTask(id: $id)
  }
`);

export const MOVE_COMPLETED_MUTATION = graphql(`
  mutation MoveCompletedToBin {
    moveCompletedToBin {
      moved {
        id
        text
        isDone
        date
        userId
        ownerEmail
        ownerDeleted
      }
      tasks {
        id
        text
        isDone
        date
        userId
        ownerEmail
        ownerDeleted
      }
    }
  }
`);

export const MARK_ALL_MUTATION = graphql(`
  mutation MarkAllActiveTasks {
    markAllActiveTasks {
      id
      text
      isDone
      date
      userId
      ownerEmail
      ownerDeleted
    }
  }
`);

export const UNMARK_ALL_MUTATION = graphql(`
  mutation UnmarkAllActiveTasks {
    unmarkAllActiveTasks {
      id
      text
      isDone
      date
      userId
      ownerEmail
      ownerDeleted
    }
  }
`);

export type {
  UsersQuery,
  DeleteUserMutation,
  RestoreUserMutation,
  ActiveTasksQuery,
  BinTasksQuery,
  CreateTaskMutation,
  CreateTaskMutationVariables,
  UpdateTaskMutation,
  UpdateTaskMutationVariables,
  MoveTaskToBinMutation,
  MoveTaskToActiveMutation,
  PermanentlyDeleteTaskMutation,
  MoveCompletedToBinMutation,
  MarkAllActiveTasksMutation,
  UnmarkAllActiveTasksMutation,
  Task as GqlTask,
} from "./generated/graphql";

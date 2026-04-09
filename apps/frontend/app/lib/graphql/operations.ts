import { gql } from "@apollo/client";

export const ACTIVE_TASKS_QUERY = gql`
  query ActiveTasks {
    activeTasks {
      id
      text
      isDone
      date
    }
  }
`;

export const BIN_TASKS_QUERY = gql`
  query BinTasks {
    binTasks {
      id
      text
      isDone
      date
    }
  }
`;

export const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      text
      isDone
      date
    }
  }
`;

export const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($id: Int!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      text
      isDone
      date
    }
  }
`;

export const MOVE_TO_BIN_MUTATION = gql`
  mutation MoveTaskToBin($id: Int!) {
    moveTaskToBin(id: $id) {
      id
      text
      isDone
      date
    }
  }
`;

export const PERMANENTLY_DELETE_MUTATION = gql`
  mutation PermanentlyDeleteTask($id: Int!) {
    permanentlyDeleteTask(id: $id)
  }
`;

export const MOVE_COMPLETED_MUTATION = gql`
  mutation MoveCompletedToBin {
    moveCompletedToBin {
      moved {
        id
        text
        isDone
        date
      }
      tasks {
        id
        text
        isDone
        date
      }
    }
  }
`;

export const MARK_ALL_MUTATION = gql`
  mutation MarkAllActiveTasks {
    markAllActiveTasks {
      id
      text
      isDone
      date
    }
  }
`;

export const UNMARK_ALL_MUTATION = gql`
  mutation UnmarkAllActiveTasks {
    unmarkAllActiveTasks {
      id
      text
      isDone
      date
    }
  }
`;

/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        id\n        email\n        role\n      }\n    }\n  }\n": typeof types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      user {\n        id\n        email\n        role\n      }\n    }\n  }\n": typeof types.RegisterDocument,
    "\n  query ActiveTasks {\n    activeTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": typeof types.ActiveTasksDocument,
    "\n  query BinTasks {\n    binTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": typeof types.BinTasksDocument,
    "\n  mutation CreateTask($input: CreateTaskInput!) {\n    createTask(input: $input) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": typeof types.CreateTaskDocument,
    "\n  mutation UpdateTask($id: Int!, $input: UpdateTaskInput!) {\n    updateTask(id: $id, input: $input) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": typeof types.UpdateTaskDocument,
    "\n  mutation MoveTaskToBin($id: Int!) {\n    moveTaskToBin(id: $id) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": typeof types.MoveTaskToBinDocument,
    "\n  mutation MoveTaskToActive($id: Int!) {\n    moveTaskToActive(id: $id) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": typeof types.MoveTaskToActiveDocument,
    "\n  mutation PermanentlyDeleteTask($id: Int!) {\n    permanentlyDeleteTask(id: $id)\n  }\n": typeof types.PermanentlyDeleteTaskDocument,
    "\n  mutation MoveCompletedToBin {\n    moveCompletedToBin {\n      moved {\n        id\n        text\n        isDone\n        date\n      }\n      tasks {\n        id\n        text\n        isDone\n        date\n      }\n    }\n  }\n": typeof types.MoveCompletedToBinDocument,
    "\n  mutation MarkAllActiveTasks {\n    markAllActiveTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": typeof types.MarkAllActiveTasksDocument,
    "\n  mutation UnmarkAllActiveTasks {\n    unmarkAllActiveTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": typeof types.UnmarkAllActiveTasksDocument,
};
const documents: Documents = {
    "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        id\n        email\n        role\n      }\n    }\n  }\n": types.LoginDocument,
    "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      user {\n        id\n        email\n        role\n      }\n    }\n  }\n": types.RegisterDocument,
    "\n  query ActiveTasks {\n    activeTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": types.ActiveTasksDocument,
    "\n  query BinTasks {\n    binTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": types.BinTasksDocument,
    "\n  mutation CreateTask($input: CreateTaskInput!) {\n    createTask(input: $input) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": types.CreateTaskDocument,
    "\n  mutation UpdateTask($id: Int!, $input: UpdateTaskInput!) {\n    updateTask(id: $id, input: $input) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": types.UpdateTaskDocument,
    "\n  mutation MoveTaskToBin($id: Int!) {\n    moveTaskToBin(id: $id) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": types.MoveTaskToBinDocument,
    "\n  mutation MoveTaskToActive($id: Int!) {\n    moveTaskToActive(id: $id) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": types.MoveTaskToActiveDocument,
    "\n  mutation PermanentlyDeleteTask($id: Int!) {\n    permanentlyDeleteTask(id: $id)\n  }\n": types.PermanentlyDeleteTaskDocument,
    "\n  mutation MoveCompletedToBin {\n    moveCompletedToBin {\n      moved {\n        id\n        text\n        isDone\n        date\n      }\n      tasks {\n        id\n        text\n        isDone\n        date\n      }\n    }\n  }\n": types.MoveCompletedToBinDocument,
    "\n  mutation MarkAllActiveTasks {\n    markAllActiveTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": types.MarkAllActiveTasksDocument,
    "\n  mutation UnmarkAllActiveTasks {\n    unmarkAllActiveTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n": types.UnmarkAllActiveTasksDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        id\n        email\n        role\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Login($input: LoginInput!) {\n    login(input: $input) {\n      accessToken\n      user {\n        id\n        email\n        role\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      user {\n        id\n        email\n        role\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation Register($input: RegisterInput!) {\n    register(input: $input) {\n      accessToken\n      user {\n        id\n        email\n        role\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query ActiveTasks {\n    activeTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"): (typeof documents)["\n  query ActiveTasks {\n    activeTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  query BinTasks {\n    binTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"): (typeof documents)["\n  query BinTasks {\n    binTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation CreateTask($input: CreateTaskInput!) {\n    createTask(input: $input) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"): (typeof documents)["\n  mutation CreateTask($input: CreateTaskInput!) {\n    createTask(input: $input) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UpdateTask($id: Int!, $input: UpdateTaskInput!) {\n    updateTask(id: $id, input: $input) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateTask($id: Int!, $input: UpdateTaskInput!) {\n    updateTask(id: $id, input: $input) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MoveTaskToBin($id: Int!) {\n    moveTaskToBin(id: $id) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"): (typeof documents)["\n  mutation MoveTaskToBin($id: Int!) {\n    moveTaskToBin(id: $id) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MoveTaskToActive($id: Int!) {\n    moveTaskToActive(id: $id) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"): (typeof documents)["\n  mutation MoveTaskToActive($id: Int!) {\n    moveTaskToActive(id: $id) {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation PermanentlyDeleteTask($id: Int!) {\n    permanentlyDeleteTask(id: $id)\n  }\n"): (typeof documents)["\n  mutation PermanentlyDeleteTask($id: Int!) {\n    permanentlyDeleteTask(id: $id)\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MoveCompletedToBin {\n    moveCompletedToBin {\n      moved {\n        id\n        text\n        isDone\n        date\n      }\n      tasks {\n        id\n        text\n        isDone\n        date\n      }\n    }\n  }\n"): (typeof documents)["\n  mutation MoveCompletedToBin {\n    moveCompletedToBin {\n      moved {\n        id\n        text\n        isDone\n        date\n      }\n      tasks {\n        id\n        text\n        isDone\n        date\n      }\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation MarkAllActiveTasks {\n    markAllActiveTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"): (typeof documents)["\n  mutation MarkAllActiveTasks {\n    markAllActiveTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "\n  mutation UnmarkAllActiveTasks {\n    unmarkAllActiveTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"): (typeof documents)["\n  mutation UnmarkAllActiveTasks {\n    unmarkAllActiveTasks {\n      id\n      text\n      isDone\n      date\n    }\n  }\n"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;
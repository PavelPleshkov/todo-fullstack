/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type CreateTaskInput = {
  isDone: Scalars['Boolean']['input'];
  text: Scalars['String']['input'];
};

export type MoveCompletedResult = {
  __typename?: 'MoveCompletedResult';
  moved: Array<Task>;
  tasks: Array<Task>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createTask: Task;
  markAllActiveTasks: Array<Task>;
  moveCompletedToBin: MoveCompletedResult;
  moveTaskToActive: Task;
  moveTaskToBin: Task;
  permanentlyDeleteTask: Scalars['Boolean']['output'];
  unmarkAllActiveTasks: Array<Task>;
  updateTask: Task;
};


export type MutationCreateTaskArgs = {
  input: CreateTaskInput;
};


export type MutationMoveTaskToActiveArgs = {
  id: Scalars['Int']['input'];
};


export type MutationMoveTaskToBinArgs = {
  id: Scalars['Int']['input'];
};


export type MutationPermanentlyDeleteTaskArgs = {
  id: Scalars['Int']['input'];
};


export type MutationUpdateTaskArgs = {
  id: Scalars['Int']['input'];
  input: UpdateTaskInput;
};

export type Query = {
  __typename?: 'Query';
  activeTasks: Array<Task>;
  binTasks: Array<Task>;
};

export type Task = {
  __typename?: 'Task';
  date: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  isDone: Scalars['Boolean']['output'];
  text: Scalars['String']['output'];
};

export type UpdateTaskInput = {
  isDone?: InputMaybe<Scalars['Boolean']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type ActiveTasksQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveTasksQuery = { __typename?: 'Query', activeTasks: Array<{ __typename?: 'Task', id: number, text: string, isDone: boolean, date: string }> };

export type BinTasksQueryVariables = Exact<{ [key: string]: never; }>;


export type BinTasksQuery = { __typename?: 'Query', binTasks: Array<{ __typename?: 'Task', id: number, text: string, isDone: boolean, date: string }> };

export type CreateTaskMutationVariables = Exact<{
  input: CreateTaskInput;
}>;


export type CreateTaskMutation = { __typename?: 'Mutation', createTask: { __typename?: 'Task', id: number, text: string, isDone: boolean, date: string } };

export type UpdateTaskMutationVariables = Exact<{
  id: Scalars['Int']['input'];
  input: UpdateTaskInput;
}>;


export type UpdateTaskMutation = { __typename?: 'Mutation', updateTask: { __typename?: 'Task', id: number, text: string, isDone: boolean, date: string } };

export type MoveTaskToBinMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type MoveTaskToBinMutation = { __typename?: 'Mutation', moveTaskToBin: { __typename?: 'Task', id: number, text: string, isDone: boolean, date: string } };

export type MoveTaskToActiveMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type MoveTaskToActiveMutation = { __typename?: 'Mutation', moveTaskToActive: { __typename?: 'Task', id: number, text: string, isDone: boolean, date: string } };

export type PermanentlyDeleteTaskMutationVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type PermanentlyDeleteTaskMutation = { __typename?: 'Mutation', permanentlyDeleteTask: boolean };

export type MoveCompletedToBinMutationVariables = Exact<{ [key: string]: never; }>;


export type MoveCompletedToBinMutation = { __typename?: 'Mutation', moveCompletedToBin: { __typename?: 'MoveCompletedResult', moved: Array<{ __typename?: 'Task', id: number, text: string, isDone: boolean, date: string }>, tasks: Array<{ __typename?: 'Task', id: number, text: string, isDone: boolean, date: string }> } };

export type MarkAllActiveTasksMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllActiveTasksMutation = { __typename?: 'Mutation', markAllActiveTasks: Array<{ __typename?: 'Task', id: number, text: string, isDone: boolean, date: string }> };

export type UnmarkAllActiveTasksMutationVariables = Exact<{ [key: string]: never; }>;


export type UnmarkAllActiveTasksMutation = { __typename?: 'Mutation', unmarkAllActiveTasks: Array<{ __typename?: 'Task', id: number, text: string, isDone: boolean, date: string }> };


export const ActiveTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<ActiveTasksQuery, ActiveTasksQueryVariables>;
export const BinTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"BinTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"binTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<BinTasksQuery, BinTasksQueryVariables>;
export const CreateTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<CreateTaskMutation, CreateTaskMutationVariables>;
export const UpdateTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateTaskInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<UpdateTaskMutation, UpdateTaskMutationVariables>;
export const MoveTaskToBinDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveTaskToBin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveTaskToBin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<MoveTaskToBinMutation, MoveTaskToBinMutationVariables>;
export const MoveTaskToActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveTaskToActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveTaskToActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<MoveTaskToActiveMutation, MoveTaskToActiveMutationVariables>;
export const PermanentlyDeleteTaskDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PermanentlyDeleteTask"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"permanentlyDeleteTask"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<PermanentlyDeleteTaskMutation, PermanentlyDeleteTaskMutationVariables>;
export const MoveCompletedToBinDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MoveCompletedToBin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moveCompletedToBin"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moved"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}},{"kind":"Field","name":{"kind":"Name","value":"tasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]}}]} as unknown as DocumentNode<MoveCompletedToBinMutation, MoveCompletedToBinMutationVariables>;
export const MarkAllActiveTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllActiveTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllActiveTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<MarkAllActiveTasksMutation, MarkAllActiveTasksMutationVariables>;
export const UnmarkAllActiveTasksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnmarkAllActiveTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unmarkAllActiveTasks"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"isDone"}},{"kind":"Field","name":{"kind":"Name","value":"date"}}]}}]}}]} as unknown as DocumentNode<UnmarkAllActiveTasksMutation, UnmarkAllActiveTasksMutationVariables>;
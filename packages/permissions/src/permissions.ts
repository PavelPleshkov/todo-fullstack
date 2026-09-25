/**
 * Who performs the action.
 *
 * @property id - user id (JWT `sub` or frontend `user.id`)
 * @property role - `user`, `admin`, or later `manager`
 */
export type Actor = {
  id: number;
  role: string;
};

/**
 * The account the action is about (a row from `users`).
 *
 * @property id - that account's id
 * @property role - that account's role
 */
export type UserTarget = {
  id: number;
  role: string;
};

/**
 * A task for permission checks.
 *
 * @property ownerId - id of the user who owns the task
 * @property ownerRole - owner's role; needed for a manager, optional for admin or the owner
 */
export type TaskTarget = {
  ownerId: number;
  ownerRole?: string;
};

/**
 * Can this person open the Users area: tab, page, and the `users` query.
 * Does not decide which rows to show — use `canSeeUser` for that.
 *
 * @param actor - who wants to open Users
 * @returns `true` for admin and manager, otherwise `false`
 */
export function canAccessUsers(actor: Actor): boolean {
  return actor.role === "admin" || actor.role === "manager";
}

/**
 * Can this person see this account in the Users table.
 * Admin: any account. Manager: only `role=user`. Regular user: none.
 *
 * @param actor - who is looking
 * @param target - the account row
 * @returns `true` if this row may be shown
 */
export function canSeeUser(actor: Actor, target: UserTarget): boolean {
  if (actor.role === "admin") return true;
  if (actor.role === "manager") return target.role === "user";
  return false;
}

/**
 * Can this person soft-delete the account (Del button, `deleteUser`).
 * Nobody can delete themselves. Admin cannot delete an admin.
 * Manager can only delete a `user`.
 * "Already deleted" is checked in the service via `deleted_at`, not here.
 *
 * @param actor - who clicks Del
 * @param target - the account to delete
 * @returns `true` if soft-delete is allowed
 */
export function canSoftDeleteUser(actor: Actor, target: UserTarget): boolean {
  if (actor.id === target.id) return false;
  if (actor.role === "admin") return target.role !== "admin";
  if (actor.role === "manager") return target.role === "user";
  return false;
}

/**
 * Can this person restore a soft-deleted account (Restore, `restoreUser`).
 * Admin: any account. Manager: another `user` only. Regular user: no.
 * "Already restored" is checked in the service via `deleted_at`.
 *
 * @param actor - who clicks Restore
 * @param target - the account to restore
 * @returns `true` if restore is allowed
 */
export function canRestoreUser(actor: Actor, target: UserTarget): boolean {
  if (actor.role === "admin") return true;
  if (actor.id === target.id) return false;
  if (actor.role === "manager") return target.role === "user";
  return false;
}

/**
 * Can this person see this task (card, or a future list filter).
 * Admin: any task. Owner: their own. Manager: also tasks with `ownerRole=user`.
 *
 * @param actor - who is looking
 * @param task - the task (`ownerRole` needed for a manager)
 * @returns `true` if this task may be shown
 */
export function canSeeTask(actor: Actor, task: TaskTarget): boolean {
  if (actor.role === "admin") return true;
  if (task.ownerId === actor.id) return true;
  if (actor.role === "manager" && task.ownerRole === "user") return true;
  return false;
}

/**
 * Can this person change the task: text, done, move to bin, restore, mark all.
 * Same rules as `canSeeTask`. Permanent delete is `canHardDeleteTask`.
 *
 * @param actor - who wants to change the task
 * @param task - the task (`ownerRole` needed for a manager)
 * @returns `true` if change is allowed
 */
export function canModifyTask(actor: Actor, task: TaskTarget): boolean {
  return canSeeTask(actor, task);
}

/**
 * Can this person permanently delete a task from the bin (`permanentlyDeleteTask`).
 * Admin: any task. Manager: only if `ownerRole=user`. Regular user: no.
 *
 * @param actor - who wants to delete forever
 * @param task - the task (`ownerRole` needed for a manager)
 * @returns `true` if permanent delete is allowed
 */
export function canHardDeleteTask(actor: Actor, task: TaskTarget): boolean {
  if (actor.role === "admin") return true;
  if (actor.role === "manager" && task.ownerRole === "user") return true;
  return false;
}

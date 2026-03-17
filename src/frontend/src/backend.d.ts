import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Task {
    id: bigint;
    title: string;
    createdBy: string;
    category: string;
    points: bigint;
}
export interface Completion {
    completedAt: bigint;
    date: string;
    taskId: bigint;
}
export interface UserStats {
    lastCompletionDate: string;
    level: bigint;
    totalPoints: bigint;
    currentStreak: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTask(title: string, category: string, points: bigint): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    completeTask(taskId: bigint, date: string): Promise<void>;
    deleteTask(taskId: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getTasks(): Promise<Array<Task>>;
    getTodayCompletions(date: string): Promise<Array<Completion>>;
    getUserProfile(user: string): Promise<UserProfile | null>;
    getUserStats(): Promise<UserStats>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    uncompleteTask(taskId: bigint, date: string): Promise<void>;
    registerCredentials(username: string, passwordHash: string): Promise<{ ok: boolean; error: string | null }>;
    getMyCredentials(): Promise<{ username: string } | null>;
    verifyCredentials(username: string, passwordHash: string): Promise<boolean>;
    checkUsernameAvailable(username: string): Promise<boolean>;
}

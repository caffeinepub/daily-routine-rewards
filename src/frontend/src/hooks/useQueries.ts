import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Completion, Task, UserProfile, UserStats } from "../backend.d";
import { useActor } from "./useActor";

const TODAY = new Date().toISOString().split("T")[0];

export function useGetTasks() {
  const { actor, isFetching } = useActor();
  return useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTasks();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetTodayCompletions() {
  const { actor, isFetching } = useActor();
  return useQuery<Completion[]>({
    queryKey: ["completions", TODAY],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodayCompletions(TODAY);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetUserStats() {
  const { actor, isFetching } = useActor();
  return useQuery<UserStats>({
    queryKey: ["userStats"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getUserStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useAddTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      title,
      category,
      points,
    }: { title: string; category: string; points: number }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addTask(title, category, BigInt(points));
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteTask(taskId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["completions"] });
    },
  });
}

export function useCompleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.completeTask(taskId, TODAY);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["completions"] });
      qc.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useUncompleteTask() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.uncompleteTask(taskId, TODAY);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["completions"] });
      qc.invalidateQueries({ queryKey: ["userStats"] });
    },
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile({ name });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["currentUserProfile"] }),
  });
}

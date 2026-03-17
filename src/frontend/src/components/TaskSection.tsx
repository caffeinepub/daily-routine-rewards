import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Task } from "../backend.d";

const CATEGORY_META: Record<
  string,
  {
    label: string;
    emoji: string;
    colorClass: string;
    bgClass: string;
    time: string;
  }
> = {
  morning: {
    label: "Morning",
    emoji: "🌅",
    colorClass: "cat-morning",
    bgClass: "cat-morning-bg",
    time: "5am – 12pm",
  },
  afternoon: {
    label: "Afternoon",
    emoji: "☀️",
    colorClass: "cat-afternoon",
    bgClass: "cat-afternoon-bg",
    time: "12pm – 5pm",
  },
  evening: {
    label: "Evening",
    emoji: "🌙",
    colorClass: "cat-evening",
    bgClass: "cat-evening-bg",
    time: "5pm – 10pm",
  },
  anytime: {
    label: "Anytime",
    emoji: "⚡",
    colorClass: "cat-anytime",
    bgClass: "cat-anytime-bg",
    time: "Any time",
  },
};

interface TaskSectionProps {
  category: string;
  tasks: Task[];
  completedIds: Set<string>;
  onToggle: (task: Task, isCompleted: boolean) => void;
  onDelete: (taskId: bigint) => void;
  itemIndexOffset: number;
}

export default function TaskSection({
  category,
  tasks,
  completedIds,
  onToggle,
  onDelete,
  itemIndexOffset,
}: TaskSectionProps) {
  const meta = CATEGORY_META[category] ?? {
    label: category,
    emoji: "📌",
    colorClass: "cat-anytime",
    bgClass: "cat-anytime-bg",
    time: "",
  };

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{meta.emoji}</span>
        <span className={`font-display font-bold text-base ${meta.colorClass}`}>
          {meta.label}
        </span>
        <span className="text-xs text-muted-foreground">{meta.time}</span>
        <div
          className="flex-1 h-px"
          style={{ background: "oklch(0.25 0.015 55)" }}
        />
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.22 0.015 55)",
            color: "oklch(0.55 0.01 85)",
          }}
        >
          {tasks.filter((t) => completedIds.has(t.id.toString())).length}/
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {tasks.length === 0 ? (
          <div
            data-ocid="todo.empty_state"
            className={`flex items-center justify-center py-6 rounded-xl border border-dashed ${meta.bgClass}`}
          >
            <span className="text-sm text-muted-foreground">
              No {meta.label.toLowerCase()} tasks yet — add one below!
            </span>
          </div>
        ) : (
          <AnimatePresence>
            {tasks.map((task, idx) => {
              const globalIdx = itemIndexOffset + idx + 1;
              const isCompleted = completedIds.has(task.id.toString());
              return (
                <motion.div
                  key={task.id.toString()}
                  data-ocid={`todo.item.${globalIdx}`}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                    isCompleted ? "opacity-60" : ""
                  }`}
                  style={{
                    background: isCompleted
                      ? "oklch(0.15 0.012 55)"
                      : "oklch(0.18 0.016 55)",
                    borderColor: isCompleted
                      ? "oklch(0.25 0.015 55)"
                      : "oklch(0.28 0.018 55)",
                  }}
                >
                  <Checkbox
                    data-ocid={`todo.checkbox.${globalIdx}`}
                    checked={isCompleted}
                    onCheckedChange={(checked) => onToggle(task, !!checked)}
                    className="w-5 h-5 rounded-md flex-shrink-0"
                    style={{
                      borderColor: isCompleted
                        ? "oklch(0.78 0.19 75)"
                        : "oklch(0.40 0.020 55)",
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span
                      className={`text-sm font-medium block truncate transition-all duration-300 ${
                        isCompleted
                          ? "line-through text-muted-foreground"
                          : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>
                  <Button
                    data-ocid={`todo.delete_button.${globalIdx}`}
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 flex-shrink-0 opacity-40 hover:opacity-100 hover:text-destructive transition-opacity"
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

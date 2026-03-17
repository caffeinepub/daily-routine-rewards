import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useAddTask } from "../hooks/useQueries";

export default function AddTaskForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("anytime");
  const [points, setPoints] = useState("10");
  const addTask = useAddTask();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addTask.mutate(
      { title: title.trim(), category, points: Number.parseInt(points) },
      {
        onSuccess: () => {
          setTitle("");
          setCategory("anytime");
          setPoints("10");
        },
      },
    );
  };

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid oklch(0.28 0.018 55)" }}
    >
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 transition-colors hover:bg-secondary/30"
        style={{
          background: open ? "oklch(0.19 0.018 55)" : "oklch(0.17 0.015 55)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.78 0.19 75 / 0.15)" }}
          >
            <Plus
              className="w-4 h-4"
              style={{ color: "oklch(0.78 0.19 75)" }}
            />
          </div>
          <span className="font-display font-semibold text-sm text-foreground">
            Add New Quest
          </span>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: "hidden", background: "oklch(0.17 0.015 55)" }}
          >
            <form
              onSubmit={handleSubmit}
              className="px-5 pb-5 pt-2 flex flex-col gap-4"
            >
              <div
                className="h-px"
                style={{ background: "oklch(0.25 0.015 55)" }}
              />
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="task-title"
                  className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Quest Title
                </Label>
                <Input
                  id="task-title"
                  data-ocid="todo.input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning meditation for 10 mins"
                  className="bg-secondary border-border focus-visible:ring-primary"
                  autoComplete="off"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Category
                  </Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger
                      data-ocid="todo.select"
                      className="bg-secondary border-border"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">🌅 Morning</SelectItem>
                      <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                      <SelectItem value="evening">🌙 Evening</SelectItem>
                      <SelectItem value="anytime">⚡ Anytime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    XP Reward
                  </Label>
                  <Select value={points} onValueChange={setPoints}>
                    <SelectTrigger
                      data-ocid="todo.points.select"
                      className="bg-secondary border-border"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">⚡ 5 XP</SelectItem>
                      <SelectItem value="10">⚡ 10 XP</SelectItem>
                      <SelectItem value="15">⚡ 15 XP</SelectItem>
                      <SelectItem value="20">⚡ 20 XP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                data-ocid="todo.add_button"
                type="submit"
                disabled={!title.trim() || addTask.isPending}
                className="w-full h-11 font-display font-semibold text-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.78 0.19 75), oklch(0.68 0.22 55))",
                  color: "oklch(0.13 0.012 55)",
                  boxShadow: title.trim()
                    ? "0 0 20px oklch(0.78 0.19 75 / 0.3)"
                    : "none",
                }}
              >
                {addTask.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Adding...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Quest
                  </span>
                )}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Save } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface DiaryEntry {
  id: string;
  date: string;
  dateLabel: string;
  content: string;
}

const STORAGE_KEY = "daily-quest-diary";

function loadEntries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEntries(entries: DiaryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export default function DiarySection() {
  const [entries, setEntries] = useState<DiaryEntry[]>(loadEntries);
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date();
    const entry: DiaryEntry = {
      id: String(Date.now()),
      date: now.toISOString(),
      dateLabel: now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      content: trimmed,
    };
    setEntries((prev) => [entry, ...prev]);
    setText("");
    toast.success("Diary entry saved!");
    textareaRef.current?.blur();
  };

  const handleDelete = (id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <motion.div
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: "oklch(0.18 0.015 55)",
        border: "1px solid oklch(0.25 0.018 55)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <BookOpen
          className="w-4 h-4"
          style={{ color: "oklch(0.78 0.19 75)" }}
        />
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
          Diary
        </p>
      </div>

      {/* Input area */}
      <div className="flex flex-col gap-2">
        <Textarea
          ref={textareaRef}
          data-ocid="diary.textarea"
          placeholder="Write about your day, thoughts, or reflections..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="resize-none"
          style={{
            background: "oklch(0.14 0.012 55)",
            border: "1px solid oklch(0.28 0.018 55)",
            color: "oklch(0.94 0.01 85)",
          }}
        />
        <Button
          data-ocid="diary.save_button"
          onClick={handleSave}
          disabled={!text.trim()}
          className="self-end gap-2"
          style={{
            background: text.trim() ? "oklch(0.78 0.19 75)" : undefined,
            color: text.trim() ? "oklch(0.13 0.012 55)" : undefined,
          }}
        >
          <Save className="w-4 h-4" />
          Save Entry
        </Button>
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <div
          data-ocid="diary.empty_state"
          className="flex flex-col items-center gap-2 py-8 text-center"
        >
          <BookOpen className="w-8 h-8 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">
            No entries yet. Start writing your first diary entry above.
          </p>
        </div>
      ) : (
        <div data-ocid="diary.list" className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
            Past Entries
          </p>
          <ScrollArea className="max-h-80">
            <div className="flex flex-col gap-3 pr-2">
              <AnimatePresence>
                {entries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    data-ocid={`diary.item.${idx + 1}`}
                    className="rounded-xl p-4 flex flex-col gap-2"
                    style={{
                      background: "oklch(0.14 0.012 55)",
                      border: "1px solid oklch(0.22 0.015 55)",
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className="text-xs font-semibold"
                        style={{ color: "oklch(0.78 0.19 75)" }}
                      >
                        {entry.dateLabel}
                      </span>
                      <button
                        type="button"
                        data-ocid={`diary.delete_button.${idx + 1}`}
                        onClick={() => handleDelete(entry.id)}
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors px-1"
                        aria-label="Delete entry"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>
      )}
    </motion.div>
  );
}

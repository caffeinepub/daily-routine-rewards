import { Calendar } from "@/components/ui/calendar";
import { motion } from "motion/react";
import { useState } from "react";

export default function CalendarWidget() {
  const [selected, setSelected] = useState<Date | undefined>(new Date());

  const now = new Date();
  const monthYear = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <motion.div
      data-ocid="calendar.panel"
      className="rounded-2xl p-5 flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.96 0.04 285), oklch(0.97 0.03 200))",
        border: "1px solid oklch(0.82 0.08 270)",
        boxShadow: "0 4px 20px oklch(0.55 0.22 280 / 0.15)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Month/Year header */}
      <div className="flex items-center justify-between mb-3">
        <h3
          className="font-display font-bold text-lg"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.45 0.28 285), oklch(0.55 0.22 200))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {monthYear}
        </h3>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.88 0.08 285 / 0.5)",
            color: "oklch(0.45 0.22 280)",
          }}
        >
          📅 Calendar
        </span>
      </div>

      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        className="rounded-xl w-full"
        classNames={{
          months: "w-full",
          month: "w-full",
          table: "w-full border-collapse",
          head_row: "flex w-full",
          head_cell:
            "text-purple-500 font-semibold text-xs flex-1 text-center py-1",
          row: "flex w-full mt-1",
          cell: "flex-1 text-center",
          day: "h-8 w-8 mx-auto text-sm rounded-full transition-all hover:bg-purple-100 font-medium",
          day_selected:
            "bg-purple-500 text-white rounded-full hover:bg-purple-600 font-bold",
          day_today:
            "ring-2 ring-teal-400 rounded-full font-bold text-teal-700 bg-teal-50",
          day_outside: "text-gray-300",
          caption: "hidden",
          nav: "hidden",
        }}
      />

      {/* Tagline */}
      <p
        className="text-xs italic mt-3 text-center"
        style={{ color: "oklch(0.50 0.15 200)" }}
      >
        Plan your day, own your week.
      </p>
    </motion.div>
  );
}

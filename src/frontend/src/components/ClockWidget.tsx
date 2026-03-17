import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");
  const ampm = time.getHours() >= 12 ? "PM" : "AM";

  return (
    <motion.div
      data-ocid="clock.panel"
      className="rounded-2xl p-5 flex flex-col items-center gap-1"
      style={{
        background: "oklch(0.18 0.015 55)",
        border: "1px solid oklch(0.25 0.018 55)",
        boxShadow: "0 0 32px oklch(0.78 0.19 75 / 0.08)",
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
        Current Time
      </p>
      <div className="flex items-end gap-1 tabular-nums">
        <span
          className="font-display font-bold leading-none"
          style={{
            fontSize: "clamp(2.8rem, 10vw, 4.5rem)",
            color: "oklch(0.78 0.19 75)",
          }}
        >
          {hh}:{mm}
        </span>
        <div className="flex flex-col items-start mb-2 gap-0.5">
          <motion.span
            key={ss}
            className="font-display font-bold text-xl leading-none"
            style={{ color: "oklch(0.65 0.14 75)" }}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {ss}
          </motion.span>
          <span className="text-xs font-semibold text-muted-foreground">
            {ampm}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {time.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      </p>
    </motion.div>
  );
}

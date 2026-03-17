import { Flame, Star, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { UserStats } from "../backend.d";

interface StatsBarProps {
  stats: UserStats | undefined;
  isLoading: boolean;
}

export default function StatsBar({ stats, isLoading }: StatsBarProps) {
  const totalPoints = stats ? Number(stats.totalPoints) : 0;
  const level = stats ? Number(stats.level) : 1;
  const streak = stats ? Number(stats.currentStreak) : 0;

  const pointsInLevel = totalPoints % 100;
  const xpProgress = pointsInLevel;
  const pointsToNext = 100 - pointsInLevel;

  return (
    <motion.div
      data-ocid="stats.panel"
      className="relative overflow-hidden rounded-2xl p-4 md:p-5"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.20 0.025 60) 0%, oklch(0.17 0.020 50) 100%)",
        border: "1px solid oklch(0.32 0.035 65 / 0.5)",
        boxShadow:
          "0 0 40px oklch(0.78 0.19 75 / 0.08), inset 0 1px 0 oklch(0.50 0.05 70 / 0.2)",
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Shimmer top line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, oklch(0.78 0.19 75 / 0.6), transparent)",
        }}
      />

      <div className="flex flex-col gap-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Total Points */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Zap
                className="w-4 h-4"
                style={{ color: "oklch(0.78 0.19 75)" }}
              />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                XP Points
              </span>
            </div>
            {isLoading ? (
              <div className="h-7 w-20 rounded bg-secondary animate-pulse" />
            ) : (
              <motion.span
                key={totalPoints}
                className="text-2xl font-display font-bold text-gold-gradient"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {totalPoints.toLocaleString()}
              </motion.span>
            )}
          </div>

          {/* Level */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Trophy
                className="w-4 h-4"
                style={{ color: "oklch(0.68 0.18 280)" }}
              />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Level
              </span>
            </div>
            {isLoading ? (
              <div className="h-7 w-12 rounded bg-secondary animate-pulse" />
            ) : (
              <div className="flex items-center gap-2">
                <motion.span
                  key={level}
                  className="text-2xl font-display font-bold"
                  style={{ color: "oklch(0.68 0.18 280)" }}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {level}
                </motion.span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-md font-bold"
                  style={{
                    background: "oklch(0.68 0.18 280 / 0.15)",
                    color: "oklch(0.68 0.18 280)",
                  }}
                >
                  LVL
                </span>
              </div>
            )}
          </div>

          {/* Streak */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5">
              <Flame
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.20 45)" }}
              />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                Streak
              </span>
            </div>
            {isLoading ? (
              <div className="h-7 w-16 rounded bg-secondary animate-pulse" />
            ) : (
              <div className="flex items-baseline gap-1">
                <motion.span
                  key={streak}
                  className="text-2xl font-display font-bold"
                  style={{ color: "oklch(0.72 0.20 45)" }}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {streak}
                </motion.span>
                <span className="text-xs text-muted-foreground">days</span>
              </div>
            )}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              Progress to Level {level + 1}
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "oklch(0.78 0.19 75)" }}
            >
              {xpProgress}/100 XP ({pointsToNext} to go)
            </span>
          </div>
          <div
            className="h-3 rounded-full overflow-hidden"
            style={{ background: "oklch(0.22 0.015 55)" }}
          >
            <motion.div
              className="h-full rounded-full xp-bar-fill"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.68 0.20 65), oklch(0.82 0.22 80), oklch(0.78 0.18 70))",
              }}
              initial={{ width: "0%" }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={`star-${i}`}
                className="w-3 h-3"
                style={{
                  color:
                    i < Math.floor(xpProgress / 20)
                      ? "oklch(0.78 0.19 75)"
                      : "oklch(0.30 0.015 55)",
                  fill:
                    i < Math.floor(xpProgress / 20)
                      ? "oklch(0.78 0.19 75)"
                      : "transparent",
                }}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              milestone stars
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

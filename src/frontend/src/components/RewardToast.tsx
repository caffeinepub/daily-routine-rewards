import { Star, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface RewardToastProps {
  show: boolean;
  points: number;
  onDone: () => void;
}

const CONFETTI_COLORS = [
  "oklch(0.98 0.01 85)",
  "oklch(0.65 0.21 28)",
  "oklch(0.68 0.18 280)",
];

export default function RewardToast({
  show,
  points,
  onDone,
}: RewardToastProps) {
  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          data-ocid="reward.toast"
          className="fixed top-24 left-1/2 z-50 pointer-events-none"
          style={{ transform: "translateX(-50%)" }}
          initial={{ opacity: 0, y: -20, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          onAnimationComplete={(def) => {
            if (def === "animate") {
              setTimeout(onDone, 1800);
            }
          }}
        >
          <div
            className="relative flex items-center gap-3 px-5 py-3.5 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.19 75), oklch(0.68 0.22 55))",
              boxShadow:
                "0 0 40px oklch(0.78 0.19 75 / 0.6), 0 4px 20px oklch(0 0 0 / 0.4)",
              color: "oklch(0.13 0.012 55)",
            }}
          >
            {/* Confetti bits */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={`confetti-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: CONFETTI_COLORS[i % 3],
                  left: `${10 + i * 15}%`,
                  top: "50%",
                }}
                animate={{
                  y: [0, -30 - i * 5],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 8)],
                  opacity: [1, 0],
                  scale: [1, 0],
                }}
                transition={{ duration: 0.7, delay: 0.1 + i * 0.05 }}
              />
            ))}
            <div className="flex items-center gap-1">
              <Zap className="w-5 h-5" />
              <Star className="w-4 h-4" fill="currentColor" />
            </div>
            <div>
              <div className="font-display font-bold text-lg leading-tight">
                +{points} XP Earned!
              </div>
              <div className="text-xs opacity-70 font-medium">
                Quest Complete 🎉
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

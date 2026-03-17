import { CheckCircle2, Lock, Shield, Smartphone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "distresso_safety_accepted";

export default function SafetyNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{
            background: "oklch(0.08 0.02 280 / 0.65)",
            backdropFilter: "blur(6px)",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.99 0.004 220)",
              boxShadow: "0 20px 60px oklch(0.25 0.18 280 / 0.35)",
              border: "1px solid oklch(0.88 0.04 240)",
            }}
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
          >
            {/* Header */}
            <div
              className="px-5 pt-5 pb-4 flex items-center gap-3"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.45 0.28 285 / 0.08), oklch(0.68 0.26 185 / 0.08))",
                borderBottom: "1px solid oklch(0.88 0.04 240)",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.28 285), oklch(0.68 0.26 185))",
                }}
              >
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p
                  className="font-bold text-base"
                  style={{ color: "oklch(0.20 0.06 255)" }}
                >
                  Safe to Download &amp; Use
                </p>
                <p
                  className="text-xs"
                  style={{ color: "oklch(0.50 0.04 250)" }}
                >
                  Your privacy is fully protected
                </p>
              </div>
              <button
                type="button"
                onClick={accept}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: "oklch(0.92 0.015 240)" }}
                aria-label="Close"
              >
                <X
                  className="w-4 h-4"
                  style={{ color: "oklch(0.45 0.06 255)" }}
                />
              </button>
            </div>

            {/* Points */}
            <div className="px-5 py-4 flex flex-col gap-3">
              {[
                {
                  icon: Lock,
                  title: "No account required",
                  desc: "Opens directly — no sign-up, no password, no personal info collected.",
                },
                {
                  icon: Smartphone,
                  title: "All data stays on your device",
                  desc: "Your diary, tasks, and fitness data are stored locally. Nothing is sent to any server.",
                },
                {
                  icon: Shield,
                  title: "Permissions used only when needed",
                  desc: "Camera (nutrition photo), motion sensor (step counter), and location (GPS map) are requested on-demand — never in the background.",
                },
                {
                  icon: CheckCircle2,
                  title: "No ads. No tracking.",
                  desc: "DISTRESSO does not display ads, track your activity, or share data with third parties.",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
                    style={{ background: "oklch(0.92 0.04 270)" }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{ color: "oklch(0.45 0.28 285)" }}
                    />
                  </div>
                  <div>
                    <p
                      className="font-semibold text-sm"
                      style={{ color: "oklch(0.20 0.06 255)" }}
                    >
                      {title}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "oklch(0.48 0.04 250)" }}
                    >
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={accept}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.45 0.28 285), oklch(0.68 0.26 185))",
                  boxShadow: "0 4px 16px oklch(0.45 0.28 285 / 0.35)",
                }}
              >
                Got it — Let's Go!
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

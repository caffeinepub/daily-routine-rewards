import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Lock, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";
import { useSaveUserProfile } from "../hooks/useQueries";

async function hashPassword(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(pw),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ProfileSetup() {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const saveProfile = useSaveUserProfile();
  const { actor } = useActor();

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(2);
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError("");
    setPasswordError("");

    if (!username.trim()) {
      setUsernameError("Username is required");
      return;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setPasswordError("Passwords don't match");
      return;
    }

    setIsSubmitting(true);
    try {
      if (actor) {
        const available = await (actor as any).checkUsernameAvailable(
          username.trim(),
        );
        if (!available) {
          setUsernameError("Username taken — try another");
          setIsSubmitting(false);
          return;
        }
        const hashed = await hashPassword(password);
        await (actor as any).registerCredentials(username.trim(), hashed);
      }
    } catch {
      // Credentials registration is best-effort; proceed regardless
    }
    setIsSubmitting(false);
    saveProfile.mutate(name.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "oklch(0.08 0.01 55 / 0.85)" }}
    >
      <motion.div
        className="glass-card rounded-2xl p-8 w-full max-w-sm mx-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.19 75), oklch(0.68 0.22 55))",
            }}
          >
            <User
              className="w-8 h-8"
              style={{ color: "oklch(0.13 0.012 55)" }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "oklch(0.78 0.19 75)" }}
            />
            <div
              className="w-8 h-0.5"
              style={{
                background:
                  step === 2 ? "oklch(0.78 0.19 75)" : "oklch(0.25 0.02 55)",
              }}
            />
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background:
                  step === 2 ? "oklch(0.78 0.19 75)" : "oklch(0.25 0.02 55)",
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                className="w-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-5">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Create Your Profile
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    What should we call you?
                  </p>
                </div>
                <form onSubmit={handleStep1} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="hero-name"
                      className="text-foreground font-medium"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="hero-name"
                      data-ocid="profile.name.input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="bg-secondary border-border focus:border-primary"
                      autoFocus
                    />
                  </div>
                  <Button
                    data-ocid="profile.next.primary_button"
                    type="submit"
                    disabled={!name.trim()}
                    className="w-full h-11 font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.78 0.19 75), oklch(0.68 0.22 55))",
                      color: "oklch(0.13 0.012 55)",
                    }}
                  >
                    Continue
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                className="w-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-5">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Set Your Credentials
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Create a unique username &amp; password
                  </p>
                </div>
                <form onSubmit={handleStep2} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="p-username"
                      className="text-foreground font-medium"
                    >
                      Username
                    </Label>
                    <div className="relative">
                      <User
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "oklch(0.55 0.06 55)" }}
                      />
                      <Input
                        id="p-username"
                        data-ocid="profile.username.input"
                        type="text"
                        placeholder="unique username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setUsernameError("");
                        }}
                        className="pl-9 bg-secondary border-border focus:border-primary"
                      />
                    </div>
                    {usernameError && (
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.62 0.20 25)" }}
                      >
                        {usernameError}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="p-password"
                      className="text-foreground font-medium"
                    >
                      Password
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "oklch(0.55 0.06 55)" }}
                      />
                      <Input
                        id="p-password"
                        data-ocid="profile.password.input"
                        type="password"
                        placeholder="min. 6 characters"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError("");
                        }}
                        className="pl-9 bg-secondary border-border focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="p-confirm"
                      className="text-foreground font-medium"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: "oklch(0.55 0.06 55)" }}
                      />
                      <Input
                        id="p-confirm"
                        data-ocid="profile.confirm_password.input"
                        type="password"
                        placeholder="repeat password"
                        value={confirm}
                        onChange={(e) => {
                          setConfirm(e.target.value);
                          setPasswordError("");
                        }}
                        className="pl-9 bg-secondary border-border focus:border-primary"
                      />
                    </div>
                    {passwordError && (
                      <p
                        className="text-xs"
                        style={{ color: "oklch(0.62 0.20 25)" }}
                      >
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <Button
                    data-ocid="profile.submit.primary_button"
                    type="submit"
                    disabled={isSubmitting || saveProfile.isPending}
                    className="w-full h-11 font-semibold"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.78 0.19 75), oklch(0.68 0.22 55))",
                      color: "oklch(0.13 0.012 55)",
                    }}
                  >
                    {isSubmitting || saveProfile.isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Setting up...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Get Started!
                      </span>
                    )}
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

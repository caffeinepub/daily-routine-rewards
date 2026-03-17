import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { SiApple, SiFacebook, SiGoogle } from "react-icons/si";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, clear, loginStatus } = useInternetIdentity();
  const qc = useQueryClient();
  const isLoggingIn = loginStatus === "logging-in";

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPw, setShowSignInPw] = useState(false);

  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  const handleLogin = async () => {
    try {
      await login();
    } catch (e: any) {
      if (e?.message === "User is already authenticated") {
        await clear();
        qc.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  const floatingBubbles = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-8"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.88 0.08 220) 0%, oklch(0.93 0.04 230) 40%, oklch(0.97 0.015 210) 70%, oklch(0.99 0.005 200) 100%)",
      }}
    >
      {/* Decorative circles in background */}
      <div
        className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.75 0.18 190 / 0.25) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.22 280 / 0.18) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/2 left-[-120px] w-72 h-72 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.18 190 / 0.12) 0%, transparent 70%)",
        }}
      />

      {/* Floating bubbles */}
      {floatingBubbles.map((i) => (
        <motion.div
          key={`b-${i}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${8 + (i % 4) * 6}px`,
            height: `${8 + (i % 4) * 6}px`,
            background:
              i % 2 === 0
                ? "oklch(0.75 0.18 190 / 0.35)"
                : "oklch(0.55 0.22 280 / 0.25)",
            left: `${8 + i * 12}%`,
            top: `${10 + (i % 4) * 20}%`,
          }}
          animate={{ y: [-12, 12, -12], opacity: [0.4, 0.85, 0.4] }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="relative z-10 w-full max-w-sm"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* App branding above card */}
        <motion.div
          className="flex flex-col items-center gap-2 mb-6"
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <img
            src="/assets/uploads/logo-1.png"
            alt="DISTRESSO"
            className="w-14 h-14 rounded-2xl object-cover"
            style={{ boxShadow: "0 8px 32px oklch(0.55 0.22 280 / 0.3)" }}
          />
          <h1
            className="font-display font-bold tracking-wide"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.28 285), oklch(0.68 0.26 185))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "2rem",
              fontWeight: 900,
              letterSpacing: "0.08em",
            }}
          >
            DISTRESSO
          </h1>
        </motion.div>

        {/* Auth Card */}
        <motion.div
          className="rounded-3xl p-7"
          style={{
            background: "oklch(0.99 0.003 220 / 0.92)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 20px 60px oklch(0.55 0.22 280 / 0.15), 0 4px 16px oklch(0.18 0.06 255 / 0.08)",
            border: "1px solid oklch(0.90 0.03 220)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Tabs defaultValue="signin">
            {/* Icon + Heading */}
            <div className="flex flex-col items-center gap-3 mb-5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.93 0.05 270), oklch(0.93 0.05 190))",
                  boxShadow:
                    "0 4px 16px oklch(0.55 0.22 280 / 0.18), 0 1px 4px oklch(0.55 0.10 255 / 0.1)",
                }}
              >
                <LogIn
                  className="w-5 h-5"
                  style={{ color: "oklch(0.50 0.18 270)" }}
                />
              </div>
              <div className="text-center">
                <h2
                  className="font-display font-bold text-xl"
                  style={{ color: "oklch(0.20 0.06 255)" }}
                >
                  Sign in with email
                </h2>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: "oklch(0.58 0.04 250)" }}
                >
                  Your personal productivity companion
                </p>
              </div>
            </div>

            <TabsList
              className="w-full mb-5"
              style={{
                background: "oklch(0.93 0.03 240)",
                border: "1px solid oklch(0.88 0.03 240)",
              }}
            >
              <TabsTrigger
                data-ocid="login.sign_in.tab"
                value="signin"
                className="flex-1 text-sm font-semibold"
                style={{ color: "oklch(0.45 0.06 255)" }}
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                data-ocid="login.create_account.tab"
                value="register"
                className="flex-1 text-sm font-semibold"
                style={{ color: "oklch(0.45 0.06 255)" }}
              >
                Create Account
              </TabsTrigger>
            </TabsList>

            {/* ---- SIGN IN ---- */}
            <TabsContent value="signin">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="si-email"
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.35 0.06 255)" }}
                  >
                    Email or Username
                  </Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.62 0.04 250)" }}
                    />
                    <Input
                      id="si-email"
                      data-ocid="login.username.input"
                      type="text"
                      placeholder="you@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="pl-9"
                      style={{
                        background: "oklch(0.95 0.015 230)",
                        borderColor: "oklch(0.87 0.03 230)",
                        color: "oklch(0.20 0.06 255)",
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="si-password"
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.35 0.06 255)" }}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.62 0.04 250)" }}
                    />
                    <Input
                      id="si-password"
                      data-ocid="login.password.input"
                      type={showSignInPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="pl-9 pr-10"
                      style={{
                        background: "oklch(0.95 0.015 230)",
                        borderColor: "oklch(0.87 0.03 230)",
                        color: "oklch(0.20 0.06 255)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignInPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.62 0.04 250)" }}
                    >
                      {showSignInPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="text-xs font-medium hover:underline"
                      style={{ color: "oklch(0.55 0.20 250)" }}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                <Button
                  data-ocid="login.submit.primary_button"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-12 font-semibold text-sm rounded-xl mt-1"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.72 0.20 190))",
                    color: "oklch(0.99 0.005 220)",
                    boxShadow: "0 4px 14px oklch(0.55 0.22 280 / 0.4)",
                  }}
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    "Get Started"
                  )}
                </Button>
              </form>

              {/* Social sign in */}
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex-1 border-t border-dashed"
                    style={{ borderColor: "oklch(0.85 0.03 240)" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.62 0.04 250)" }}
                  >
                    Or sign in with
                  </span>
                  <div
                    className="flex-1 border-t border-dashed"
                    style={{ borderColor: "oklch(0.85 0.03 240)" }}
                  />
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    data-ocid="login.google.button"
                    onClick={handleLogin}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl transition-all hover:shadow-md"
                    style={{
                      background: "oklch(0.99 0.003 220)",
                      border: "1px solid oklch(0.90 0.02 220)",
                      boxShadow: "0 1px 4px oklch(0.18 0.06 255 / 0.08)",
                    }}
                  >
                    <SiGoogle
                      className="w-4 h-4"
                      style={{ color: "#EA4335" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.35 0.06 255)" }}
                    >
                      Google
                    </span>
                  </button>
                  <button
                    type="button"
                    data-ocid="login.facebook.button"
                    onClick={handleLogin}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl transition-all hover:shadow-md"
                    style={{
                      background: "oklch(0.99 0.003 220)",
                      border: "1px solid oklch(0.90 0.02 220)",
                      boxShadow: "0 1px 4px oklch(0.18 0.06 255 / 0.08)",
                    }}
                  >
                    <SiFacebook
                      className="w-4 h-4"
                      style={{ color: "#1877F2" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.35 0.06 255)" }}
                    >
                      Facebook
                    </span>
                  </button>
                  <button
                    type="button"
                    data-ocid="login.apple.button"
                    onClick={handleLogin}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl transition-all hover:shadow-md"
                    style={{
                      background: "oklch(0.99 0.003 220)",
                      border: "1px solid oklch(0.90 0.02 220)",
                      boxShadow: "0 1px 4px oklch(0.18 0.06 255 / 0.08)",
                    }}
                  >
                    <SiApple
                      className="w-4 h-4"
                      style={{ color: "oklch(0.35 0.06 255)" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.35 0.06 255)" }}
                    >
                      Apple
                    </span>
                  </button>
                </div>
              </div>
            </TabsContent>

            {/* ---- CREATE ACCOUNT ---- */}
            <TabsContent value="register">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="reg-username"
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.35 0.06 255)" }}
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.62 0.04 250)" }}
                    />
                    <Input
                      id="reg-username"
                      data-ocid="login.username.input"
                      type="text"
                      placeholder="choose a username"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      className="pl-9"
                      style={{
                        background: "oklch(0.95 0.015 230)",
                        borderColor: "oklch(0.87 0.03 230)",
                        color: "oklch(0.20 0.06 255)",
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="reg-password"
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.35 0.06 255)" }}
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.62 0.04 250)" }}
                    />
                    <Input
                      id="reg-password"
                      data-ocid="login.password.input"
                      type={showRegPw ? "text" : "password"}
                      placeholder="min. 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="pl-9 pr-10"
                      style={{
                        background: "oklch(0.95 0.015 230)",
                        borderColor: "oklch(0.87 0.03 230)",
                        color: "oklch(0.20 0.06 255)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.62 0.04 250)" }}
                    >
                      {showRegPw ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="reg-confirm"
                    className="text-sm font-medium"
                    style={{ color: "oklch(0.35 0.06 255)" }}
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                      style={{ color: "oklch(0.62 0.04 250)" }}
                    />
                    <Input
                      id="reg-confirm"
                      data-ocid="login.confirm_password.input"
                      type={showRegConfirm ? "text" : "password"}
                      placeholder="repeat password"
                      value={regConfirm}
                      onChange={(e) => setRegConfirm(e.target.value)}
                      className="pl-9 pr-10"
                      style={{
                        background: "oklch(0.95 0.015 230)",
                        borderColor: "oklch(0.87 0.03 230)",
                        color: "oklch(0.20 0.06 255)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirm((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "oklch(0.62 0.04 250)" }}
                    >
                      {showRegConfirm ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {regConfirm && regPassword !== regConfirm && (
                    <p
                      data-ocid="login.error_state"
                      className="text-xs"
                      style={{ color: "oklch(0.58 0.22 25)" }}
                    >
                      Passwords don&apos;t match
                    </p>
                  )}
                </div>

                <Button
                  data-ocid="login.submit.primary_button"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-12 font-semibold text-sm rounded-xl mt-1"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.55 0.22 280), oklch(0.72 0.20 190))",
                    color: "oklch(0.99 0.005 220)",
                    boxShadow: "0 4px 14px oklch(0.55 0.22 280 / 0.4)",
                  }}
                >
                  {isLoggingIn ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Social sign up */}
              <div className="mt-5">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="flex-1 border-t border-dashed"
                    style={{ borderColor: "oklch(0.85 0.03 240)" }}
                  />
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.62 0.04 250)" }}
                  >
                    Or sign up with
                  </span>
                  <div
                    className="flex-1 border-t border-dashed"
                    style={{ borderColor: "oklch(0.85 0.03 240)" }}
                  />
                </div>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    data-ocid="login.google.button"
                    onClick={handleLogin}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl transition-all hover:shadow-md"
                    style={{
                      background: "oklch(0.99 0.003 220)",
                      border: "1px solid oklch(0.90 0.02 220)",
                      boxShadow: "0 1px 4px oklch(0.18 0.06 255 / 0.08)",
                    }}
                  >
                    <SiGoogle
                      className="w-4 h-4"
                      style={{ color: "#EA4335" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.35 0.06 255)" }}
                    >
                      Google
                    </span>
                  </button>
                  <button
                    type="button"
                    data-ocid="login.facebook.button"
                    onClick={handleLogin}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl transition-all hover:shadow-md"
                    style={{
                      background: "oklch(0.99 0.003 220)",
                      border: "1px solid oklch(0.90 0.02 220)",
                      boxShadow: "0 1px 4px oklch(0.18 0.06 255 / 0.08)",
                    }}
                  >
                    <SiFacebook
                      className="w-4 h-4"
                      style={{ color: "#1877F2" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.35 0.06 255)" }}
                    >
                      Facebook
                    </span>
                  </button>
                  <button
                    type="button"
                    data-ocid="login.apple.button"
                    onClick={handleLogin}
                    className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl transition-all hover:shadow-md"
                    style={{
                      background: "oklch(0.99 0.003 220)",
                      border: "1px solid oklch(0.90 0.02 220)",
                      boxShadow: "0 1px 4px oklch(0.18 0.06 255 / 0.08)",
                    }}
                  >
                    <SiApple
                      className="w-4 h-4"
                      style={{ color: "oklch(0.35 0.06 255)" }}
                    />
                    <span
                      className="text-xs font-medium"
                      style={{ color: "oklch(0.35 0.06 255)" }}
                    >
                      Apple
                    </span>
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        <p
          className="text-center text-xs mt-5"
          style={{ color: "oklch(0.55 0.04 250)" }}
        >
          🔒 Powered by secure decentralized identity
        </p>
      </motion.div>
    </div>
  );
}

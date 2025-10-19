import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"

export default function AuthForm({ defaultMode = "login" }: { defaultMode?: "login" | "signup" }) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode)

  return (
    <div className="w-full">
      {/* Auth Mode Toggle */}
      <div className="flex p-1 mb-8 border rounded-lg bg-[var(--muted)]/30 border-[var(--border)] shadow-sm">
        <button
          onClick={() => setMode("login")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === "login"
              ? "bg-[var(--toyota-red)] text-white shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/50"
          }`}
        >
          Log In
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            mode === "signup"
              ? "bg-[var(--toyota-red)] text-white shadow-sm"
              : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]/50"
          }`}
        >
          Sign Up
        </button>
      </div>

      {/* Render the appropriate form component with smooth transitions */}
      <div className="w-full relative min-h-[650px] overflow-x-hidden">
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="w-full absolute top-0 left-0"
            >
              <LoginForm />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="w-full absolute top-0 left-0"
            >
              <SignupForm />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

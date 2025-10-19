import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import AuthBranding from "./components/auth-branding"
import AuthForm from "./components/auth-form"

export default function AuthPage({ defaultMode = "login" }: { defaultMode?: "login" | "signup" }) {
  const [searchParams] = useSearchParams()
  const [mode, setMode] = useState(defaultMode)

  // Allow mode to be set via URL parameter
  useEffect(() => {
    const modeParam = searchParams.get("mode")
    if (modeParam === "login" || modeParam === "signup") {
      setMode(modeParam)
    }
  }, [searchParams])

  return (
    <div className="flex flex-col h-screen md:flex-row overflow-hidden">
      {/* Branding Section - Hidden on mobile */}
      <div className="hidden md:block md:w-1/2 bg-background md:h-full">
        <AuthBranding />
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 bg-background flex items-start justify-center p-6 md:p-8 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <AuthForm defaultMode={mode} />
        </div>
      </div>
    </div>
  )
}

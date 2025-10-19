import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, AlertCircle, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { handleSupabaseSignupError, handleSupabaseGoogleError } from "@/lib/login-error-switch"
import { supabase } from "@/supabaseClient"

interface SignupFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

interface SignupFormErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function SignupForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<SignupFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<SignupFormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [googleSignInLoading, setGoogleSignInLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof SignupFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = () => {
    const newErrors: SignupFormErrors = {}

    // First name validation
    if (!formData.firstName) {
      newErrors.firstName = "First name is required"
    }

    // Last name validation
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required"
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({}) // Clear any previous errors

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }
        }
      })

      if (error) {
        const errorMessage = handleSupabaseSignupError(error)
        setErrors({ general: errorMessage })
        setIsSubmitting(false)
        return
      }

      if (data.user) {
        // Check if email confirmation is required
        if (!data.session) {
          // Email confirmation required
          setIsSuccess(true)
          setTimeout(() => {
            navigate("/auth/verify-email", { 
              state: { 
                email: formData.email,
                message: "Please check your email for a verification link before signing in."
              }
            })
          }, 2000)
        } else {
          // User is signed in immediately
          setIsSuccess(true)
          setTimeout(() => {
            navigate("/avatar")
          }, 1000)
        }
      }
    } catch (err) {
      console.error("Signup error:", err)
      setErrors({
        general: "An unexpected error occurred. Please try again.",
      })
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleSignInLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/avatar`
        }
      })

      if (error) {
        const errorMessage = handleSupabaseGoogleError(error)
        setErrors({ general: errorMessage })
        setGoogleSignInLoading(false)
        return
      }

      // OAuth redirect will handle the rest
    } catch (err) {
      console.error("Google sign-in error:", err)
      setErrors({
        general: "An unexpected error occurred with Google sign-in. Please try again.",
      })
      setGoogleSignInLoading(false)
    }
  }

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">Create your account</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          Start your car buying journey today
        </p>
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          {/* First Name Field */}
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-[var(--foreground)]">First Name</Label>
            <div className="relative">
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className={`bg-[var(--card)]/70 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors backdrop-blur-sm ${
                errors.firstName ? "border-red-400 focus-visible:ring-1 focus-visible:ring-red-400" : "focus-visible:border-[var(--toyota-red)] focus-visible:ring-1 focus-visible:ring-[var(--toyota-red)]/30"
              }`}
              disabled={isSubmitting || isSuccess}
            />
              {errors.firstName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
          </div>

          {/* Last Name Field */}
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-[var(--foreground)]">Last Name</Label>
            <div className="relative">
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className={`bg-[var(--card)]/70 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors backdrop-blur-sm ${
                errors.lastName ? "border-red-400 focus-visible:ring-1 focus-visible:ring-red-400" : "focus-visible:border-[var(--toyota-red)] focus-visible:ring-1 focus-visible:ring-[var(--toyota-red)]/30"
              }`}
              disabled={isSubmitting || isSuccess}
            />
              {errors.lastName && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              )}
            </div>
            {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[var(--foreground)]">Email</Label>
          <div className="relative">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={handleChange}
              className={`bg-[var(--card)]/70 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors backdrop-blur-sm ${
                errors.email ? "border-red-400 focus-visible:ring-1 focus-visible:ring-red-400" : "focus-visible:border-[var(--toyota-red)] focus-visible:ring-1 focus-visible:ring-[var(--toyota-red)]/30"
              }`}
              disabled={isSubmitting || isSuccess}
            />
            {errors.email && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-[var(--foreground)]">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              className={`bg-[var(--card)]/70 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors backdrop-blur-sm ${
                errors.password ? "border-red-400 focus-visible:ring-1 focus-visible:ring-red-400" : "focus-visible:border-[var(--toyota-red)] focus-visible:ring-1 focus-visible:ring-[var(--toyota-red)]/30"
              }`}
              disabled={isSubmitting || isSuccess}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" /> : <Eye className="w-5 h-5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" />}
            </button>
            {errors.password && (
              <div className="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          {!errors.password && (
            <p className="text-xs text-[var(--muted-foreground)]">Password must be at least 8 characters</p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="text-[var(--foreground)]">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`bg-[var(--card)]/70 border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] transition-colors backdrop-blur-sm ${
                errors.confirmPassword ? "border-red-400 focus-visible:ring-1 focus-visible:ring-red-400" : "focus-visible:border-[var(--toyota-red)] focus-visible:ring-1 focus-visible:ring-[var(--toyota-red)]/30"
              }`}
              disabled={isSubmitting || isSuccess}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" />
              ) : (
                <Eye className="w-5 h-5 text-[var(--muted-foreground)] hover:text-[var(--foreground)]" />
              )}
            </button>
            {errors.confirmPassword && (
              <div className="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
            )}
          </div>
          {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {errors.general}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[var(--toyota-red)] hover:bg-[var(--toyota-red)]/90 text-white transition-colors shadow-sm"
          disabled={isSubmitting || isSuccess}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Creating account...
            </span>
          ) : isSuccess ? (
            <span className="flex items-center">
              <Check className="w-5 h-5 mr-2" />
              Success!
            </span>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-[var(--muted-foreground)] bg-transparent">Or continue with</span>
          </div>
        </div>

        {/* Social Login */}
        <div className="w-full">
          <Button
            type="button"
            className="w-full border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--card)]/80 text-[var(--foreground)] transition-colors shadow-sm"
            disabled={isSubmitting || isSuccess || googleSignInLoading}
            onClick={handleGoogleSignIn}
          >
            {googleSignInLoading ? (
              <span className="flex items-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Signing in with Google...
              </span>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>
        </div>

        {/* Terms and Conditions */}
        <p className="text-xs text-center text-[var(--muted-foreground)]">
          By creating an account, you agree to our{" "}
          <Link to="/terms" className="text-[var(--toyota-red)] hover:text-[var(--toyota-red)]/80 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-[var(--toyota-red)] hover:text-[var(--toyota-red)]/80 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>

        {/* Switch Mode Link */}
        <div className="text-sm text-center text-[var(--muted-foreground)]">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-[var(--toyota-red)] hover:text-[var(--toyota-red)]/80 hover:underline">
            Log in
          </Link>
        </div>
      </form>
    </div>
  )
} 
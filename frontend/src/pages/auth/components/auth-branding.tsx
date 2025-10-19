import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Car, DollarSign, Calculator, TrendingDown } from "lucide-react"

export default function AuthBranding() {
  const [isMounted, setIsMounted] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Only run animations after component is mounted to avoid hydration issues
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center h-full p-8 overflow-hidden bg-gradient-to-br from-[#1A1A1A] via-[#1F1F1F] to-[#1A1A1A]">
      {/* Subtle overlay pattern - conditionally rendered for performance */}
      {(isDesktop || !isMounted) && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full text-[var(--toyota-red)]"
          >
            <pattern
              id="toyotaPattern"
              patternUnits="userSpaceOnUse"
              width="40"
              height="40"
              patternTransform="rotate(25)"
            >
              <circle cx="10" cy="10" r="1" fill="currentColor" />
              <circle cx="30" cy="30" r="1.5" fill="currentColor" />
              <line x1="10" y1="10" x2="30" y2="30" stroke="currentColor" strokeWidth="0.5" />
              <rect x="5" y="5" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="0.3" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#toyotaPattern)" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-md text-center">
        {isMounted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 flex items-center space-x-3"
          >
            <Car className="w-12 h-12 md:w-16 md:h-16 text-[var(--toyota-red)]" />
            <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-[var(--toyota-red)]" />
          </motion.div>
        ) : (
          <div className="mb-6 flex items-center space-x-3">
            <Car className="w-12 h-12 md:w-16 md:h-16 text-[var(--toyota-red)]" />
            <DollarSign className="w-8 h-8 md:w-10 md:h-10 text-[var(--toyota-red)]" />
          </div>
        )}

        {isMounted ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <h2 className="mb-4 text-xl md:text-2xl font-semibold text-[var(--foreground)]">Toyota Finance Assistant</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              Find your perfect Toyota with AI-powered recommendations. 
              Get personalized financing options, trim comparisons, and expert guidance—all in one place.
            </p>
          </motion.div>
        ) : (
          <div>
            <h2 className="mb-4 text-xl md:text-2xl font-semibold text-[var(--foreground)]">Toyota Finance Assistant</h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              Find your perfect Toyota with AI-powered recommendations. 
              Get personalized financing options, trim comparisons, and expert guidance—all in one place.
            </p>
          </div>
        )}

        {/* Feature highlights - conditionally rendered for mobile optimization */}
        {(isDesktop || !isMounted) && (
          <div
            className={`mt-12 space-y-4 ${
              isMounted ? "animate-fade-in" : ""
            }`}
          >
            <div className="flex items-center space-x-3 p-3 bg-[var(--card)]/50 backdrop-blur-sm rounded-lg border border-[var(--border)] shadow-sm">
              <Car className="w-5 h-5 text-[var(--toyota-red)]" />
              <span className="text-sm text-[var(--foreground)]">Smart vehicle recommendations</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-[var(--card)]/50 backdrop-blur-sm rounded-lg border border-[var(--border)] shadow-sm">
              <Calculator className="w-5 h-5 text-[var(--toyota-red)]" />
              <span className="text-sm text-[var(--foreground)]">Best loan & lease options</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-[var(--card)]/50 backdrop-blur-sm rounded-lg border border-[var(--border)] shadow-sm">
              <TrendingDown className="w-5 h-5 text-[var(--toyota-red)]" />
              <span className="text-sm text-[var(--foreground)]">Compare trims & features</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

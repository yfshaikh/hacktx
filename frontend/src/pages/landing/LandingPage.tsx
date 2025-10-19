import { AnimatedBeamMultipleOutput } from "@/components/AnimatedBeamMultiple"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--toyota-red)]/10 via-background to-background" />
        
        <div className="container relative mx-auto px-4 py-20">
          <div className="flex flex-col items-center text-center">
            {/* Logo/Brand */}
            <div className="mb-8">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-[var(--toyota-red)] to-[var(--toyota-red-light)] bg-clip-text text-transparent">
                Toyota Finance Assistant
              </h1>
            </div>

            {/* Tagline */}
            <p className="max-w-2xl text-xl text-muted-foreground mb-12">
              Your AI-powered car financing companion. Connect your bank, share your preferences, 
              and get personalized Toyota recommendations tailored to your budget.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 mb-16">
              <Button 
                size="lg"
                className="bg-[var(--toyota-red)] hover:bg-[var(--toyota-red-dark)] text-white px-8 py-6 text-lg"
                onClick={() => navigate("/login")}
              >
                Get Started
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-[var(--toyota-red)] text-[var(--toyota-red)] hover:bg-[var(--toyota-red)]/10 px-8 py-6 text-lg"
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI analyzes your financial profile to find the perfect Toyota for you
            </p>
          </div>

          {/* Animated Flow Visualization */}
          <div className="max-w-5xl mx-auto">
            <AnimatedBeamMultipleOutput />
          </div>

          {/* Steps breakdown */}
          <div className="grid md:grid-cols-3 gap-8 mt-16 max-w-5xl mx-auto">
            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="w-16 h-16 bg-[var(--toyota-red)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[var(--toyota-red)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Share Your Finances</h3>
              <p className="text-muted-foreground">
                Securely connect your bank account and share your income, credit score, and budget
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="w-16 h-16 bg-[var(--toyota-red)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[var(--toyota-red)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Analysis</h3>
              <p className="text-muted-foreground">
                Our intelligent system analyzes your profile to determine the best financing options
              </p>
            </div>

            <div className="text-center p-6 rounded-lg bg-card border border-border">
              <div className="w-16 h-16 bg-[var(--toyota-red)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[var(--toyota-red)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
                  <circle cx="6.5" cy="16.5" r="2.5" />
                  <circle cx="16.5" cy="16.5" r="2.5" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Recommendations</h3>
              <p className="text-muted-foreground">
                Receive personalized Toyota models, trim options, and financing plans that fit your budget
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Smart financing made simple with cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="p-6">
              <div className="text-3xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold mb-2">Bank-Level Security</h3>
              <p className="text-muted-foreground text-sm">
                Your financial data is encrypted and protected with industry-leading security protocols
              </p>
            </div>

            <div className="p-6">
              <div className="text-3xl mb-4">⚡</div>
              <h3 className="text-lg font-semibold mb-2">Instant Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Get personalized recommendations in seconds, not hours
              </p>
            </div>

            <div className="p-6">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Perfect Match</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered matching ensures you find the right Toyota for your lifestyle
              </p>
            </div>

            <div className="p-6">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-lg font-semibold mb-2">Best Rates</h3>
              <p className="text-muted-foreground text-sm">
                Compare financing options to get the most competitive rates available
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[var(--toyota-red)] to-[var(--toyota-red-dark)]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Toyota?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their dream car with personalized financing
          </p>
          <Button 
            size="lg"
            variant="secondary"
            className="bg-white text-[var(--toyota-red)] hover:bg-white/90 px-8 py-6 text-lg"
            onClick={() => navigate("/login")}
          >
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">
              © 2025 Toyota Finance Assistant. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a>
              <a href="#" className="text-muted-foreground hover:text-foreground">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

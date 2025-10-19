import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Percent,
  ChevronRight,
  X,
  CreditCard,
  FileText,
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import type { FinancingOptions } from "../lib/api/agents";

interface LoanOptionsCardProps {
  data: FinancingOptions | null;
  isOpen: boolean;
  onClose: () => void;
  position?: number; // Position index for stacking
}

export function LoanOptionsCard({ data, isOpen, onClose, position = 0 }: LoanOptionsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data) return null;

  // Calculate offset based on position to prevent overlap
  const offsetY = position * 100; // Vertical offset
  const offsetX = position * 20; // Slight horizontal offset

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 150, scale: 0.85, rotateY: 25 }}
          animate={{ 
            opacity: 1, 
            x: offsetX, 
            y: offsetY,
            scale: isExpanded ? 1 : 0.92,
            rotateY: isExpanded ? 0 : 12
          }}
          exit={{ opacity: 0, x: 150, scale: 0.85, rotateY: 25 }}
          transition={{ type: "spring", damping: 22, stiffness: 180 }}
          className={`fixed right-12 top-1/2 -translate-y-1/2 z-40 border border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-xl shadow-2xl rounded-2xl transition-all duration-300 ${
            isExpanded ? 'w-[550px]' : 'w-80'
          }`}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
            boxShadow: '0 20px 60px var(--glass-glow-strong), 0 0 0 1px var(--border)',
          }}
        >
          <div className="flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--toyota-red)]" />
                <h3 className="font-semibold text-[var(--foreground)]">
                  {isExpanded ? 'Financing Options' : 'Financing'}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 hover:bg-[var(--muted)]"
                >
                  <ChevronRight 
                    className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 hover:bg-[var(--muted)]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Compact View */}
            {!isExpanded && (
              <div className="p-4 space-y-4">
                {/* Vehicle Info */}
                {data.vehicle && (
                  <div className="space-y-1">
                    <h4 className="font-bold text-[var(--foreground)]">
                      {data.vehicle}
                    </h4>
                    {data.vehicle_price && (
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {formatCurrency(data.vehicle_price)}
                      </div>
                    )}
                  </div>
                )}

                {/* Quick Comparison */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-[var(--border)] p-2 bg-[var(--muted)]/50">
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-0.5">
                      <DollarSign className="h-3 w-3" />
                      Loan
                    </div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {formatCurrency(data.best_loan.monthly_payment)}/mo
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] p-2 bg-[var(--muted)]/50">
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-0.5">
                      <FileText className="h-3 w-3" />
                      Lease
                    </div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {formatCurrency(data.best_lease.monthly_payment)}/mo
                    </div>
                  </div>
                </div>

                {/* Recommendation Badge */}
                {data.recommendation && (
                  <div className="flex items-center justify-center">
                    <Badge className="bg-[var(--toyota-red)] text-[var(--toyota-white)]">
                      Recommended: {data.recommendation.toUpperCase()}
                    </Badge>
                  </div>
                )}

                {/* Expand Hint */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--toyota-red)] transition-colors"
                  >
                    Click to expand for full details →
                  </button>
                </div>
              </div>
            )}

            {/* Expanded View */}
            {isExpanded && (
              <div 
                className="flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--border)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[var(--toyota-red)]/50" 
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--border) transparent'
                }}
              >
                <div className="space-y-6 p-6">
                  {/* Vehicle Info */}
                  {data.vehicle && (
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-[var(--foreground)]">
                        {data.vehicle}
                      </h3>
                      {data.vehicle_price && (
                        <div className="text-lg font-semibold text-[var(--muted-foreground)]">
                          Vehicle Price: {formatCurrency(data.vehicle_price)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommendation */}
                  {data.recommendation && data.why && (
                    <>
                      <div className="rounded-lg border border-[var(--toyota-red)]/20 bg-[var(--toyota-red)]/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-[var(--toyota-red)]" />
                          <span className="font-semibold text-[var(--foreground)]">
                            Recommendation: {data.recommendation.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {data.why}
                        </p>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Loan Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-[var(--success)]" />
                      Loan Option
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Monthly Payment</div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {formatCurrency(data.best_loan.monthly_payment)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mb-1">
                          <Percent className="h-3 w-3" />
                          APR
                        </div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {data.best_loan.apr}%
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mb-1">
                          <Calendar className="h-3 w-3" />
                          Term
                        </div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {data.best_loan.term_months} months
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Down Payment</div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {formatCurrency(data.best_loan.down_payment)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Total Interest</div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {formatCurrency(data.best_loan.total_interest)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Total Cost</div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {formatCurrency(data.best_loan.total_cost)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Lease Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[var(--info)]" />
                      Lease Option
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Monthly Payment</div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {formatCurrency(data.best_lease.monthly_payment)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mb-1">
                          <Percent className="h-3 w-3" />
                          APR
                        </div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {data.best_lease.apr}%
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mb-1">
                          <Calendar className="h-3 w-3" />
                          Term
                        </div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {data.best_lease.term_months} months
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Total Payments</div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {formatCurrency(data.best_lease.total_lease_payments)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Residual Value</div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {formatCurrency(data.best_lease.residual_value)}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Buyout Cost</div>
                        <div className="text-lg font-bold text-[var(--foreground)]">
                          {formatCurrency(data.best_lease.buyout_cost)}
                        </div>
                      </div>
                      <div className="col-span-2 rounded-lg border border-[var(--border)] p-3 bg-[var(--info)]/5">
                        <div className="text-sm text-[var(--muted-foreground)] mb-1">Total if Purchased</div>
                        <div className="text-xl font-bold text-[var(--foreground)]">
                          {formatCurrency(data.best_lease.total_if_purchased)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <Button className="w-full bg-[var(--toyota-red)] hover:bg-[var(--toyota-red-dark)] text-[var(--toyota-white)]">
                      Apply for Financing
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                    >
                      Contact Dealer
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Car,
  Star,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  X,
  Package,
  Calendar,
} from "lucide-react";
import type { TrimRecommendations } from "../lib/api/agents";

interface TrimRecommendationCardProps {
  data: TrimRecommendations | null;
  isOpen: boolean;
  onClose: () => void;
  position?: number; // Position index for stacking
}

export function TrimRecommendationCard({ 
  data, 
  isOpen, 
  onClose, 
  position = 0 
}: TrimRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedTrimIndex, setSelectedTrimIndex] = useState(0);

  if (!data || !data.ranked_trims || data.ranked_trims.length === 0) return null;

  // Calculate offset based on position to prevent overlap
  const offsetY = position * 100;
  const offsetX = position * 20;

  const currentTrim = data.ranked_trims[selectedTrimIndex];

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
                <Star className="h-5 w-5 text-[var(--toyota-red)]" />
                <h3 className="font-semibold text-[var(--foreground)]">
                  {isExpanded ? 'Trim Recommendations' : 'Top Match'}
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
                {/* Top Match */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[var(--toyota-red)] text-[var(--toyota-white)]">
                      #{1} Match
                    </Badge>
                  </div>
                  <h4 className="font-bold text-[var(--foreground)]">
                    {currentTrim.year} {currentTrim.model}
                  </h4>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {currentTrim.trim}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-[var(--border)] p-2 bg-[var(--success)]/10">
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-0.5">
                      <CheckCircle2 className="h-3 w-3 text-[var(--success)]" />
                      Features
                    </div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {currentTrim.included_desired_features.length} matched
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] p-2 bg-[var(--muted)]/50">
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-0.5">
                      <Package className="h-3 w-3" />
                      Packages
                    </div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {currentTrim.trim_packages.length}
                    </div>
                  </div>
                </div>

                {/* More Options Badge */}
                {data.ranked_trims.length > 1 && (
                  <div className="flex items-center justify-center">
                    <Badge variant="outline" className="border-[var(--border)]">
                      +{data.ranked_trims.length - 1} more options
                    </Badge>
                  </div>
                )}

                {/* Expand Hint */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--toyota-red)] transition-colors"
                  >
                    Click to expand for all recommendations →
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
                  {/* Trim Selector */}
                  {data.ranked_trims.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {data.ranked_trims.map((trim, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedTrimIndex(index)}
                          className={`flex-shrink-0 px-3 py-2 rounded-lg border transition-colors ${
                            selectedTrimIndex === index
                              ? 'border-[var(--toyota-red)] bg-[var(--toyota-red)]/10 text-[var(--foreground)]'
                              : 'border-[var(--border)] bg-[var(--muted)]/50 text-[var(--muted-foreground)] hover:border-[var(--toyota-red)]/50'
                          }`}
                        >
                          <div className="text-xs font-medium">#{index + 1}</div>
                          <div className="text-xs whitespace-nowrap">{trim.model}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Current Trim Details */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--foreground)]">
                          {currentTrim.year} {currentTrim.model}
                        </h3>
                        <div className="text-lg text-[var(--muted-foreground)]">
                          {currentTrim.trim}
                        </div>
                      </div>
                      <Badge className="bg-[var(--toyota-red)] text-[var(--toyota-white)]">
                        #{selectedTrimIndex + 1} Match
                      </Badge>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
                          <Calendar className="h-4 w-4" />
                          Year
                        </div>
                        <div className="font-medium text-[var(--foreground)]">
                          {currentTrim.year}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
                          <Car className="h-4 w-4" />
                          Model
                        </div>
                        <div className="font-medium text-[var(--foreground)]">
                          {currentTrim.model}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Packages */}
                  {currentTrim.trim_packages.length > 0 && (
                    <>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                          <Package className="h-5 w-5 text-[var(--toyota-red)]" />
                          Recommended Packages
                        </h4>
                        <div className="space-y-2">
                          {currentTrim.trim_packages.map((pkg, index) => (
                            <div
                              key={index}
                              className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50"
                            >
                              <div className="font-medium text-[var(--foreground)]">{pkg}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Included Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
                      Included Features ({currentTrim.included_desired_features.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentTrim.included_desired_features.map((feature, index) => (
                        <Badge
                          key={feature + index}
                          className="bg-[var(--success)]/10 text-[var(--success)] border-[var(--success)]/20"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Feature Gaps */}
                  {currentTrim.feature_gaps.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-[var(--warning)]" />
                          Missing Features ({currentTrim.feature_gaps.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentTrim.feature_gaps.map((feature, index) => (
                            <Badge
                              key={feature + index}
                              variant="outline"
                              className="border-[var(--warning)]/20 text-[var(--warning)] bg-[var(--warning)]/5"
                            >
                              <AlertCircle className="h-3 w-3 mr-1" />
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <Button className="w-full bg-[var(--toyota-red)] hover:bg-[var(--toyota-red-dark)] text-[var(--toyota-white)]">
                      View {currentTrim.model} Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                    >
                      Compare All Matches
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


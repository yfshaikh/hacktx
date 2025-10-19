import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Car,
  Fuel,
  Gauge,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  ChevronRight,
  X,
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import type { VehicleScore } from "../lib/types";
import Spinner from "./Spinner";

interface CarVRCardProps {
  car: VehicleScore | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CarVRCard({ car, isOpen, onClose }: CarVRCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [colorSelected, setColorSelected] = useState(0);

  if (!car) return null;

  // Check if car has images
  const hasImages = car.vehicle.imageCount && car.vehicle.imageCount > 0;
  
  // Get valid colors (only those with images)
  const getValidColors = () => {
    if (!car.vehicle.colorCodes || !hasImages) return [];
    const colorCodesArray = car.vehicle.colorCodes.split(",");
    const colorHexArray = car.vehicle.colorHexCodes?.split(",") || [];
    
    // Filter colors that have corresponding hex codes and are within image count range
    return colorCodesArray
      .map((code, index) => ({
        code: code.trim(),
        hex: colorHexArray[index]?.trim(),
        index
      }))
      .filter(color => color.hex); // Only include colors with hex codes
  };
  
  const validColors = getValidColors();

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 150, scale: 0.85, rotateY: 25 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            scale: isExpanded ? 1 : 0.92,
            rotateY: isExpanded ? 0 : 12
          }}
          exit={{ opacity: 0, x: 150, scale: 0.85, rotateY: 25 }}
          transition={{ type: "spring", damping: 22, stiffness: 180 }}
          className={`fixed right-12 top-1/2 -translate-y-1/2 z-40 border border-[var(--border)] bg-[var(--card)]/95 backdrop-blur-xl shadow-2xl rounded-2xl transition-all duration-300 ${
            isExpanded ? 'w-[500px]' : 'w-80'
          }`}
          style={{
            transformStyle: "preserve-3d",
            transformOrigin: "left center",
            boxShadow: '0 20px 60px var(--glass-glow-strong), 0 0 0 1px var(--border)',
          }}
        >
          <div className="flex flex-col max-h-[80vh]">
            {/* Header with Close/Expand */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] flex-shrink-0">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-[var(--toyota-red)]" />
                <h3 className="font-semibold text-[var(--foreground)]">
                  {isExpanded ? 'Car Details' : 'Match Found'}
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
                {/* Car Image - Only show if images exist */}
                {hasImages && (
                  <div className="relative h-40 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                    <Spinner
                      colorCodes={car.vehicle.colorCodes ?? ""}
                      colorIndex={colorSelected}
                      model={car.vehicle.model ?? ""}
                      year={car.vehicle.year ?? "2024"}
                      modelTag={car.vehicle.modelTag ?? ""}
                      modelGrade={car.vehicle.modelGrade ?? ""}
                      imageCountOverride={car.vehicle.imageCount}
                      card={false}
                    />
                    
                    {/* Match Badge */}
                    <div className="absolute left-2 top-2">
                      <Badge className="bg-[var(--toyota-red)] text-[var(--toyota-white)] px-2 py-1 text-xs">
                        {Math.round(car.totalScore)}% Match
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Car Info */}
                <div className="space-y-1">
                  <h4 className="font-bold text-[var(--foreground)]">
                    {car.vehicle.year} {car.vehicle.make} {car.vehicle.model}
                  </h4>
                  <div className="text-lg font-bold text-[var(--toyota-red)]">
                    {formatCurrency(car.vehicle.msrp || 0)}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-[var(--border)] p-2 bg-[var(--muted)]/50">
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-0.5">
                      <Fuel className="h-3 w-3" />
                      Fuel
                    </div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {car.vehicle.fuelType || "Gasoline"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-[var(--border)] p-2 bg-[var(--muted)]/50">
                    <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] mb-0.5">
                      <Gauge className="h-3 w-3" />
                      MPG
                    </div>
                    <div className="text-sm font-medium text-[var(--foreground)]">
                      {car.vehicle.combinedMpgForFuelType1 || "N/A"}
                    </div>
                  </div>
                </div>

                {/* Expand Hint */}
                <div className="text-center pt-2">
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="text-xs text-[var(--muted-foreground)] hover:text-[var(--toyota-red)] transition-colors"
                  >
                    Click to expand for more details →
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
                  {/* Car Image - Only show if images exist */}
                  {hasImages && (
                    <div className="relative h-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                      <Spinner
                        colorCodes={car.vehicle.colorCodes ?? ""}
                        colorIndex={colorSelected}
                        model={car.vehicle.model ?? ""}
                        year={car.vehicle.year ?? "2024"}
                        modelTag={car.vehicle.modelTag ?? ""}
                        modelGrade={car.vehicle.modelGrade ?? ""}
                        imageCountOverride={car.vehicle.imageCount}
                        card={false}
                      />
                      
                      {/* Match Badge */}
                      <div className="absolute left-3 top-3">
                        <Badge className="bg-[var(--toyota-red)] text-[var(--toyota-white)] px-3 py-1">
                          {Math.round(car.totalScore)}% Match
                        </Badge>
                      </div>
                    </div>
                  )}

                  {/* Car Info */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-[var(--foreground)]">
                      {car.vehicle.year} {car.vehicle.make} {car.vehicle.model}
                    </h3>
                    <div className="text-2xl font-bold text-[var(--toyota-red)]">
                      {formatCurrency(car.vehicle.msrp || 0)}
                    </div>
                    {car.vehicle.vehicleSizeClass && (
                      <div className="text-sm text-[var(--muted-foreground)]">
                        {car.vehicle.vehicleSizeClass}
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
                        <Fuel className="h-4 w-4" />
                        Fuel Type
                      </div>
                      <div className="font-medium text-[var(--foreground)]">
                        {car.vehicle.fuelType || "Gasoline"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
                        <Gauge className="h-4 w-4" />
                        Transmission
                      </div>
                      <div className="font-medium text-[var(--foreground)]">
                        {car.vehicle.transmission || "Automatic"}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
                        <Users className="h-4 w-4" />
                        Passengers
                      </div>
                      <div className="font-medium text-[var(--foreground)]">
                        {car.metadata.passengerAnalysis?.actualCapacity || 5}
                      </div>
                    </div>
                    <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-1">
                        <Calendar className="h-4 w-4" />
                        Year
                      </div>
                      <div className="font-medium text-[var(--foreground)]">
                        {car.vehicle.year}
                      </div>
                    </div>
                  </div>

                  {/* Additional Vehicle Details */}
                  {(car.vehicle.combinedMpgForFuelType1 || car.vehicle.cylinders || car.vehicle.drive) && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-[var(--foreground)]">Performance & Efficiency</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {car.vehicle.combinedMpgForFuelType1 && (
                            <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                              <div className="text-sm text-[var(--muted-foreground)] mb-1">Combined MPG</div>
                              <div className="font-medium text-[var(--foreground)]">
                                {car.vehicle.combinedMpgForFuelType1}
                              </div>
                            </div>
                          )}
                          {car.vehicle.cylinders && (
                            <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                              <div className="text-sm text-[var(--muted-foreground)] mb-1">Cylinders</div>
                              <div className="font-medium text-[var(--foreground)]">
                                {car.vehicle.cylinders}
                              </div>
                            </div>
                          )}
                          {car.vehicle.drive && (
                            <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                              <div className="text-sm text-[var(--muted-foreground)] mb-1">Drive Type</div>
                              <div className="font-medium text-[var(--foreground)]">
                                {car.vehicle.drive}
                              </div>
                            </div>
                          )}
                          {car.vehicle.engineDisplacement && (
                            <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                              <div className="text-sm text-[var(--muted-foreground)] mb-1">Engine Size</div>
                              <div className="font-medium text-[var(--foreground)]">
                                {car.vehicle.engineDisplacement}L
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  
                  {/* MPG Details */}
                  {(car.vehicle.cityMpgForFuelType1 || car.vehicle.highwayMpgForFuelType1) && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-[var(--foreground)]">Fuel Economy</h4>
                        <div className="grid grid-cols-2 gap-3">
                          {car.vehicle.cityMpgForFuelType1 && (
                            <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                              <div className="text-sm text-[var(--muted-foreground)] mb-1">City MPG</div>
                              <div className="font-medium text-[var(--foreground)]">
                                {car.vehicle.cityMpgForFuelType1}
                              </div>
                            </div>
                          )}
                          {car.vehicle.highwayMpgForFuelType1 && (
                            <div className="rounded-lg border border-[var(--border)] p-3 bg-[var(--muted)]/50">
                              <div className="text-sm text-[var(--muted-foreground)] mb-1">Highway MPG</div>
                              <div className="font-medium text-[var(--foreground)]">
                                {car.vehicle.highwayMpgForFuelType1}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Colors - Only show if there are valid colors */}
                  {validColors.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <h4 className="font-semibold text-[var(--foreground)]">Available Colors</h4>
                        <div className="flex flex-wrap gap-3">
                          {validColors.map((color) => {
                            const isGradient = color.hex.startsWith("(");
                            const gradientColors = isGradient
                              ? color.hex.replace("(", "").replace(")", "").split(" ").map((code) => code.trim())
                              : [];

                            return isGradient ? (
                              <div
                                key={color.code + color.index}
                                className={`h-6 w-6 rounded-full cursor-pointer border-2 transition-all ${
                                  colorSelected === color.index 
                                    ? 'border-[var(--toyota-red)] scale-110' 
                                    : 'border-[var(--border)] hover:border-[var(--toyota-red)]/50'
                                }`}
                                onClick={() => setColorSelected(color.index)}
                                style={{
                                  background: `linear-gradient(-45deg, #${gradientColors[0]} 50%, #${gradientColors[1]} 50%)`,
                                }}
                              />
                            ) : (
                              <div
                                key={color.code + color.index}
                                className={`h-6 w-6 rounded-full cursor-pointer border-2 transition-all ${
                                  colorSelected === color.index 
                                    ? 'border-[var(--toyota-red)] scale-110' 
                                    : 'border-[var(--border)] hover:border-[var(--toyota-red)]/50'
                                }`}
                                onClick={() => setColorSelected(color.index)}
                                style={{
                                  backgroundColor: `#${color.hex}`,
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Key Features */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[var(--foreground)]">Key Features</h4>
                    <div className="flex flex-wrap gap-2">
                      {car.metadata.matchingFeatures.map((feature, index) => (
                        <Badge
                          key={feature + index}
                          variant="secondary"
                          className="bg-[var(--toyota-red)]/10 text-[var(--toyota-red)] border-[var(--toyota-red)]/20"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Match Analysis */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[var(--foreground)]">Match Analysis</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-[var(--toyota-red)]/10 p-2">
                            <DollarSign className="h-4 w-4 text-[var(--toyota-red)]" />
                          </div>
                          <div>
                            <div className="font-medium text-[var(--foreground)]">Price Match</div>
                            <div className="text-sm text-[var(--muted-foreground)]">
                              {car.metadata.priceAnalysis.isWithinBudget
                                ? "Within your budget"
                                : "Slightly above your budget"}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-[var(--border)] text-[var(--foreground)]">
                          {Math.round(car.factors.priceCompatibility)}%
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-[var(--toyota-red)]/10 p-2">
                            <Car className="h-4 w-4 text-[var(--toyota-red)]" />
                          </div>
                          <div>
                            <div className="font-medium text-[var(--foreground)]">Feature Match</div>
                            <div className="text-sm text-[var(--muted-foreground)]">
                              {car.metadata.matchingFeatures.length} matching features
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-[var(--border)] text-[var(--foreground)]">
                          {Math.round(car.factors.featureAlignment)}%
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                        <div className="flex items-center gap-3">
                          <div className="rounded-full bg-[var(--success)]/10 p-2">
                            <MapPin className="h-4 w-4 text-[var(--success)]" />
                          </div>
                          <div>
                            <div className="font-medium text-[var(--foreground)]">Location</div>
                            <div className="text-sm text-[var(--muted-foreground)]">Available nearby</div>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-[var(--border)] text-[var(--success)]">
                          Local Dealer
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <Button className="w-full bg-[var(--toyota-red)] hover:bg-[var(--toyota-red-dark)] text-[var(--toyota-white)]">
                      Schedule Test Drive
                    </Button>
                    {car.vehicle.url && (
                      <Button 
                        variant="outline" 
                        className="w-full border-[var(--border)] hover:bg-[var(--muted)] text-[var(--foreground)]"
                        onClick={() => window.open(car.vehicle.url, '_blank')}
                      >
                        View Full Details
                      </Button>
                    )}
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


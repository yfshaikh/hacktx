import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  Car,
  X,
  Fuel,
  Gauge,
  Users,
  Calendar,
  DollarSign,
  MapPin,
} from "lucide-react";
import { formatCurrency } from "../lib/utils";
import type { VehicleScore } from "../lib/types";
import Spinner from "./Spinner";

interface CarSidebarProps {
  car: VehicleScore | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CarSidebar({ car, isOpen, onClose }: CarSidebarProps) {
  const [colorSelected, setColorSelected] = useState(0);

  if (!car) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="fixed right-0 top-0 z-50 h-screen w-96 border-l border-[var(--border)] bg-[var(--card)] shadow-2xl"
          style={{
            boxShadow: '-10px 0 40px var(--glass-glow-strong)',
          }}
        >
          <div className="flex h-full flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4 flex-shrink-0">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Car Details</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="shrink-0 hover:bg-[var(--muted)]"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div 
              className="flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[var(--border)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-[var(--toyota-red)]/50" 
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--border) transparent'
              }}
            >
              <div className="space-y-6 p-6 pb-4">
                {/* Car Image */}
                <div className="relative h-48 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--muted)]">
                  {(() => {
                    console.log("🚗 CarSidebar Vehicle Data:", {
                      model: car.vehicle.model,
                      colorCodes: car.vehicle.colorCodes,
                      modelTag: car.vehicle.modelTag,
                      modelGrade: car.vehicle.modelGrade,
                      imageCount: car.vehicle.imageCount,
                      has3D: car.vehicle.has3D
                    });
                    return null;
                  })()}
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

                <Separator />

                {/* Colors */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-[var(--foreground)]">Available Colors</h4>
                  <div className="flex flex-wrap gap-3">
                    {car.vehicle.colorCodes
                      ?.split(",")
                      .map((color, index) => {
                        const colorHexCodes = car.vehicle.colorHexCodes?.split(",");
                        const colorHex = colorHexCodes ? colorHexCodes[index]?.trim() : null;

                        if (!colorHex) return null;

                        const isGradient = colorHex.startsWith("(");
                        const gradientColors = isGradient
                          ? colorHex.replace("(", "").replace(")", "").split(" ").map((code) => code.trim())
                          : [];

                        return isGradient ? (
                          <div
                            key={color + index}
                            className={`h-6 w-6 rounded-full cursor-pointer border-2 transition-all ${
                              colorSelected === index 
                                ? 'border-[var(--toyota-red)] scale-110' 
                                : 'border-[var(--border)] hover:border-[var(--toyota-red)]/50'
                            }`}
                            onClick={() => setColorSelected(index)}
                            style={{
                              background: `linear-gradient(-45deg, #${gradientColors[0]} 50%, #${gradientColors[1]} 50%)`,
                            }}
                          />
                        ) : (
                          <div
                            key={color + index}
                            className={`h-6 w-6 rounded-full cursor-pointer border-2 transition-all ${
                              colorSelected === index 
                                ? 'border-[var(--toyota-red)] scale-110' 
                                : 'border-[var(--border)] hover:border-[var(--toyota-red)]/50'
                            }`}
                            onClick={() => setColorSelected(index)}
                            style={{
                              backgroundColor: `#${colorHex}`,
                            }}
                          />
                        );
                      })}
                  </div>
                </div>

                <Separator />

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
                      <Badge variant="outline" className="border-[var(--border)]">
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
                      <Badge variant="outline" className="border-[var(--border)]">
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
              </div>
            </div>

            {/* Footer Actions */}
            <div className="border-t border-[var(--border)] p-4 flex-shrink-0">
              <div className="space-y-3">
                <Button className="w-full bg-[var(--toyota-red)] hover:bg-[var(--toyota-red-dark)] text-[var(--toyota-white)]">
                  Schedule Test Drive
                </Button>
                {car.vehicle.url && (
                  <Button 
                    variant="outline" 
                    className="w-full border-[var(--border)] hover:bg-[var(--muted)]"
                    onClick={() => window.open(car.vehicle.url, '_blank')}
                  >
                    View Full Details
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

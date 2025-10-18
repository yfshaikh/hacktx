import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Creates a properly formatted car data object for the displayCarInfo client tool
 */
export function createCarData(params: {
  id?: string;
  vehicleId?: string;
  make: string;
  model: string;
  year: string; // year is string in your schema
  msrp?: number;
  fuelType?: string;
  transmission?: string;
  colorCodes?: string;
  colorHexCodes?: string;
  colorNames?: string;
  modelTag?: string;
  modelGrade?: string;
  imageCount?: number;
  url?: string;
  totalScore?: number;
  matchingFeatures?: string[];
  priceAnalysis?: {
    isWithinBudget: boolean;
    percentageFromBudget: number;
  };
  passengerCapacity?: number;
  // Additional fields from your schema
  cylinders?: number;
  engineDisplacement?: number;
  drive?: string;
  vehicleSizeClass?: string;
  cityMpgForFuelType1?: number;
  combinedMpgForFuelType1?: number;
  highwayMpgForFuelType1?: string;
  has3D?: boolean;
}) {
  return {
    id: params.id || params.vehicleId || `${params.make}-${params.model}-${params.year}`,
    vehicleId: params.vehicleId || params.id || `${params.make}-${params.model}-${params.year}`,
    make: params.make,
    model: params.model,
    year: params.year,
    msrp: params.msrp || 0,
    fuelType: params.fuelType || 'Gasoline',
    transmission: params.transmission || 'Automatic',
    colorCodes: params.colorCodes || 'white,silver,black',
    colorHexCodes: params.colorHexCodes || 'FFFFFF,C0C0C0,000000',
    colorNames: params.colorNames || 'White,Silver,Black',
    modelTag: params.modelTag || `${params.model.toLowerCase()},${params.model.toLowerCase()},${params.model.toLowerCase()}`,
    modelGrade: params.modelGrade || 'Base,Mid,Premium',
    imageCount: params.imageCount || 36,
    url: params.url || '',
    // Additional fields from your schema
    cylinders: params.cylinders || null,
    engineDisplacement: params.engineDisplacement || null,
    drive: params.drive || null,
    vehicleSizeClass: params.vehicleSizeClass || null,
    cityMpgForFuelType1: params.cityMpgForFuelType1 || null,
    combinedMpgForFuelType1: params.combinedMpgForFuelType1 || null,
    highwayMpgForFuelType1: params.highwayMpgForFuelType1 || null,
    has3D: params.has3D || null,
    totalScore: params.totalScore || 85,
    confidenceScore: 90,
    factors: {
      vehicleTypeMatch: 85,
      priceCompatibility: 80,
      featureAlignment: 90,
      passengerFit: 85,
      fuelTypeMatch: 95,
      usageCompatibility: 80,
      locationFactor: 90,
    },
    metadata: {
      matchingFeatures: params.matchingFeatures || ['Safety Features', 'Fuel Efficiency', 'Technology'],
      missingFeatures: [],
      featureNotes: ['Well-matched vehicle for your needs'],
      priceAnalysis: params.priceAnalysis || {
        isWithinBudget: true,
        percentageFromBudget: 0,
      },
      passengerAnalysis: {
        actualCapacity: params.passengerCapacity || 5,
        configuration: 'Standard',
        notes: 'Comfortable seating configuration'
      },
      usageAnalysis: ['Daily commuting', 'Family trips'],
    },
  };
}


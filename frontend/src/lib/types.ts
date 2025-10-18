// Define the vehicle interface based on your actual database schema
export interface Vehicle {
  make?: string | null;
  model?: string | null;
  annualPetroleumConsumptionForFuelType1?: number | null;
  annualPetroleumConsumptionForFuelType2?: number | null;
  timeToChargeAt120V?: number | null;
  timeToChargeAt240V?: number | null;
  cityMpgForFuelType1?: number | null;
  "unroundedCityMpgForFuelType1 (2)"?: number | null;
  cityMpgForFuelType2?: number | null;
  unroundedCityMpgForFuelType2?: number | null;
  cityGasolineConsumption?: number | null;
  cityElectricityConsumption?: number | null;
  epaCityUtilityFactor?: number | null;
  co2FuelType1?: number | null;
  co2FuelType2?: number | null;
  co2TailpipeForFuelType2?: number | null;
  co2TailpipeForFuelType1?: number | null;
  combinedMpgForFuelType1?: number | null;
  unroundedCombinedMpgForFuelType1?: number | null;
  combinedMpgForFuelType2?: number | null;
  unroundedCombinedMpgForFuelType2?: number | null;
  combinedElectricityConsumption?: number | null;
  combinedGasolineConsumption?: number | null;
  epaCombinedUtilityFactor?: number | null;
  cylinders?: number | null;
  engineDisplacement?: number | null;
  drive?: string | null;
  epaModelTypeIndex?: string | null;
  engineDescriptor?: string | null;
  epaFuelEconomyScore?: string | null;
  annualFuelCostForFuelType1?: string | null;
  annualFuelCostForFuelType2?: string | null;
  fuelType?: string | null;
  fuelType1?: string | null;
  ghgScore?: string | null;
  ghgScoreAlternativeFuel?: string | null;
  highwayMpgForFuelType1?: string | null;
  unroundedHighwayMpgForFuelType1?: string | null;
  highwayMpgForFuelType2?: string | null;
  unroundedHighwayMpgForFuelType2?: string | null;
  highwayGasolineConsumption?: string | null;
  highwayElectricityConsumption?: string | null;
  epaHighwayUtilityFactor?: string | null;
  hatchbackLuggageVolume?: string | null;
  hatchbackPassengerVolume?: string | null;
  id?: string;
  "2DoorLuggageVolume"?: string | null;
  "4DoorLuggageVolume"?: string | null;
  mpgData?: string | null;
  phevBlended?: string | null;
  "2DoorPassengerVolume"?: string | null;
  "4DoorPassengerVolume"?: string | null;
  rangeForFuelType1?: string | null;
  rangeCityForFuelType1?: string | null;
  rangeCityForFuelType2?: string | null;
  rangeHighwayForFuelType1?: string | null;
  rangeHighwayForFuelType2?: string | null;
  transmission?: string | null;
  unadjustedCityMpgForFuelType1?: string | null;
  unadjustedCityMpgForFuelType2?: string | null;
  unadjustedHighwayMpgForFuelType1?: string | null;
  unadjustedHighwayMpgForFuelType2?: string | null;
  vehicleSizeClass?: string | null;
  year?: string | null;
  "youSave/spend"?: string | null;
  guzzler?: string | null;
  transmissionDescriptor?: string | null;
  tCharger?: string | null;
  sCharger?: string | null;
  atvType?: string | null;
  fuelType2?: string | null;
  epaRangeForFuelType2?: string | null;
  electricMotor?: string | null;
  mfrCode?: string | null;
  c240Dscr?: string | null;
  charge240B?: string | null;
  c240BDscr?: string | null;
  createdOn?: string | null;
  modifiedOn?: string | null;
  startStop?: string | null;
  phevCity?: string | null;
  phevHighway?: string | null;
  phevCombined?: string | null;
  basemodel?: string | null;
  msrp?: number | null;
  has3D?: boolean | null;
  colorNames?: string | null;
  colorCodes?: string | null;
  colorHexCodes?: string | null;
  modelGrade?: string | null;
  modelTag?: string | null;
  imageName?: string | null;
  imageCount?: number | null;
  url?: string | null;
}

// Mock vehiclesTable for type compatibility
export const vehiclesTable = {
  $inferSelect: {} as Vehicle
};

export interface VehicleScore {
    vehicleId: string;
    vehicle: NullableToOptional<Vehicle>;
    totalScore: number;
    confidenceScore: number;
    factors: {
      vehicleTypeMatch: number;
      priceCompatibility: number;
      featureAlignment: number;
      passengerFit: number;
      fuelTypeMatch: number;
      usageCompatibility: number;
      locationFactor: number;
    };
    metadata: {
      matchingFeatures: string[];
      missingFeatures: string[];
      featureNotes: string[];
      priceAnalysis: {
        isWithinBudget: boolean;
        percentageFromBudget: number;
      };
      passengerAnalysis?: {
        actualCapacity: number;
        configuration: string;
        notes: string;
      };
      usageAnalysis: string[];
    };
  }

  export type NullableToOptional<T> = {
    // Iterate over each key in T
    [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>;
  } & {
    // Retain keys that do not include null
    [K in keyof T as null extends T[K] ? never : K]: T[K];
  };
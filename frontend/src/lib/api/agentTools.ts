/**
 * Client-side agent tools
 * High-level functions that combine API calls with UI display
 */

import { getLoanOptions, getTrimRecommendations } from './agents';
import type { FinancingOptions, TrimRecommendations } from './agents';

/**
 * Example usage functions that can be called from your components or chat interface
 */

/**
 * Get financing options and display them
 * @param vehicleName - Name of the vehicle (e.g., "2024 Toyota RAV4")
 * @param vehiclePrice - Price of the vehicle
 * @param downPayment - Down payment amount
 * @returns FinancingOptions object that can be displayed in LoanOptionsCard
 * 
 * @example
 * const financing = await getFinancingForVehicle(
 *   "2024 Toyota RAV4",
 *   35000,
 *   5000
 * );
 * // Then use cardManager to display:
 * openCard('loan', financing);
 */
export async function getFinancingForVehicle(
  vehicleName: string,
  vehiclePrice: number,
  downPayment: number
): Promise<FinancingOptions> {
  const message = `
    I'm looking at a ${vehicleName} priced at $${vehiclePrice}.
    I can put $${downPayment} down.
    Find me the best loan option and best lease option.
  `;

  return await getLoanOptions(message);
}

/**
 * Get trim recommendations based on features
 * @param features - Array of desired features
 * @param models - Optional array of specific Toyota models to consider
 * @returns TrimRecommendations object that can be displayed in TrimRecommendationCard
 * 
 * @example
 * const recommendations = await getTrimsForFeatures(
 *   ["AWD", "Apple CarPlay", "panoramic roof", "heated seats"],
 *   ["RAV4", "Highlander"]
 * );
 * // Then use cardManager to display:
 * openCard('trim', recommendations);
 */
export async function getTrimsForFeatures(
  features: string[],
  models?: string[]
): Promise<TrimRecommendations> {
  return await getTrimRecommendations(features, models);
}

/**
 * Compare multiple financing scenarios
 * @param scenarios - Array of scenarios to compare
 * @returns Array of FinancingOptions
 * 
 * @example
 * const comparisons = await compareFinancingScenarios([
 *   { vehicle: "RAV4", price: 35000, downPayment: 5000 },
 *   { vehicle: "Camry", price: 28000, downPayment: 3000 }
 * ]);
 */
export async function compareFinancingScenarios(
  scenarios: Array<{
    vehicle: string;
    price: number;
    downPayment: number;
  }>
): Promise<FinancingOptions[]> {
  const promises = scenarios.map((scenario) =>
    getFinancingForVehicle(scenario.vehicle, scenario.price, scenario.downPayment)
  );

  return await Promise.all(promises);
}


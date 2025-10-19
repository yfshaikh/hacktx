/**
 * Agent API functions
 * Client-side tools to call agent endpoints and get AI-powered responses
 */

const API_BASE_URL = 'http://localhost:8000';

// ============================================================================
// TYPES
// ============================================================================

export interface LoanOption {
  monthly_payment: number;
  total_interest: number;
  total_cost: number;
  apr: number;
  term_months: number;
  down_payment: number;
}

export interface LeaseOption {
  monthly_payment: number;
  total_lease_payments: number;
  residual_value: number;
  buyout_cost: number;
  total_if_purchased: number;
  term_months: number;
  apr: number;
}

export interface FinancingOptions {
  vehicle?: string;
  vehicle_price?: number;
  best_loan: LoanOption;
  best_lease: LeaseOption;
  recommendation?: 'loan' | 'lease';
  why?: string;
}

export interface RankedTrim {
  model: string;
  year: number;
  trim: string;
  trim_packages: string[];
  included_desired_features: string[];
  feature_gaps: string[];
}

export interface TrimRecommendations {
  ranked_trims: RankedTrim[];
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get financing options (loan vs lease) for a vehicle
 * @param userMessage - Natural language query about financing
 * @param model - OpenAI model to use (default: gpt-4o-mini)
 */
export async function getLoanOptions(
  userMessage: string,
  model: string = 'gpt-4o-mini'
): Promise<FinancingOptions> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/loan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_message: userMessage,
        model,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get loan options');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting loan options:', error);
    throw error;
  }
}

/**
 * Get Toyota trim recommendations based on desired features
 * @param features - Array of desired features
 * @param modelCandidates - Optional array of Toyota models to consider
 */
export async function getTrimRecommendations(
  features: string[],
  modelCandidates?: string[]
): Promise<TrimRecommendations> {
  try {
    const response = await fetch(`${API_BASE_URL}/agents/trim-recommendation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        features,
        model_candidates: modelCandidates,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get trim recommendations');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting trim recommendations:', error);
    throw error;
  }
}


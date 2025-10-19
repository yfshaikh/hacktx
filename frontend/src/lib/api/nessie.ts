const API_BASE_URL = 'http://localhost:8000';

export interface NessieSummary {
  customer_id: string;
  monthly_inflow: number;
  monthly_outflow: number;
  monthly_outflow_std: number;
  recurring_bills: number;
  categories: Record<string, number>;
  sample_tx_count: number;
}

export interface SavingsTip {
  category: string;
  current_monthly: number;
  suggested_reduction_pct: number;
  estimated_savings: number;
  suggestion: string;
}

export interface SavingsTips {
  customer_id: string;
  estimated_monthly_savings: number;
  tips: SavingsTip[];
}

/**
 * Get financial summary for a customer using their Capital One ID
 */
export async function getBankSummary(capitalOneId: string): Promise<NessieSummary> {
  const response = await fetch(`${API_BASE_URL}/nessie/summary/${capitalOneId}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch bank summary: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get savings tips for a customer using their Capital One ID
 */
export async function getSavingsTips(capitalOneId: string, topN: number = 6): Promise<SavingsTips> {
  const response = await fetch(`${API_BASE_URL}/nessie/tips/${capitalOneId}?top_n=${topN}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch savings tips: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Get list of customers (for testing/demo)
 */
export async function getCustomers(limit: number = 5) {
  const response = await fetch(`${API_BASE_URL}/nessie/customers?limit=${limit}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch customers: ${response.statusText}`);
  }
  
  return response.json();
}


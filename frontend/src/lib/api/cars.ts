/**
 * Car lookup API functions
 * Simplified version - just searches by make/model without recommendation engine
 */

const API_BASE_URL = 'http://localhost:8000';

export interface CarSearchParams {
  make: string;
  model: string;
  year?: string;
}

/**
 * Search for a car by make and model
 * Returns formatted data ready for displayCarInfo client tool
 */
export async function searchCarByMakeModel(params: CarSearchParams) {
  try {
    const queryParams = new URLSearchParams({
      make: params.make,
      model: params.model,
      ...(params.year && { year: params.year }),
    });

    const response = await fetch(`${API_BASE_URL}/api/cars/search?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to search for car');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching for car:', error);
    throw error;
  }
}

/**
 * Get a specific vehicle by ID
 */
export async function getVehicleById(vehicleId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/cars/${vehicleId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch vehicle');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    throw error;
  }
}


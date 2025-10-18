/**
 * ElevenLabs API functions
 */

const API_BASE_URL = 'http://localhost:8000';

export interface SignedUrlResponse {
  signedUrl: string;
}

/**
 * Fetch a signed URL for ElevenLabs agent authentication
 * @returns Promise<string> The signed URL
 * @throws Error if the request fails
 */
export async function getSignedUrl(): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/eleven/get-signed-url`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.status} ${response.statusText}`);
    }

    const data: SignedUrlResponse = await response.json();
    
    if (!data.signedUrl) {
      throw new Error('No signed URL received from server');
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error fetching signed URL:', error);
    throw error;
  }
}

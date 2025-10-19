/**
 * Example: How to integrate agent tools into the Avatar page
 * This component shows how to call agents from within the voice/chat interface
 */

import { useCardManager } from '../../../lib/cardManager';
import { getLoanOptions, getTrimRecommendations } from '../../../lib/api/agents';
import { getFinancingForVehicle } from '../../../lib/api/agentTools';

/**
 * Hook for agent tool integration
 * Use this in your Avatar component or any chat/voice interface
 */
export function useAgentTools() {
  const { openCard } = useCardManager();

  /**
   * Call the loan agent based on natural language input
   */
  const getFinancing = async (userMessage: string) => {
    try {
      const result = await getLoanOptions(userMessage);
      openCard('loan', result);
      return result;
    } catch (error) {
      console.error('Error getting financing:', error);
      throw error;
    }
  };

  /**
   * Get financing for a specific vehicle
   */
  const getFinancingForSpecificVehicle = async (
    vehicleName: string,
    price: number,
    downPayment: number
  ) => {
    try {
      const result = await getFinancingForVehicle(vehicleName, price, downPayment);
      openCard('loan', result);
      return result;
    } catch (error) {
      console.error('Error getting financing:', error);
      throw error;
    }
  };

  /**
   * Get trim recommendations based on features
   */
  const getTrimRecs = async (features: string[], models?: string[]) => {
    try {
      const result = await getTrimRecommendations(features, models);
      openCard('trim', result);
      return result;
    } catch (error) {
      console.error('Error getting trim recommendations:', error);
      throw error;
    }
  };

  return {
    getFinancing,
    getFinancingForSpecificVehicle,
    getTrimRecs,
  };
}

/**
 * Example: Client-side tool definitions for ElevenLabs conversation
 * 
 * Add these to your ElevenLabs client tools configuration:
 */
export const agentClientTools = [
  {
    name: 'get_financing_options',
    description: 'Get loan vs lease financing options for a vehicle. Returns monthly payments, APR, terms, and recommendations.',
    parameters: {
      type: 'object',
      properties: {
        vehicle_name: {
          type: 'string',
          description: 'Name of the vehicle (e.g., "2024 Toyota RAV4")',
        },
        vehicle_price: {
          type: 'number',
          description: 'Price of the vehicle in dollars',
        },
        down_payment: {
          type: 'number',
          description: 'Down payment amount in dollars',
        },
      },
      required: ['vehicle_name', 'vehicle_price', 'down_payment'],
    },
  },
  {
    name: 'get_trim_recommendations',
    description: 'Get Toyota trim and package recommendations based on desired features. Returns ranked list of matching trims.',
    parameters: {
      type: 'object',
      properties: {
        features: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of desired features. Prefix with "must:" for requirements, "nice:" for preferences, "avoid:" to exclude',
        },
        models: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional: Specific Toyota models to consider (e.g., ["RAV4", "Highlander"])',
        },
      },
      required: ['features'],
    },
  },
];

/**
 * Example: Tool handler for ElevenLabs conversation
 * 
 * Use this in your Avatar component to handle agent tool calls
 */
export function createAgentToolHandler() {
  const { openCard } = useCardManager();

  return async (toolName: string, parameters: any) => {
    try {
      switch (toolName) {
        case 'get_financing_options': {
          const { vehicle_name, vehicle_price, down_payment } = parameters;
          const message = `
            I'm looking at a ${vehicle_name} priced at $${vehicle_price}.
            I can put $${down_payment} down.
            Find me the best loan option and best lease option.
          `;
          const result = await getLoanOptions(message);
          openCard('loan', result);
          
          // Return a response for the conversation
          return {
            success: true,
            message: `I've found financing options for the ${vehicle_name}. 
                      Best loan: $${result.best_loan.monthly_payment}/month. 
                      Best lease: $${result.best_lease.monthly_payment}/month. 
                      I recommend the ${result.recommendation} option. ${result.why}`,
            data: result,
          };
        }

        case 'get_trim_recommendations': {
          const { features, models } = parameters;
          const result = await getTrimRecommendations(features, models);
          openCard('trim', result);

          const topMatch = result.ranked_trims[0];
          return {
            success: true,
            message: `I found ${result.ranked_trims.length} matching trims. 
                      The best match is the ${topMatch.year} ${topMatch.model} ${topMatch.trim}, 
                      which includes ${topMatch.included_desired_features.length} of your desired features.`,
            data: result,
          };
        }

        default:
          return {
            success: false,
            message: `Unknown tool: ${toolName}`,
          };
      }
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      return {
        success: false,
        message: `Failed to execute ${toolName}: ${error}`,
      };
    }
  };
}

/**
 * Example: Integration in Avatar component
 * 
 * ```tsx
 * import { useAgentTools, agentClientTools, createAgentToolHandler } from './components/AgentToolsExample';
 * 
 * function Avatar() {
 *   const agentTools = useAgentTools();
 *   const handleToolCall = createAgentToolHandler();
 * 
 *   // When initializing ElevenLabs conversation:
 *   const conversationConfig = {
 *     clientTools: {
 *       tools: agentClientTools,
 *       handler: handleToolCall,
 *     },
 *   };
 * 
 *   // Or call directly:
 *   const handleGetFinancing = () => {
 *     agentTools.getFinancingForSpecificVehicle("2024 RAV4", 35000, 5000);
 *   };
 * 
 *   return (
 *     // Your Avatar UI
 *   );
 * }
 * ```
 */

/**
 * Example: Manual button integration
 */
export function AgentToolButtons({ vehicleName, vehiclePrice }: { vehicleName: string; vehiclePrice: number }) {
  const agentTools = useAgentTools();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => agentTools.getFinancingForSpecificVehicle(vehicleName, vehiclePrice, 5000)}
        className="px-4 py-2 bg-[var(--toyota-red)] text-white rounded-lg"
      >
        Get Financing Options
      </button>
      
      <button
        onClick={() => agentTools.getTrimRecs(['AWD', 'Apple CarPlay'], [vehicleName.split(' ')[2]])}
        className="px-4 py-2 bg-[var(--info)] text-white rounded-lg"
      >
        Find Best Trim
      </button>
    </div>
  );
}


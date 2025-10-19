import { useCardManager, getCardByType } from '../lib/cardManager';
import { CarVRCard } from './CarVRCard';
import { LoanOptionsCard } from './LoanOptionsCard';
import { TrimRecommendationCard } from './TrimRecommendationCard';
import type { VehicleScore } from '../lib/types';
import type { FinancingOptions, TrimRecommendations } from '../lib/api/agents';

/**
 * CardRenderer - Manages and renders all open cards
 * This component should be placed at the app level to handle all dynamic cards
 */
export function CardRenderer() {
  const { cards, closeCard } = useCardManager();

  // Get cards by type
  const carCard = getCardByType(cards, 'car');
  const loanCard = getCardByType(cards, 'loan');
  const trimCard = getCardByType(cards, 'trim');

  return (
    <>
      {/* Car VR Card */}
      {carCard && (
        <CarVRCard
          car={carCard.data as VehicleScore}
          isOpen={true}
          onClose={() => closeCard(carCard.id)}
          position={carCard.position}
        />
      )}

      {/* Loan Options Card */}
      {loanCard && (
        <LoanOptionsCard
          data={loanCard.data as FinancingOptions}
          isOpen={true}
          onClose={() => closeCard(loanCard.id)}
          position={loanCard.position}
        />
      )}

      {/* Trim Recommendation Card */}
      {trimCard && (
        <TrimRecommendationCard
          data={trimCard.data as TrimRecommendations}
          isOpen={true}
          onClose={() => closeCard(trimCard.id)}
          position={trimCard.position}
        />
      )}
    </>
  );
}


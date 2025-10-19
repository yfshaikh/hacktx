import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { FinancingOptions, TrimRecommendations } from './api/agents';
import type { VehicleScore } from './types';

// ============================================================================
// TYPES
// ============================================================================

export type CardType = 'car' | 'loan' | 'trim';

export interface CardData {
  id: string;
  type: CardType;
  data: VehicleScore | FinancingOptions | TrimRecommendations;
  position: number;
}

interface CardManagerContextType {
  cards: CardData[];
  openCard: (type: CardType, data: any) => void;
  closeCard: (id: string) => void;
  closeAllCards: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const CardManagerContext = createContext<CardManagerContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

interface CardManagerProviderProps {
  children: ReactNode;
}

export function CardManagerProvider({ children }: CardManagerProviderProps) {
  const [cards, setCards] = useState<CardData[]>([]);

  const openCard = useCallback((type: CardType, data: any) => {
    setCards((prevCards) => {
      // Check if a card of this type already exists
      const existingIndex = prevCards.findIndex((card) => card.type === type);
      
      if (existingIndex !== -1) {
        // Update existing card
        const updatedCards = [...prevCards];
        updatedCards[existingIndex] = {
          ...updatedCards[existingIndex],
          data,
        };
        return updatedCards;
      } else {
        // Add new card with next position
        const newCard: CardData = {
          id: `${type}-${Date.now()}`,
          type,
          data,
          position: prevCards.length,
        };
        return [...prevCards, newCard];
      }
    });
  }, []);

  const closeCard = useCallback((id: string) => {
    setCards((prevCards) => {
      const updatedCards = prevCards.filter((card) => card.id !== id);
      // Recalculate positions
      return updatedCards.map((card, index) => ({
        ...card,
        position: index,
      }));
    });
  }, []);

  const closeAllCards = useCallback(() => {
    setCards([]);
  }, []);

  const value = {
    cards,
    openCard,
    closeCard,
    closeAllCards,
  };

  return (
    <CardManagerContext.Provider value={value}>
      {children}
    </CardManagerContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useCardManager() {
  const context = useContext(CardManagerContext);
  if (context === undefined) {
    throw new Error('useCardManager must be used within a CardManagerProvider');
  }
  return context;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get card by type from the cards array
 */
export function getCardByType(cards: CardData[], type: CardType): CardData | undefined {
  return cards.find((card) => card.type === type);
}

/**
 * Check if a card of a specific type is open
 */
export function isCardOpen(cards: CardData[], type: CardType): boolean {
  return cards.some((card) => card.type === type);
}


import { useState } from 'react';
import { useCardManager } from '../../lib/cardManager';
import { getLoanOptions, getTrimRecommendations } from '../../lib/api/agents';
import { getFinancingForVehicle, getTrimsForFeatures } from '../../lib/api/agentTools';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { DollarSign, Star, Loader2 } from 'lucide-react';

/**
 * AgentDemo - Demonstration page for agent tools
 * Shows how to call the loan and trim recommendation agents
 */
export default function AgentDemo() {
  const { openCard, closeAllCards } = useCardManager();
  const [loading, setLoading] = useState<string | null>(null);

  // Example 1: Get financing for a specific vehicle
  const handleGetFinancing = async () => {
    setLoading('financing');
    try {
      const financing = await getFinancingForVehicle(
        "2024 Toyota RAV4 XLE",
        35000,
        5000
      );
      openCard('loan', financing);
    } catch (error) {
      console.error('Error getting financing:', error);
      alert('Failed to get financing options. Check console for details.');
    } finally {
      setLoading(null);
    }
  };

  // Example 2: Custom financing query
  const handleCustomFinancing = async () => {
    setLoading('custom-financing');
    try {
      const result = await getLoanOptions(
        "I'm looking at a 2024 Toyota Camry Hybrid priced at $32,000. I can put $4,000 down. Should I lease or buy?"
      );
      openCard('loan', result);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get financing options. Check console for details.');
    } finally {
      setLoading(null);
    }
  };

  // Example 3: Get trim recommendations
  const handleGetTrims = async () => {
    setLoading('trims');
    try {
      const recommendations = await getTrimsForFeatures(
        [
          "!: AWD",
          "must: Apple CarPlay",
          "nice: panoramic roof",
          "heated seats",
          "blind spot monitoring",
          "adaptive cruise control"
        ],
        ["RAV4", "Highlander"]
      );
      openCard('trim', recommendations);
    } catch (error) {
      console.error('Error getting trims:', error);
      alert('Failed to get trim recommendations. Check console for details.');
    } finally {
      setLoading(null);
    }
  };

  // Example 4: Advanced trim query
  const handleAdvancedTrims = async () => {
    setLoading('advanced-trims');
    try {
      const recommendations = await getTrimRecommendations(
        [
          "must: hybrid or PHEV",
          "must: leather seats",
          "nice: ventilated seats",
          "nice: wireless charging",
          "avoid: cloth interior",
          "JBL audio",
          "head-up display"
        ]
      );
      openCard('trim', recommendations);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get trim recommendations. Check console for details.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-[var(--foreground)]">
            Agent Tools Demo
          </h1>
          <p className="text-lg text-[var(--muted-foreground)]">
            Test the AI agent endpoints and see dynamic UI cards in action
          </p>
        </div>

        <Separator />

        {/* Loan Agent Examples */}
        <Card className="p-6 border-[var(--border)] bg-[var(--card)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[var(--toyota-red)]/10 p-3">
                <DollarSign className="h-6 w-6 text-[var(--toyota-red)]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  Loan Agent
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Get financing options (loan vs lease) for vehicles
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {/* Example 1 */}
              <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--muted)]/30">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">
                  Example 1: Standard Financing Query
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  Get financing options for a 2024 Toyota RAV4 XLE at $35,000 with $5,000 down
                </p>
                <Button
                  onClick={handleGetFinancing}
                  disabled={loading !== null}
                  className="bg-[var(--toyota-red)] hover:bg-[var(--toyota-red-dark)] text-[var(--toyota-white)]"
                >
                  {loading === 'financing' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Get Financing Options'
                  )}
                </Button>
              </div>

              {/* Example 2 */}
              <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--muted)]/30">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">
                  Example 2: Custom Query
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-3">
                  Natural language query: "Should I lease or buy a 2024 Camry Hybrid?"
                </p>
                <Button
                  onClick={handleCustomFinancing}
                  disabled={loading !== null}
                  variant="outline"
                  className="border-[var(--border)] hover:bg-[var(--muted)]"
                >
                  {loading === 'custom-financing' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Custom Financing Query'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Trim Agent Examples */}
        <Card className="p-6 border-[var(--border)] bg-[var(--card)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-[var(--info)]/10 p-3">
                <Star className="h-6 w-6 text-[var(--info)]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  Trim Recommendation Agent
                </h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Get Toyota trim recommendations based on desired features
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {/* Example 3 */}
              <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--muted)]/30">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">
                  Example 3: Feature-Based Search
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  Find RAV4/Highlander trims with:
                </p>
                <ul className="text-sm text-[var(--muted-foreground)] mb-3 ml-4 space-y-1">
                  <li>• Must have: AWD, Apple CarPlay</li>
                  <li>• Nice to have: Panoramic roof</li>
                  <li>• Also: Heated seats, BSM, ACC</li>
                </ul>
                <Button
                  onClick={handleGetTrims}
                  disabled={loading !== null}
                  className="bg-[var(--info)] hover:bg-[var(--info)]/90 text-white"
                >
                  {loading === 'trims' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Get Trim Recommendations'
                  )}
                </Button>
              </div>

              {/* Example 4 */}
              <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--muted)]/30">
                <h3 className="font-semibold text-[var(--foreground)] mb-2">
                  Example 4: Advanced Feature Search
                </h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-2">
                  Find any Toyota with:
                </p>
                <ul className="text-sm text-[var(--muted-foreground)] mb-3 ml-4 space-y-1">
                  <li>• Must have: Hybrid/PHEV, Leather seats</li>
                  <li>• Nice to have: Ventilated seats, Wireless charging</li>
                  <li>• Avoid: Cloth interior</li>
                </ul>
                <Button
                  onClick={handleAdvancedTrims}
                  disabled={loading !== null}
                  variant="outline"
                  className="border-[var(--border)] hover:bg-[var(--muted)]"
                >
                  {loading === 'advanced-trims' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Advanced Trim Search'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Clear All */}
        <div className="flex justify-center">
          <Button
            onClick={closeAllCards}
            variant="outline"
            className="border-[var(--border)] hover:bg-[var(--muted)]"
          >
            Close All Cards
          </Button>
        </div>

        {/* Info Box */}
        <Card className="p-6 border-[var(--border)] bg-[var(--muted)]/30">
          <h3 className="font-semibold text-[var(--foreground)] mb-2">
            💡 How it works
          </h3>
          <ul className="text-sm text-[var(--muted-foreground)] space-y-2">
            <li>
              • Click any button above to call the backend AI agents
            </li>
            <li>
              • Results will appear in dynamic cards on the right side of the screen
            </li>
            <li>
              • Cards can be expanded for full details
            </li>
            <li>
              • Multiple cards can be open at once without overlapping
            </li>
            <li>
              • Each card type (loan, trim, car) can only have one instance open
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}


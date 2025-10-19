# 🔧 Agent Tools Configuration for ElevenLabs

This document provides the exact parameters needed to configure the agent tools with ElevenLabs or other AI platforms.

---

## Tool 1: `get_financing_options`

### Description
Get loan vs lease financing options for any vehicle. Returns best loan and lease options with monthly payments, APR, terms, total costs, and a recommendation.

### Parameters Schema

```json
{
  "type": "object",
  "properties": {
    "vehicle_name": {
      "type": "string",
      "description": "Full name of the vehicle (e.g., '2024 Toyota RAV4', 'Toyota Camry Hybrid')",
      "example": "2024 Toyota RAV4"
    },
    "vehicle_price": {
      "type": "number",
      "description": "Total price of the vehicle in dollars (no commas)",
      "example": 35000
    },
    "down_payment": {
      "type": "number",
      "description": "Down payment amount in dollars",
      "example": 5000
    }
  },
  "required": ["vehicle_name", "vehicle_price", "down_payment"]
}
```

### Return Value Structure

```typescript
{
  vehicle: string;              // "2024 Toyota RAV4"
  vehicle_price: number;        // 35000
  best_loan: {
    monthly_payment: number;    // 567.89
    total_interest: number;     // 4073.40
    total_cost: number;         // 39073.40
    apr: number;                // 4.5
    term_months: number;        // 60
    down_payment: number;       // 5000
  };
  best_lease: {
    monthly_payment: number;    // 420.00
    total_lease_payments: number; // 15120.00
    residual_value: number;     // 19250.00
    buyout_cost: number;        // 19250.00
    total_if_purchased: number; // 34370.00
    term_months: number;        // 36
    apr: number;                // 3.5
  };
  recommendation: "loan" | "lease";
  why: string;                  // "The loan option..."
}
```

### Example Use Cases

#### 1. Basic Financing Query
```
User: "How much would a RAV4 cost per month?"
Tool Call:
  get_financing_options(
    vehicle_name="2024 Toyota RAV4",
    vehicle_price=35000,
    down_payment=5000
  )
```

#### 2. Lease vs Buy Question
```
User: "Should I lease or buy a Camry for $28,000?"
Tool Call:
  get_financing_options(
    vehicle_name="2024 Toyota Camry",
    vehicle_price=28000,
    down_payment=4000
  )
```

#### 3. Specific Down Payment
```
User: "What's the monthly payment on a $45,000 Highlander if I put $8,000 down?"
Tool Call:
  get_financing_options(
    vehicle_name="2024 Toyota Highlander",
    vehicle_price=45000,
    down_payment=8000
  )
```

### What the Tool Does
1. Calculates best loan option (optimal term and APR)
2. Calculates best lease option (optimal term and residual value)
3. Compares total costs
4. Provides a recommendation with explanation
5. **Displays results in a dynamic card** on the user's screen

---

## Tool 2: `get_trim_recommendations`

### Description
Get Toyota trim and package recommendations based on desired features. Returns ranked list of Toyota trims that best match the user's requirements, including official packages and feature coverage.

### Parameters Schema

```json
{
  "type": "object",
  "properties": {
    "features": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Array of desired features. Use prefixes: 'must:' or '!:' for required, 'nice:' for optional, 'avoid:' to exclude",
      "example": ["must: AWD", "Apple CarPlay", "nice: panoramic roof", "avoid: cloth seats"]
    },
    "models": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Optional: Specific Toyota models to consider (e.g., ['RAV4', 'Highlander']). If omitted, searches all Toyota models.",
      "example": ["RAV4", "Highlander"]
    }
  },
  "required": ["features"]
}
```

### Return Value Structure

```typescript
{
  ranked_trims: [
    {
      model: string;           // "RAV4"
      year: number;            // 2024
      trim: string;            // "XLE Premium"
      trim_packages: string[]; // ["Weather Package", "Audio Plus"]
      included_desired_features: string[]; // Features user wanted that are included
      feature_gaps: string[];  // Features user wanted that are missing
    },
    // ... more ranked results (typically 3-5 trims)
  ]
}
```

### Feature Prefixes

| Prefix | Meaning | Example |
|--------|---------|---------|
| `must:` | Required feature | `"must: AWD"` |
| `!:` | Required feature (shorthand) | `"!: hybrid"` |
| `nice:` | Nice to have | `"nice: panoramic roof"` |
| `avoid:` | Must not have | `"avoid: cloth seats"` |
| (none) | Regular preference | `"heated seats"` |

### Common Feature Names

| User Says | Send to Tool |
|-----------|--------------|
| AWD, all-wheel drive | `"AWD"` |
| Apple CarPlay, CarPlay | `"Apple CarPlay"` |
| Blind spot monitoring, BSM | `"blind spot monitoring"` |
| Adaptive cruise control, ACC | `"adaptive cruise control"` |
| Lane keep assist, LKA | `"lane keep assist"` |
| Panoramic sunroof, moonroof | `"panoramic roof"` |
| Heated seats | `"heated seats"` |
| Cooled seats, ventilated seats | `"ventilated seats"` |
| Wireless charging | `"wireless charging"` |
| Hybrid, PHEV | `"hybrid"` or `"PHEV"` |
| Leather seats | `"leather seats"` |
| 7 passengers, 3 rows | `"7 passengers"` or `"3 rows"` |
| Head-up display, HUD | `"head-up display"` |
| JBL audio, premium audio | `"JBL audio"` |

### Example Use Cases

#### 1. Basic Feature Search
```
User: "I need a Toyota with AWD and Apple CarPlay"
Tool Call:
  get_trim_recommendations(
    features=["must: AWD", "must: Apple CarPlay"]
  )
```

#### 2. Model-Specific Search
```
User: "Which RAV4 trim has heated seats and a sunroof?"
Tool Call:
  get_trim_recommendations(
    features=["heated seats", "panoramic roof"],
    models=["RAV4"]
  )
```

#### 3. Complex Requirements
```
User: "I want a hybrid with leather seats but no cloth interior"
Tool Call:
  get_trim_recommendations(
    features=["must: hybrid", "must: leather seats", "avoid: cloth interior"]
  )
```

#### 4. Safety Features
```
User: "Show me Highlanders with all the safety features"
Tool Call:
  get_trim_recommendations(
    features=[
      "blind spot monitoring",
      "adaptive cruise control",
      "lane keep assist",
      "automatic emergency braking"
    ],
    models=["Highlander"]
  )
```

#### 5. Multi-Model Comparison
```
User: "Which Toyota SUV has ventilated seats and wireless charging?"
Tool Call:
  get_trim_recommendations(
    features=["ventilated seats", "wireless charging"],
    models=["RAV4", "Highlander", "4Runner"]
  )
```

### What the Tool Does
1. Searches official Toyota specifications and packages
2. Maps user features to actual Toyota trim levels
3. Ranks trims by how well they match requirements
4. Identifies which packages are needed for features
5. Shows feature gaps (what's missing)
6. **Displays results in a dynamic card** on the user's screen

---

## Tool Integration Examples

### ElevenLabs Client Tools Configuration

```javascript
const clientTools = {
  tools: [
    {
      name: 'get_financing_options',
      description: 'Get loan vs lease financing options for a vehicle. Returns monthly payments, APR, terms, and recommendations.',
      parameters: {
        type: 'object',
        properties: {
          vehicle_name: {
            type: 'string',
            description: 'Full name of the vehicle (e.g., "2024 Toyota RAV4")',
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
      description: 'Get Toyota trim recommendations based on desired features. Returns ranked list of matching trims.',
      parameters: {
        type: 'object',
        properties: {
          features: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of desired features. Use "must:" for requirements, "nice:" for preferences, "avoid:" to exclude',
          },
          models: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional: Specific Toyota models to consider',
          },
        },
        required: ['features'],
      },
    },
  ],
  handler: async (toolName, parameters) => {
    // Tool implementation here
    // See: frontend/src/pages/Avatar/components/AgentToolsExample.tsx
  },
};
```

### Tool Handler Implementation

```typescript
import { getLoanOptions, getTrimRecommendations } from './lib/api/agents';
import { useCardManager } from './lib/cardManager';

const handleToolCall = async (toolName: string, parameters: any) => {
  const { openCard } = useCardManager();

  if (toolName === 'get_financing_options') {
    const { vehicle_name, vehicle_price, down_payment } = parameters;
    const message = `
      I'm looking at a ${vehicle_name} priced at $${vehicle_price}.
      I can put $${down_payment} down.
      Find me the best loan option and best lease option.
    `;
    const result = await getLoanOptions(message);
    openCard('loan', result);
    
    return {
      success: true,
      message: `Best loan: $${result.best_loan.monthly_payment}/mo. Best lease: $${result.best_lease.monthly_payment}/mo. ${result.why}`,
      data: result,
    };
  }

  if (toolName === 'get_trim_recommendations') {
    const { features, models } = parameters;
    const result = await getTrimRecommendations(features, models);
    openCard('trim', result);
    
    const topMatch = result.ranked_trims[0];
    return {
      success: true,
      message: `Best match: ${topMatch.year} ${topMatch.model} ${topMatch.trim} with ${topMatch.included_desired_features.length} matching features.`,
      data: result,
    };
  }
};
```

---

## Important Notes

### 1. Visual Feedback
Both tools display results in **dynamic UI cards** on the right side of the screen:
- Cards appear automatically when tools are called
- Users can expand cards for full details
- Multiple cards can be open simultaneously
- Cards are positioned to avoid overlap

### 2. Natural Language Processing
The **trim tool** accepts natural language feature descriptions:
- "heated seats" ✅
- "AWD" ✅
- "all-wheel drive" ✅ (normalized to AWD)
- "adaptive cruise" ✅ (normalized to "adaptive cruise control")

### 3. Data Sources
- **Loan Tool**: Uses industry-standard calculations for loans/leases
- **Trim Tool**: Searches official Toyota specifications and dealer websites
- Both provide REAL, accurate information

### 4. Error Handling
Tools may return errors if:
- Backend is not running (check `http://localhost:8000/agents/`)
- Invalid parameters provided
- Network issues

Always wrap tool calls in try-catch blocks:
```typescript
try {
  const result = await getLoanOptions(message);
  openCard('loan', result);
} catch (error) {
  console.error('Error:', error);
  // Show error to user
}
```

### 5. Performance
- **Loan Tool**: Fast (~1-2 seconds) - pure calculation
- **Trim Tool**: Slower (~5-10 seconds) - does web searches to verify features

---

## Testing

### Test the Tools
1. Start backend: `cd backend && python -m uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: `http://localhost:5173/agent-demo`
4. Click example buttons to test both tools

### Direct API Testing
```bash
# Test Loan Agent
curl -X POST http://localhost:8000/agents/loan \
  -H "Content-Type: application/json" \
  -d '{
    "user_message": "Compare financing for a $35,000 RAV4 with $5,000 down",
    "model": "gpt-4o-mini"
  }'

# Test Trim Agent
curl -X POST http://localhost:8000/agents/trim-recommendation \
  -H "Content-Type: application/json" \
  -d '{
    "features": ["AWD", "Apple CarPlay", "heated seats"],
    "model_candidates": ["RAV4"]
  }'
```

---

## Available Toyota Models

Common models for the `models` parameter in trim tool:

### Sedans
- Camry, Corolla, Avalon

### SUVs
- RAV4, 4Runner, Highlander, Sequoia

### Trucks
- Tacoma, Tundra

### Hybrids
- Prius, Camry Hybrid, RAV4 Hybrid, Highlander Hybrid

### Minivan
- Sienna

---

## Support & Documentation

- **Quick Start**: See `AGENT_TOOLS_QUICKSTART.md`
- **Full Usage Guide**: See `AGENT_TOOLS_USAGE.md`
- **System Prompts**: See `AGENT_TOOLS_SYSTEM_PROMPT.txt`
- **Integration Examples**: See `frontend/src/pages/Avatar/components/AgentToolsExample.tsx`

---

## Default Values (for convenience)

When users don't specify all values:

| Parameter | Default | Reasoning |
|-----------|---------|-----------|
| `down_payment` | $5,000 | Typical 10-15% down |
| `models` | All Toyota models | Search everything |
| Feature prefix | Regular preference | Not required, not avoided |

Example: If user says "How much is a RAV4 per month?" without mentioning down payment, assume $5,000 down payment.


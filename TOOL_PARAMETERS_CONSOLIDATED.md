# 🔧 Complete Tool Configuration for ElevenLabs

This document provides the exact parameters needed to configure all agent tools with ElevenLabs or other AI platforms.

---

## Tool 1: `search_car`

### Description
Search and display Toyota vehicles from 2015-2020 with real photos from cars.com. Shows detailed specs, pricing, and multiple high-quality images that users can drag through.

### Parameters Schema

```json
{
  "type": "object",
  "properties": {
    "make": {
      "type": "string",
      "description": "Car manufacturer (always 'Toyota')",
      "example": "Toyota"
    },
    "model": {
      "type": "string",
      "description": "Model name like Camry, Prius, RAV4, Tacoma, Highlander, 4Runner, Corolla, Tundra, Sienna, Sequoia, Avalon",
      "example": "Camry"
    },
    "year": {
      "type": "string",
      "description": "Optional: Model year from 2015-2020. If not specified, returns the newest available year.",
      "example": "2018"
    }
  },
  "required": ["make", "model"]
}
```

### Return Value
Displays vehicle with real photos on user's screen. Returns formatted message for conversation.

### Data Coverage
- **Years**: 2015-2020 Toyota vehicles
- **Images**: 100% - All vehicles have 20-40+ real photos from cars.com
- **Pricing**: 100% - All vehicles have MSRP
- **Specs**: 100% - Horsepower, seating, dimensions, drivetrain, body style, MPG

### Example Use Cases

#### Basic Search
```
User: "Show me a Camry"
Tool Call: search_car(make="Toyota", model="Camry")
```

#### Specific Year
```
User: "Show me a 2018 RAV4"
Tool Call: search_car(make="Toyota", model="RAV4", year="2018")
```

#### SUV Request
```
User: "Show me a 4Runner"
Tool Call: search_car(make="Toyota", model="4Runner")
```

### Available Models
- **Sedans**: Camry, Corolla, Avalon
- **SUVs**: RAV4, 4Runner, Highlander, Sequoia
- **Trucks**: Tacoma, Tundra
- **Hybrids**: Prius, Camry Hybrid, RAV4 Hybrid, Highlander Hybrid
- **Minivan**: Sienna

---

## Tool 2: `get_financing_options`

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

#### Basic Financing Query
```
User: "How much would a RAV4 cost per month?"
Tool Call:
  get_financing_options(
    vehicle_name="2024 Toyota RAV4",
    vehicle_price=35000,
    down_payment=5000
  )
```

#### Lease vs Buy Question
```
User: "Should I lease or buy a Camry for $28,000?"
Tool Call:
  get_financing_options(
    vehicle_name="2024 Toyota Camry",
    vehicle_price=28000,
    down_payment=4000
  )
```

#### Specific Down Payment
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

## Tool 3: `get_trim_recommendations`

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

#### Basic Feature Search
```
User: "I need a Toyota with AWD and Apple CarPlay"
Tool Call:
  get_trim_recommendations(
    features=["must: AWD", "must: Apple CarPlay"]
  )
```

#### Model-Specific Search
```
User: "Which RAV4 trim has heated seats and a sunroof?"
Tool Call:
  get_trim_recommendations(
    features=["heated seats", "panoramic roof"],
    models=["RAV4"]
  )
```

#### Complex Requirements
```
User: "I want a hybrid with leather seats but no cloth interior"
Tool Call:
  get_trim_recommendations(
    features=["must: hybrid", "must: leather seats", "avoid: cloth interior"]
  )
```

#### Safety Features
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

### What the Tool Does
1. Searches official Toyota specifications and packages
2. Maps user features to actual Toyota trim levels
3. Ranks trims by how well they match requirements
4. Identifies which packages are needed for features
5. Shows feature gaps (what's missing)
6. **Displays results in a dynamic card** on the user's screen

---

## Tool 4: `get_bank_info`

### Description
Get the user's financial information including monthly income, expenses, spending categories, and personalized savings tips from their linked Capital One account via the Nessie API.

### Parameters Schema

```json
{
  "type": "object",
  "properties": {
    "include_savings_tips": {
      "type": "boolean",
      "description": "Whether to include personalized savings tips (default: true)",
      "example": true
    }
  },
  "required": []
}
```

### Return Value Structure

The tool returns a formatted string with financial information:

```
"Here's your financial summary: You have a monthly income of $6000.00 and monthly expenses of $2500.00 (±$300.00). Your top spending categories are: rent ($1500.00), groceries ($400.00), utilities ($200.00). I can help you save about $150.00 per month. For example, Trim groceries by 5% to free ~$20/mo."
```

The underlying data structure includes:

```typescript
{
  customer_id: string;
  monthly_inflow: number;        // e.g., 6000.00
  monthly_outflow: number;       // e.g., 2500.00
  monthly_outflow_std: number;   // e.g., 300.00 (spending variance)
  recurring_bills: number;       // e.g., 800.00
  categories: {                  // Top spending categories
    [category: string]: number;  // e.g., { "rent": 1500.00, "groceries": 400.00 }
  };
  sample_tx_count: number;       // Number of transactions analyzed
}

// If include_savings_tips=true, also includes:
{
  estimated_monthly_savings: number;  // e.g., 150.00
  tips: [
    {
      category: string;                  // "Groceries"
      current_monthly: number;           // 400.00
      suggested_reduction_pct: number;   // 5.0
      estimated_savings: number;         // 20.00
      suggestion: string;                // "Trim groceries by 5%..."
    }
  ]
}
```

### Example Use Cases

#### Check Affordability
```
User: "Can I afford a new car?"
Tool Call:
  get_bank_info(include_savings_tips=true)
Response: "You have monthly income of $6,000 and expenses of $2,500, leaving $3,500. With savings tips, you could free up another $150/month!"
```

#### Budget Check
```
User: "What's my budget like?"
Tool Call:
  get_bank_info(include_savings_tips=false)
Response: "Your monthly income is $6,000 with expenses of $2,500 (±$300). Top categories: rent ($1,500), groceries ($400), utilities ($200)."
```

#### Savings Advice
```
User: "How can I save money?"
Tool Call:
  get_bank_info(include_savings_tips=true)
Response: "I can help you save about $150/month! For example, trim groceries by 5% to save ~$20/mo."
```

#### Combined with Vehicle Search
```
User: "What car can I afford?"
1. get_bank_info(include_savings_tips=false)
2. Calculate available budget: income - expenses
3. Search for vehicles with payments within budget
4. get_financing_options() for suitable vehicles
```

### What the Tool Does
1. Retrieves user's `capital_one_id` from their profile
2. Calls Nessie API `/summary/{customer_id}` endpoint for financial data
3. Optionally calls `/tips/{customer_id}` for personalized savings recommendations
4. Aggregates and formats data into a conversational summary
5. Returns human-readable financial overview

### Important Notes
- **Requires Linked Account**: User must have their Capital One account linked in their profile
- **Privacy**: Only returns data when user explicitly asks for financial information
- **Demo Mode**: If API is unavailable or no account linked, returns demo data
- **Real-Time Data**: Data is cached for 15 minutes, then refreshed from Nessie API
- **Security**: All financial data is private and secure via Nessie API

### Error Handling

If user hasn't linked their Capital One account:
```
"I don't have your Capital One account linked yet. Please link your account in settings to view your financial information."
```

---

## Tool 5: `transfer_to_number`

### Description
Transfer the user to a live service representative when they're ready to move forward with a financing option or need human assistance to finalize details.

### Parameters Schema

```json
{
  "type": "object",
  "properties": {
    "transfer_number": {
      "type": "string",
      "description": "Phone number to transfer to (must match configured numbers)",
      "example": "+1234567890"
    },
    "client_message": {
      "type": "string",
      "description": "Message read to the client while waiting for transfer",
      "example": "Great! Please hold while I connect you with a service representative."
    },
    "agent_message": {
      "type": "string",
      "description": "Message for the human operator receiving the call",
      "example": "Customer is interested in moving forward with a lease option. They've reviewed financing and are ready to confirm details."
    },
    "reason": {
      "type": "string",
      "description": "Optional: Reason for transfer (e.g., 'lease financing confirmation', 'deal finalization', 'loan inquiry')",
      "example": "Camry loan confirmation"
    }
  },
  "required": ["transfer_number", "client_message", "agent_message"]
}
```

### Return Value
Initiates a transfer to a service representative. Returns confirmation message for conversation.

### Example Use Cases

#### User Likes Financing Option
```
User: "I like the lease option you showed me"
AI: "Great choice! Would you like me to connect you with a service rep who can confirm all the details?"
User: "Yes"
Tool Call: 
  transfer_to_number(
    transfer_number="+1234567890",
    client_message="Great! Please hold while I connect you with a service representative who can help finalize your lease.",
    agent_message="Customer is interested in moving forward with a lease option. They've reviewed financing and are ready to confirm details.",
    reason="lease financing confirmation"
  )
```

#### User Wants to Finalize Deal
```
User: "Let's do this, I want to buy the RAV4"
Tool Call:
  transfer_to_number(
    transfer_number="+1234567890",
    client_message="Connecting you with our sales team to help complete your RAV4 purchase. One moment please.",
    agent_message="Customer wants to purchase a RAV4. Ready to finalize the deal.",
    reason="RAV4 purchase finalization"
  )
```

#### User Asks to Speak with Someone
```
User: "Can I talk to someone about this?"
Tool Call:
  transfer_to_number(
    transfer_number="+1234567890",
    client_message="Connecting you now with a specialist who can help. Please hold.",
    agent_message="Customer requested to speak with a representative. General inquiry.",
    reason="general inquiry"
  )
```

### What the Tool Does
1. Confirms user's intent to be transferred
2. Dials the specified transfer_number (must match configured service numbers)
3. Plays the client_message to the user while connecting
4. Delivers the agent_message to the service representative
5. Provides smooth transition from AI to human assistance with full context

### Important Notes
- **Always ask for confirmation** before transferring (unless explicitly requested)
- **Only use when user shows genuine interest** in moving forward
- Don't push transfers if they're still exploring options
- The transfer_number must be pre-configured in the system
- The agent_message should provide clear context for seamless handoff
- The client_message should be professional and reassuring
- This is typically the final step after financing options are discussed
- Users can decline and continue chatting with the AI

### Message Guidelines

**client_message** (What the customer hears):
- Keep it professional and reassuring
- Mention what type of specialist they're being connected to
- Use phrases like "Please hold", "One moment", or "Connecting you now"
- Keep it brief - this is played while they wait

**agent_message** (What the service rep receives):
- Provide clear context about what the customer needs
- Mention any specific vehicles, financing options, or decisions they've made
- Include relevant details (e.g., "lease vs buy preference", "RAV4 with AWD")
- Be concise but informative so the rep can pick up seamlessly

---

## ElevenLabs Client Tools Configuration

### Complete JavaScript Configuration

```javascript
const clientTools = {
  tools: [
    {
      name: 'search_car',
      description: 'Search and display Toyota vehicles from 2015-2020 with real photos. Shows specs, pricing, and multiple images.',
      parameters: {
        type: 'object',
        properties: {
          make: {
            type: 'string',
            description: 'Car manufacturer (always "Toyota")',
          },
          model: {
            type: 'string',
            description: 'Model name like Camry, Prius, RAV4, Tacoma, Highlander, etc.',
          },
          year: {
            type: 'string',
            description: 'Optional: Model year from 2015-2020',
          },
        },
        required: ['make', 'model'],
      },
    },
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
    {
      name: 'get_bank_info',
      description: 'Get user financial information from their linked Capital One account. Returns monthly income, expenses, spending categories, and optional savings tips.',
      parameters: {
        type: 'object',
        properties: {
          include_savings_tips: {
            type: 'boolean',
            description: 'Whether to include personalized savings tips (default: true)',
          },
        },
        required: [],
      },
    },
    {
      name: 'transfer_to_number',
      description: 'Transfer the user to a live service representative when they want to finalize a deal or need human assistance.',
      parameters: {
        type: 'object',
        properties: {
          transfer_number: {
            type: 'string',
            description: 'Phone number to transfer to (must match configured numbers)',
          },
          client_message: {
            type: 'string',
            description: 'Message read to the client while waiting for transfer',
          },
          agent_message: {
            type: 'string',
            description: 'Message for the human operator receiving the call',
          },
          reason: {
            type: 'string',
            description: 'Optional: Reason for transfer (e.g., "lease financing confirmation", "deal finalization")',
          },
        },
        required: ['transfer_number', 'client_message', 'agent_message'],
      },
    },
  ],
  handler: async (toolName, parameters) => {
    // Tool implementation - See: frontend/src/pages/Avatar/Avatar.tsx
  },
};
```

---

## Important Notes

### 1. Visual Feedback
All tools display results in **dynamic UI cards** on the right side of the screen:
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
- **Search Car Tool**: Scraped data from cars.com with real photos (2015-2020)
- **Loan Tool**: Uses industry-standard calculations for loans/leases
- **Trim Tool**: Searches official Toyota specifications and dealer websites
- **Bank Tool**: Retrieves real financial data from Capital One via Nessie API
- All tools provide REAL, accurate information

### 4. Error Handling
Tools may return errors if:
- Backend is not running (check `http://localhost:8000/`)
- Invalid parameters provided
- Network issues
- User hasn't linked Capital One account (for bank tool)

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
- **Search Car Tool**: Fast (~1-2 seconds) - database lookup
- **Loan Tool**: Fast (~1-2 seconds) - pure calculation
- **Trim Tool**: Slower (~5-10 seconds) - does web searches to verify features
- **Bank Tool**: Fast (~1-2 seconds) - cached data with 15-minute TTL
- **Transfer Tool**: Instant - initiates call transfer immediately

---

## Testing

### Test the Tools
1. Start backend: `cd backend && python -m uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Visit: `http://localhost:5173/avatar`
4. Start a voice conversation to test all tools

### Direct API Testing
```bash
# Test Car Search
curl -X POST http://localhost:8000/agents/search-car \
  -H "Content-Type: application/json" \
  -d '{
    "make": "Toyota",
    "model": "Camry",
    "year": "2018"
  }'

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

# Test Bank Info (Nessie API)
curl http://localhost:8000/nessie/summary/demo_customer_1

# Test Savings Tips
curl http://localhost:8000/nessie/tips/demo_customer_1?top_n=5
```

---

## Default Values (for convenience)

When users don't specify all values:

| Parameter | Default | Reasoning |
|-----------|---------|-----------|
| `year` | Most recent available | Return newest model |
| `down_payment` | $5,000 | Typical 10-15% down |
| `models` | All Toyota models | Search everything |
| Feature prefix | Regular preference | Not required, not avoided |
| `include_savings_tips` | `true` | Users usually want savings advice |

Example: If user says "How much is a RAV4 per month?" without mentioning down payment, assume $5,000 down payment.

---

## Prerequisites

### For Bank Info Tool
1. User must have a Capital One account linked in their profile
2. Set the `capital_one_id` field in the `profiles` table
3. The Nessie API must be accessible (demo mode available if unavailable)
4. Environment variable `NESSIE_API_KEY` should be set (optional for demo mode)

### For Transfer Tool
1. ElevenLabs conversation must be active (voice session in progress)
2. Service representative phone number/endpoint must be configured
3. Transfer capability must be enabled in ElevenLabs agent settings

### For All Tools
- Backend server must be running on `http://localhost:8000`
- Frontend must be running on `http://localhost:5173`
- User must be authenticated (for bank info)

---

## Support & Documentation

- **System Prompt**: See `SYSTEM_PROMPT.txt`
- **Integration Examples**: See `frontend/src/pages/Avatar/Avatar.tsx`
- **API Routes**: See `backend/routes/` and `backend/main.py`

---

**Remember**: All 5 tools work together to provide a comprehensive car buying experience with real data, accurate calculations, personalized financial insights, and seamless handoff to human representatives when users are ready to finalize their purchase!


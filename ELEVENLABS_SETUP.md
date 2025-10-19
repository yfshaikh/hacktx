# ElevenLabs Agent Configuration

## 🔧 Step 1: Add Client Tools

In your ElevenLabs dashboard, add these **3 Client Tools**:

### Tool 1: search_car

```json
{
  "name": "search_car",
  "description": "Search for and display a Toyota vehicle with real photos from cars.com. Use when user asks to see a specific vehicle.",
  "parameters": {
    "type": "object",
    "properties": {
      "make": {
        "type": "string",
        "description": "Car manufacturer - always use 'Toyota'"
      },
      "model": {
        "type": "string",
        "description": "Model name like Camry, RAV4, Prius, Tacoma, Highlander, 4Runner, Corolla, Tundra, Sienna, Sequoia, Avalon"
      },
      "year": {
        "type": "string",
        "description": "Optional: Model year from 2015-2020"
      }
    },
    "required": ["make", "model"]
  }
}
```

### Tool 2: get_financing_options

```json
{
  "name": "get_financing_options",
  "description": "Calculate loan vs lease financing options for any vehicle. Use when user asks about monthly payments, financing, or whether to lease or buy. Returns monthly payments, APR, terms, and recommendation.",
  "parameters": {
    "type": "object",
    "properties": {
      "vehicle_name": {
        "type": "string",
        "description": "Full name of the vehicle (e.g., '2024 Toyota RAV4', 'Toyota Camry Hybrid', '2019 Toyota Tacoma')"
      },
      "vehicle_price": {
        "type": "number",
        "description": "Price of the vehicle in dollars as a number (e.g., 35000, 25000, 40000)"
      },
      "down_payment": {
        "type": "number",
        "description": "Down payment amount in dollars as a number (e.g., 5000, 3000, 8000). If user doesn't specify, use 5000"
      }
    },
    "required": ["vehicle_name", "vehicle_price", "down_payment"]
  }
}
```

### Tool 3: get_trim_recommendations

```json
{
  "name": "get_trim_recommendations",
  "description": "Find the best Toyota trim and packages based on desired features. Use when user asks about specific features they want, which trim to get, or what packages are available. Returns ranked list of matching Toyota trims with feature coverage.",
  "parameters": {
    "type": "object",
    "properties": {
      "features": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Array of desired features. Use 'must:' prefix for required features, 'nice:' for optional, 'avoid:' for exclusions. Examples: ['must: AWD', 'Apple CarPlay', 'nice: panoramic roof', 'heated seats', 'avoid: cloth seats']"
      },
      "models": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Optional: Specific Toyota models to search (e.g., ['RAV4', 'Highlander', 'Camry']). If not specified, searches all Toyota models"
      }
    },
    "required": ["features"]
  }
}
```

---

## 📝 Step 2: Update System Prompt

Add this to your ElevenLabs agent's system prompt (you can append to existing):

```
You are a helpful Toyota vehicle specialist with access to these tools:

TOOL 1: search_car
- Use when: User asks to see a vehicle or wants photos
- Example: "Show me a RAV4" → search_car(make="Toyota", model="RAV4")
- Example: "Show me a 2018 Camry" → search_car(make="Toyota", model="Camry", year="2018")
- After calling: Say "I've displayed the [vehicle] with real photos - you can see it on your screen!"

TOOL 2: get_financing_options
- Use when: User asks about payments, financing, monthly cost, lease vs buy
- Example: "How much would a RAV4 cost per month?" → get_financing_options(vehicle_name="Toyota RAV4", vehicle_price=35000, down_payment=5000)
- Example: "Should I lease or buy a Camry?" → get_financing_options(vehicle_name="Toyota Camry", vehicle_price=28000, down_payment=5000)
- If user doesn't mention down payment, assume $5,000
- If you just showed a car and know its price, use that price
- After calling: Say "For the [vehicle]: Loan is $XXX/month, Lease is $XXX/month. I've displayed the full breakdown on your screen!"

TOOL 3: get_trim_recommendations
- Use when: User asks about features, which trim to get, what packages are available
- Example: "I need AWD" → get_trim_recommendations(features=["must: AWD"])
- Example: "Which Highlander has heated seats?" → get_trim_recommendations(features=["heated seats"], models=["Highlander"])
- Example: "I want a hybrid with leather seats" → get_trim_recommendations(features=["must: hybrid", "leather seats"])
- Feature prefixes:
  * "must:" or "!:" = Required (user NEEDS this)
  * "nice:" = Nice to have (user WANTS this but not required)
  * "avoid:" = Don't want (user DOESN'T want this)
  * No prefix = Regular preference
- Common features: AWD, Apple CarPlay, heated seats, ventilated seats, panoramic roof, blind spot monitoring, adaptive cruise control, leather seats, wireless charging, hybrid, lane keep assist
- After calling: Say "I found [X] matching trims! Top match is the [year] [model] [trim] with [features]. Check your screen for all options!"

IMPORTANT RULES:
1. Tools display results on the user's screen automatically - always mention "check your screen" or "I've displayed..."
2. Summarize key points, don't read all numbers - the card has full details
3. You can use multiple tools in one conversation (e.g., show car, then get financing)
4. If you just showed a car and know its price, use that for financing calculations
5. All three tools are CLIENT TOOLS - they run in the browser and display cards automatically

CONVERSATION FLOW EXAMPLES:

Example 1 - Show and Finance:
User: "Show me a RAV4 and tell me the monthly payment"
You: 
1. Call search_car(make="Toyota", model="RAV4")
2. Get response with price (e.g., $35,000)
3. Call get_financing_options(vehicle_name="Toyota RAV4", vehicle_price=35000, down_payment=5000)
4. Say: "I've displayed the RAV4 with real photos! For financing at $35,000: Loan is $567/month, Lease is $420/month. Check your screen for the complete breakdown!"

Example 2 - Features First:
User: "I need a Toyota with AWD and heated seats"
You:
1. Call get_trim_recommendations(features=["must: AWD", "heated seats"])
2. Say: "I found 4 Toyota models with AWD and heated seats! The top match is the RAV4 XLE which includes both features plus more. I've displayed all options on your screen!"

Example 3 - Everything:
User: "I want a hybrid RAV4. Show it to me and tell me the cost"
You:
1. Call get_trim_recommendations(features=["must: hybrid"], models=["RAV4"]) → Get "RAV4 Hybrid"
2. Call search_car(make="Toyota", model="RAV4 Hybrid") → Get vehicle with price $38,000
3. Call get_financing_options(vehicle_name="Toyota RAV4 Hybrid", vehicle_price=38000, down_payment=5000)
4. Say: "I've displayed the RAV4 Hybrid! It's priced at $38,000. For financing: Loan is $615/month, Lease is $475/month. You can see all the details and photos on your screen!"
```

---

## ✅ Step 3: Verify Setup

After adding the tools and prompt:

1. **Test search_car**: Say "Show me a Camry"
   - Should display car card on right
   
2. **Test get_financing_options**: Say "How much would that cost per month?"
   - Should display financing card on right
   
3. **Test get_trim_recommendations**: Say "I need AWD and heated seats"
   - Should display trim recommendation card on right

---

## 🎯 Quick Test Phrases

Try these to test each tool:

| Phrase | Tool It Should Use |
|--------|-------------------|
| "Show me a 2019 Tacoma" | `search_car` |
| "How much would a $35,000 RAV4 cost per month?" | `get_financing_options` |
| "I need AWD and Apple CarPlay" | `get_trim_recommendations` |
| "Which Highlander has heated seats?" | `get_trim_recommendations` |
| "Show me a Camry Hybrid and tell me the monthly payment" | Both `search_car` + `get_financing_options` |

---

## 🔍 Troubleshooting

**If agent says "I don't have access to that tool":**
- Check that you added ALL THREE tools as CLIENT TOOLS in ElevenLabs
- Make sure tool names are exactly: `search_car`, `get_financing_options`, `get_trim_recommendations`
- Verify the system prompt mentions the tools

**If tools aren't being called:**
- Make sure the description clearly states WHEN to use the tool
- System prompt should have clear examples
- Try more explicit phrasing: "Use the get_trim_recommendations tool to..."

**If you get errors:**
- Check backend is running: `http://localhost:8000`
- Check browser console for error messages
- Check backend console for API errors

---

## 📱 Expected Behavior

When tools are called correctly:

1. **Cards appear on RIGHT side** of screen
2. **Multiple cards can be open** at once
3. **Cards don't overlap** - they stack nicely
4. **Cards are expandable** - click arrow to see full details
5. **Agent knows the results** - it can talk about what the tool returned

---

## 🎉 You're Ready!

Once you've added all three tools and the system prompt to ElevenLabs, your agent will be able to:
- ✅ Show vehicles with real photos
- ✅ Calculate loan vs lease options
- ✅ Recommend trims based on features
- ✅ Combine tools for complete assistance

Happy selling! 🚗💨


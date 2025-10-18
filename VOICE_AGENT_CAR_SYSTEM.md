# Voice Agent Car Display System

## 📋 Overview

This system allows the ElevenLabs voice agent to display car information dynamically during conversations. Unlike tamuhack-25's survey-based recommendation system, this uses a **conversational approach** where the agent gathers information through natural dialogue.

## 🔄 System Comparison

### **tamuhack-25 System** (Survey-Based)
```
User fills survey → Saves preferences → Recommendation engine scores ALL vehicles → Cache results → Display top matches
```

**Components:**
- ✅ Full user preferences survey (vehicle types, features, budget, etc.)
- ✅ Recommendation engine with complex scoring algorithm
- ✅ Database caching for performance (24hr TTL)
- ✅ Multiple database tables (users, preferences, recommendations cache)
- ✅ Batch processing of recommendations

**Database Tables:**
- `vehiclesTable` - All vehicle data
- `userPreferencesTable` - Survey responses
- `recommendationsCacheTable` - Pre-calculated scores

---

### **hacktx System** (Voice Agent)
```
User talks to agent → Agent asks questions → Agent searches by make/model → Display specific car
```

**Components:**
- ✅ Voice conversation with ElevenLabs agent
- ✅ Simple make/model lookup (no complex scoring)
- ✅ Direct database query (no caching needed)
- ✅ Single database table (vehicles)
- ✅ On-demand car display

**Database Tables:**
- `vehicles` - All vehicle data (ONLY table needed)

## 🏗️ Architecture

### **Database Requirements**

**DO YOU NEED A DATABASE?**  
✅ **YES** - You already have it! You're using Supabase with the `vehicles` table.

**What you DON'T need:**
- ❌ User preferences table (agent asks conversationally)
- ❌ Recommendations cache table (no pre-calculation)
- ❌ Recommendation engine (direct lookup)

### **Backend Structure**

```
backend/
├── routes/
│   ├── car_routes.py          # Direct car lookup endpoints
│   ├── agent_tools.py         # Server tools for ElevenLabs
│   └── eleven_routes.py       # Existing ElevenLabs routes
└── utils/
    └── initialize_supabase.py  # Database connection
```

### **Frontend Structure**

```
frontend/src/
├── pages/Avatar/
│   └── Avatar.tsx             # Voice agent interface
├── components/
│   └── CarSidebar.tsx         # Car display component
└── lib/api/
    ├── cars.ts                # Car search API calls
    └── elevenlabs.ts          # ElevenLabs integration
```

## 🔧 How It Works

### **Flow Diagram**

```
┌─────────────┐
│   User      │ "Tell me about a Toyota Camry"
└──────┬──────┘
       │
       v
┌─────────────────────────────────────┐
│   ElevenLabs Voice Agent           │
│   - Understands: make="Toyota"     │
│   - Understands: model="Camry"     │
└──────┬──────────────────────────────┘
       │
       │ Calls server tool
       v
┌─────────────────────────────────────┐
│   Backend: /api/agent-tools/        │
│   search-car                        │
│   - Queries Supabase vehicles table │
│   - Returns formatted car data      │
└──────┬──────────────────────────────┘
       │
       │ Returns JSON with car data
       v
┌─────────────────────────────────────┐
│   Voice Agent                       │
│   - Receives car data              │
│   - Calls displayCarInfo client tool│
└──────┬──────────────────────────────┘
       │
       │ Client tool call
       v
┌─────────────────────────────────────┐
│   Frontend: displayCarInfo()       │
│   - Parses car data                │
│   - Opens CarSidebar component     │
└──────┬──────────────────────────────┘
       │
       v
┌─────────────────────────────────────┐
│   User sees beautiful sidebar       │
│   - 360° car images                │
│   - Specs, colors, features        │
│   - Match analysis                 │
└─────────────────────────────────────┘
```

### **Step-by-Step Process**

1. **User speaks**: "Show me a 2024 Toyota Camry"

2. **Agent extracts data**:
   - make: "Toyota"
   - model: "Camry"
   - year: "2024" (optional)

3. **Agent calls server tool** (`searchCar`):
   ```json
   POST /api/agent-tools/search-car
   {
     "make": "Toyota",
     "model": "Camry",
     "year": "2024"
   }
   ```

4. **Backend searches Supabase**:
   - Case-insensitive search on make/model
   - Orders by year DESC (newest first)
   - Returns first match

5. **Backend formats data**:
   - Extracts all vehicle fields
   - Adds default scores (no recommendation engine)
   - Generates features list
   - Returns JSON string

6. **Agent receives response**:
   ```json
   {
     "success": true,
     "carData": "{...vehicle data JSON...}",
     "message": "Found 2024 Toyota Camry..."
   }
   ```

7. **Agent calls client tool** (`displayCarInfo`):
   - Passes `carData` JSON string
   - Client tool registered in React app

8. **Frontend displays**:
   - Parses JSON
   - Opens CarSidebar
   - Shows interactive car display

## 🛠️ Implementation

### **1. ElevenLabs Agent Setup**

#### **Server Tool: searchCar**

**Name:** `searchCar`  
**Type:** Server (Webhook)  
**URL:** `https://your-backend.com/api/agent-tools/search-car`  
**Method:** POST

**Parameters:**
| Name  | Type   | Required | Description |
|-------|--------|----------|-------------|
| make  | string | Yes      | Car manufacturer (e.g., "Toyota") |
| model | string | Yes      | Car model (e.g., "Camry") |
| year  | string | No       | Model year (e.g., "2024") |

**Description for LLM:**
```
Use this tool to search for vehicle information when the user asks about a specific car make and model. Extract the make and model from the conversation and call this tool. The tool will return car data that you can then display using the displayCarInfo client tool.

Examples:
- User: "Tell me about a Toyota Camry" → searchCar(make="Toyota", model="Camry")
- User: "Show me a 2024 Honda Accord" → searchCar(make="Honda", model="Accord", year="2024")
- User: "What about a Prius?" → searchCar(make="Toyota", model="Prius")
```

#### **Client Tool: displayCarInfo**

**Name:** `displayCarInfo`  
**Type:** Client  
**Wait for response:** ✅ Checked

**Parameters:**
| Name    | Type   | Required | Description |
|---------|--------|----------|-------------|
| carData | string | Yes      | JSON string with complete vehicle information from searchCar |

**Description for LLM:**
```
Use this tool to display a visual sidebar with car information after you've searched for a vehicle using searchCar. Pass the carData JSON string received from searchCar directly to this tool.

Flow:
1. User asks about a car
2. Call searchCar to get vehicle data
3. If successful, call displayCarInfo with the carData from searchCar response
4. User will see an interactive sidebar with car details

Example:
User: "Show me a Toyota Camry"
1. You call: searchCar(make="Toyota", model="Camry")
2. You receive: {"success": true, "carData": "{...json...}"}
3. You call: displayCarInfo(carData=carData_from_step2)
4. Say: "Here's the Toyota Camry with all its details!"
```

### **2. Agent System Prompt**

Add this to your agent's system prompt:

```
You are a helpful car shopping assistant. You can search for vehicles and display detailed information about them.

When a user asks about a specific car:
1. Extract the make and model (and year if mentioned)
2. Use the searchCar tool to find the vehicle
3. If found, use displayCarInfo to show it visually
4. Describe key features while the user views the display

Example conversation:
User: "Tell me about a Toyota Camry"
You: "Let me find information about the Toyota Camry for you."
[Call searchCar with make="Toyota", model="Camry"]
[Call displayCarInfo with the returned carData]
You: "Here's the Toyota Camry! As you can see, it's a midsize sedan with excellent fuel economy. You can see the different color options on the side. What would you like to know about it?"

Remember:
- Always search before displaying (searchCar → displayCarInfo)
- Mention features visible in the sidebar
- Ask follow-up questions about preferences
- Be enthusiastic about the vehicles!
```

### **3. Testing

 the System**

#### **Test with curl:**

```bash
# Test server tool
curl -X POST http://localhost:8000/api/agent-tools/search-car \
  -H "Content-Type: application/json" \
  -d '{"make": "Toyota", "model": "Camry"}'

# Test direct car search
curl "http://localhost:8000/api/cars/search?make=Toyota&model=Camry"
```

#### **Test with agent:**

1. Start conversation with agent
2. Say: "Show me a Toyota Camry"
3. Agent should:
   - Call searchCar tool
   - Receive car data
   - Call displayCarInfo
   - Sidebar appears with car details

## 🎯 Key Differences from tamuhack-25

| Feature | tamuhack-25 | hacktx (Voice Agent) |
|---------|-------------|----------------------|
| **User Input** | Survey form | Voice conversation |
| **Search Method** | Score all vehicles | Direct lookup |
| **Scoring** | Complex algorithm | Simple defaults |
| **Caching** | Required (24hr) | Not needed |
| **Database Tables** | 3 tables | 1 table |
| **Response Time** | Pre-calculated | On-demand |
| **Use Case** | Browse many matches | Show specific car |
| **Complexity** | High | Low |

## 🚀 Advantages of Voice Agent Approach

1. **Simpler**: No recommendation engine needed
2. **Faster**: Direct database query
3. **Natural**: Conversational experience
4. **Flexible**: Can show any car on demand
5. **Less Infrastructure**: Only need vehicles table
6. **Real-time**: No cache invalidation issues

## 📝 Summary

**Do you need a database?**  
✅ Yes, but you already have it (Supabase with vehicles table)

**Do you need the recommendation engine?**  
❌ No, the voice agent handles the "recommendation" through conversation

**Do you need preference storage?**  
❌ No, the agent remembers context during the conversation

**Do you need caching?**  
❌ No, direct queries are fast enough

**What DO you need?**
- ✅ Supabase database with vehicles table (you have this)
- ✅ Backend API endpoints (now created)
- ✅ ElevenLabs server tool configured
- ✅ ElevenLabs client tool configured
- ✅ Frontend client tool registration (already done)

**You're ready to go!** 🎉


# Quick Setup Guide - Voice Agent Car Display

## 🚀 Setup in 5 Minutes

### 1. **Backend Setup** (Already Done! ✅)

Your backend now has:
- ✅ `car_routes.py` - Direct car lookup endpoints  
- ✅ `agent_tools.py` - Server tool for ElevenLabs
- ✅ Routers added to `main.py`

### 2. **Test Backend** (Optional)

```bash
# Start your backend
cd backend
python main.py

# Test in another terminal
curl "http://localhost:8000/api/cars/search?make=Toyota&model=Camry"
```

### 3. **Configure ElevenLabs Agent**

#### **Step 3.1: Add Server Tool**

Go to your agent dashboard → Tools → Add Tool:

**Tool Configuration:**
- **Name:** `searchCar`
- **Type:** Server (Webhook)
- **URL:** `http://your-backend-url:8000/api/agent-tools/search-car`
- **Method:** POST
- **Description:** 
  ```
  Search for a vehicle by make and model. Extract the make and model from user's request and call this tool. Returns vehicle data that can be displayed using displayCarInfo.
  
  Use when user asks about specific cars like:
  - "Tell me about a Toyota Camry"
  - "Show me a Honda Accord"
  - "What's available in the Prius?"
  ```

**Parameters:**
1. **make**
   - Type: String
   - Required: ✅
   - Description: "Car manufacturer (e.g., Toyota, Honda, Ford)"

2. **model**
   - Type: String
   - Required: ✅
   - Description: "Car model name (e.g., Camry, Accord, F-150)"

3. **year**
   - Type: String
   - Required: ❌
   - Description: "Optional model year (e.g., 2024, 2023)"

#### **Step 3.2: Client Tool Already Configured** ✅

You already have `displayCarInfo` client tool set up!

Just make sure in the agent dashboard it has:
- **Wait for response:** ✅ Checked
- **Description includes:** "Use this after calling searchCar to display the vehicle visually"

### 4. **Update Agent System Prompt**

Add to your agent's system prompt:

```
## Car Information Display

When users ask about specific vehicles:

1. Extract make and model from their request
2. Call searchCar(make="...", model="...", year="...") 
3. If successful, immediately call displayCarInfo(carData=result)
4. Reference the visual display in your response

Example flow:
User: "Show me a Toyota Camry"
You (thinking): Extract make="Toyota", model="Camry"
You (action): Call searchCar
You (action): Call displayCarInfo with the carData
You (speaking): "Here's the Toyota Camry! As you can see, it's a stylish midsize sedan. You can interact with the color options on the sidebar. What features are important to you?"

Key guidelines:
- Always search before displaying (searchCar → displayCarInfo)
- Mention what's visible: "You can see the 360° view and different colors"
- Ask follow-up questions about their preferences
- If searchCar fails, suggest alternative models
```

### 5. **Test the System**

#### **Start both servers:**

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

#### **Test conversation:**

1. Open frontend (http://localhost:5173)
2. Go to Avatar page
3. Click "Start Conversation"
4. Say: **"Show me a Toyota Camry"**

**Expected result:**
- Agent calls searchCar
- Agent calls displayCarInfo
- Sidebar slides in with car details
- Agent mentions the display

### 6. **Troubleshooting**

#### **Sidebar doesn't appear:**

Check browser console for errors:
```javascript
// Should see:
displayCarInfo called with parameters: {...}
```

#### **Agent doesn't call tools:**

- Check tool names match exactly (case-sensitive)
- Check server tool URL is correct
- View agent dashboard → Conversation logs

#### **Backend errors:**

```bash
# Check backend is running
curl http://localhost:8000/

# Check car search works
curl "http://localhost:8000/api/cars/search?make=Toyota&model=Camry"
```

#### **No cars found:**

Make sure your Supabase `vehicles` table has data for Toyota vehicles.

### 7. **Environment Variables**

Create/update `.env` files:

**Backend `.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

**Frontend `.env`:**
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ELEVENLABS_AGENT_ID=your_agent_id
```

## 🎯 Quick Reference

### **Agent Flow**
```
User speaks → Agent extracts make/model → searchCar → displayCarInfo → Sidebar shows
```

### **Tool Call Sequence**
```typescript
1. searchCar({ make: "Toyota", model: "Camry" })
   → Returns: { success: true, carData: "{...json...}" }

2. displayCarInfo({ carData: carData_from_step_1 })
   → Shows: Beautiful sidebar with car details
```

### **Common User Phrases**
- "Show me a Toyota Camry"
- "Tell me about the Honda Accord"  
- "What's available in a Prius?"
- "I want to see a 2024 Ford F-150"

## ✅ You're Done!

Your voice agent can now:
- ✅ Search for cars by make/model
- ✅ Display beautiful car details
- ✅ Show 360° images and colors
- ✅ Provide specifications
- ✅ Enable interactive exploration

**No complex recommendation engine needed!** 🎉


# 🔧 ElevenLabs Tool Configuration

## Tool Name: `search_car`

## Parameters for ElevenLabs:

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
      "description": "Model name like Camry, Prius, RAV4, Tacoma, Highlander, 4Runner, Corolla, Tundra",
      "example": "Camry"
    },
    "year": {
      "type": "string",
      "description": "Optional: Model year like '2024'. Use '2024' for full pricing and 360° images. Defaults to newest if omitted.",
      "example": "2024"
    },
    "fuelType": {
      "type": "string",
      "description": "Optional: Filter by fuel type. Options: 'Regular' (gasoline), 'Hybrid' (gas+electric), 'Electric', 'E85'",
      "example": "Hybrid"
    },
    "drive": {
      "type": "string",
      "description": "Optional: Filter by drive type. Options: 'Front-Wheel', 'Rear-Wheel', 'All-Wheel', '4-Wheel', 'Part-time 4-Wheel'",
      "example": "All-Wheel"
    },
    "minMpg": {
      "type": "number",
      "description": "Optional: Minimum combined MPG. Use for finding fuel-efficient vehicles (e.g., 30, 40, 50)",
      "example": 30
    },
    "maxPrice": {
      "type": "number",
      "description": "Optional: Maximum MSRP in dollars. Only returns vehicles with pricing. Use for budget constraints (e.g., 35000, 50000)",
      "example": 35000
    }
  },
  "required": ["make", "model"]
}
```

---

## Data Coverage (What Actually Has Values)

| Parameter | Coverage | Notes |
|-----------|----------|-------|
| `make` | 100% | Always "Toyota" |
| `model` | 100% | All vehicles have model name |
| `year` | 100% | 2015-2026 available |
| `fuelType` | 100% | All 809 vehicles ✅ |
| `drive` | 100% | All 809 vehicles ✅ |
| `minMpg` | 100% | All 809 vehicles have MPG ✅ |
| `maxPrice` | 8.2% | Only 66 vehicles (2024 models) have pricing ⚠️ |

---

## Example Use Cases

### 1. Basic Search
```
User: "Show me a Camry"
Agent: search_car(make="Toyota", model="Camry", year="2024")
```

### 2. Fuel-Efficient Vehicle
```
User: "I want a fuel-efficient car, at least 40 MPG"
Agent: search_car(make="Toyota", model="Prius", year="2024", minMpg=40)
```

### 3. AWD Vehicle
```
User: "Show me a RAV4 with all-wheel drive"
Agent: search_car(make="Toyota", model="RAV4", year="2024", drive="All-Wheel")
```

### 4. Budget-Conscious
```
User: "What Toyota can I get for under $30,000?"
Agent: search_car(make="Toyota", model="Corolla", year="2024", maxPrice=30000)
```

### 5. Hybrid Under Budget
```
User: "Show me a hybrid under $40k"
Agent: search_car(make="Toyota", model="Prius", year="2024", fuelType="Hybrid", maxPrice=40000)
```

### 6. 4WD Truck
```
User: "I need a 4-wheel drive truck"
Agent: search_car(make="Toyota", model="Tacoma", year="2024", drive="4-Wheel")
```

---

## Valid Filter Values

### Fuel Types (case-insensitive, partial match):
- `"Regular"` - Regular gasoline
- `"Hybrid"` - Hybrid vehicles (will match "Regular Gas and Electricity")
- `"Electric"` - Electric or plug-in hybrid
- `"E85"` - Flex fuel vehicles

### Drive Types (case-insensitive, partial match):
- `"Front-Wheel"` or `"FWD"` - Front-wheel drive
- `"Rear-Wheel"` or `"RWD"` - Rear-wheel drive
- `"All-Wheel"` or `"AWD"` - All-wheel drive
- `"4-Wheel"` or `"4WD"` - 4-wheel drive
- `"Part-time"` - Part-time 4WD

### MPG Ranges (approximate):
- **Economy**: 30-40 MPG (Corolla, Camry)
- **Hybrid**: 40-60 MPG (Prius, RAV4 Hybrid)
- **Performance/Truck**: 15-25 MPG (Tundra, 4Runner, GR Supra)
- **SUV**: 20-35 MPG (RAV4, Highlander)

### Price Ranges (2024 models only):
- **Budget**: $22k-$28k (Corolla, Corolla Cross)
- **Mid-range**: $28k-$40k (Camry, Prius, RAV4)
- **Premium**: $40k-$60k (Highlander, 4Runner, Land Cruiser)
- **Luxury/Performance**: $60k+ (Tundra PRO, GR Supra, Sequoia)

---

## Important Notes

1. **Always use `year="2024"`** for best results (pricing + 360° images)
2. **`maxPrice` only works with 2024 models** (only they have MSRP data)
3. **Filters are additive** - more filters = more specific results
4. **Partial matches work** - "Hybrid" matches "Regular Gas and Electricity"
5. **Case-insensitive** - "front-wheel" = "Front-Wheel" = "FWD"


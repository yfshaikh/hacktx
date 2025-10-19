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

---

## Data Coverage (What Actually Has Values)

| Parameter | Coverage | Notes |
|-----------|----------|-------|
| `make` | 100% | Always "Toyota" |
| `model` | 100% | All vehicles have model name |
| `year` | 100% | 2015-2020 available |
| Images | 100% | All vehicles have real photos from cars.com ✅ |
| Pricing | 100% | All vehicles have MSRP ✅ |
| Specs | 100% | Horsepower, seating, dimensions, drivetrain, body style ✅ |

### Data Source:
- **Scraped from cars.com**: Real high-quality photos, detailed specs, accurate pricing
- **Years covered**: 2015-2020
- **Photo count**: Multiple angles per vehicle (typically 20-40+ photos)
- **Interactive**: Users can drag to rotate through photos

---

## Example Use Cases

### 1. Basic Search
```
User: "Show me a Camry"
Agent: search_car(make="Toyota", model="Camry")
```

### 2. Specific Year
```
User: "Show me a 2018 RAV4"
Agent: search_car(make="Toyota", model="RAV4", year="2018")
```

### 3. SUV Request
```
User: "Show me a 4Runner"
Agent: search_car(make="Toyota", model="4Runner")
```

### 4. Truck Request
```
User: "I want to see a Tacoma"
Agent: search_car(make="Toyota", model="Tacoma")
```

### 5. Sedan Request
```
User: "Show me a 2017 Camry"
Agent: search_car(make="Toyota", model="Camry", year="2017")
```

### 6. Minivan Request
```
User: "Show me a Sienna"
Agent: search_car(make="Toyota", model="Sienna")
```

---

## Available Models

Popular models in the database (2015-2020):

### Sedans:
- Camry
- Corolla
- Avalon

### SUVs:
- RAV4
- 4Runner
- Highlander
- Sequoia

### Trucks:
- Tacoma
- Tundra

### Hybrids:
- Prius
- Camry Hybrid
- RAV4 Hybrid
- Highlander Hybrid

### Minivan:
- Sienna

---

## Important Notes

1. **All vehicles have real photos** - High-quality images from cars.com
2. **Interactive viewing** - Users can drag through 20-40+ photos per vehicle
3. **Complete data** - Every vehicle has pricing, specs, and multiple photos
4. **Year range** - 2015-2020 Toyota models
5. **Partial matches work** - "Runner" will find "4Runner"
6. **Case-insensitive** - "camry" = "Camry" = "CAMRY"
7. **Default to newest** - If no year specified, returns the most recent available


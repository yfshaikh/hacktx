from openai import OpenAI
from pydantic import BaseModel
from typing import Optional, List
import json
from dotenv import load_dotenv
import os
from openai import OpenAI

# Load environment variables
load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')
model = os.getenv('MODEL_CHOICE', 'gpt-4o-mini')

# Initialize OpenAI client
client = OpenAI(api_key=api_key)

# ============================================================================
# STRUCTURED OUTPUT MODELS
# ============================================================================

class LoanOption(BaseModel):
    """Best loan option details"""
    monthly_payment: float
    total_interest: float
    total_cost: float
    apr: float
    term_months: int
    down_payment: float

class LeaseOption(BaseModel):
    """Best lease option details"""
    monthly_payment: float
    total_lease_payments: float
    residual_value: float
    buyout_cost: float
    total_if_purchased: float
    term_months: int
    apr: float

class FinancingOptions(BaseModel):
    """Final response with best loan and lease options"""
    best_loan: LoanOption
    best_lease: LeaseOption

# ============================================================================
# HELPER FUNCTIONS FOR CALCULATIONS
# ============================================================================

def calculate_monthly_payment(principal: float, annual_rate: float, months: int) -> float:
    """Calculate monthly payment using amortization formula"""
    if annual_rate == 0:
        return principal / months
    
    monthly_rate = annual_rate / 100 / 12
    payment = principal * (monthly_rate * (1 + monthly_rate)**months) / \
              ((1 + monthly_rate)**months - 1)
    return round(payment, 2)

def calculate_lease_monthly_payment(msrp: float, residual_percent: float, 
                                   money_factor: float, months: int, 
                                   down_payment: float = 0) -> dict:
    """Calculate lease payment breakdown"""
    residual_value = msrp * (residual_percent / 100)
    depreciation_fee = (msrp - residual_value - down_payment) / months
    finance_fee = (msrp + residual_value) * money_factor
    monthly_payment = depreciation_fee + finance_fee
    
    return {
        'monthly_payment': round(monthly_payment, 2),
        'residual_value': round(residual_value, 2)
    }

def calculate_depreciation(initial_value: float, years: int) -> dict:
    """Calculate vehicle depreciation using industry standards"""
    value = initial_value
    depreciation_rates = {1: 0.20, 2: 0.15, 3: 0.10, 4: 0.10, 5: 0.10}
    
    for year in range(1, years + 1):
        rate = depreciation_rates.get(year, 0.05)
        value *= (1 - rate)
    
    depreciation_amount = initial_value - value
    depreciation_percent = (depreciation_amount / initial_value) * 100
    
    return {
        'value_after_years': round(value, 2),
        'depreciation_amount': round(depreciation_amount, 2),
        'depreciation_percentage': round(depreciation_percent, 2)
    }

def apr_to_money_factor(apr: float) -> float:
    """Convert APR to money factor"""
    return round(apr / 2400, 6)

# ============================================================================
# TOOL IMPLEMENTATIONS
# ============================================================================

def tool_calculate_loan(vehicle_price: float, down_payment: float, 
                       apr: float, loan_term_months: int) -> str:
    """Calculate complete loan details"""
    principal = vehicle_price - down_payment
    monthly_payment = calculate_monthly_payment(principal, apr, loan_term_months)
    total_paid = monthly_payment * loan_term_months
    total_interest = total_paid - principal
    total_cost = total_paid + down_payment
    
    result = {
        'monthly_payment': monthly_payment,
        'total_interest': round(total_interest, 2),
        'total_cost': round(total_cost, 2),
        'apr': apr,
        'loan_term_months': loan_term_months,
        'principal': principal,
        'down_payment': down_payment
    }
    
    return json.dumps(result)

def tool_calculate_lease(msrp: float, residual_percent: float, apr: float,
                        lease_term_months: int, down_payment: float = 0) -> str:
    """Calculate complete lease details including buyout cost"""
    money_factor = apr_to_money_factor(apr)
    lease_calc = calculate_lease_monthly_payment(
        msrp, residual_percent, money_factor, lease_term_months, down_payment
    )
    
    monthly_payment = lease_calc['monthly_payment']
    residual_value = lease_calc['residual_value']
    total_lease_payments = (monthly_payment * lease_term_months) + down_payment
    total_cost_if_bought = total_lease_payments + residual_value
    
    result = {
        'monthly_payment': monthly_payment,
        'total_lease_payments': round(total_lease_payments, 2),
        'residual_value': residual_value,
        'buyout_cost': residual_value,
        'total_cost_if_bought': round(total_cost_if_bought, 2),
        'lease_term_months': lease_term_months,
        'apr': apr,
        'down_payment': down_payment
    }
    
    return json.dumps(result)

def tool_calculate_depreciation(vehicle_price: float, years: int) -> str:
    """Calculate how much the vehicle will depreciate"""
    depreciation = calculate_depreciation(vehicle_price, years)
    return json.dumps(depreciation)

# ============================================================================
# AGENT TOOLS CONFIGURATION
# ============================================================================

tools = [
    {
        "type": "function",
        "function": {
            "name": "calculate_loan",
            "description": "Calculate monthly payment, total interest, and total cost for an auto loan",
            "parameters": {
                "type": "object",
                "properties": {
                    "vehicle_price": {"type": "number", "description": "Total price of the vehicle"},
                    "down_payment": {"type": "number", "description": "Down payment amount"},
                    "apr": {"type": "number", "description": "Annual Percentage Rate"},
                    "loan_term_months": {"type": "number", "description": "Loan term in months"}
                },
                "required": ["vehicle_price", "down_payment", "apr", "loan_term_months"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_lease",
            "description": "Calculate lease payment, residual value, buyout cost, and total cost if purchased",
            "parameters": {
                "type": "object",
                "properties": {
                    "msrp": {"type": "number", "description": "Vehicle MSRP"},
                    "residual_percent": {"type": "number", "description": "Residual value percentage (50-65%)"},
                    "apr": {"type": "number", "description": "Lease APR"},
                    "lease_term_months": {"type": "number", "description": "Lease term in months"},
                    "down_payment": {"type": "number", "description": "Down payment (default: 0)"}
                },
                "required": ["msrp", "residual_percent", "apr", "lease_term_months"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "calculate_depreciation",
            "description": "Calculate vehicle depreciation over time",
            "parameters": {
                "type": "object",
                "properties": {
                    "vehicle_price": {"type": "number", "description": "Current vehicle value"},
                    "years": {"type": "number", "description": "Years to project"}
                },
                "required": ["vehicle_price", "years"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "web_search",
            "description": "Search for current auto loan rates, lease deals, or vehicle prices",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"}
                },
                "required": ["query"]
            }
        }
    }
]

# ============================================================================
# AGENT EXECUTION
# ============================================================================

def run_auto_finance_agent(user_message: str, model: str = "gpt-4o") -> FinancingOptions:
    """
    Run the auto financing agent and return structured financing options
    """
    messages = [
        {
            "role": "system",
            "content": """You are an auto financing advisor. Your job is to:

1. Calculate the BEST loan option (optimal term and rate)
2. Calculate the BEST lease option (optimal term and residual)
3. Return ONLY the final comparison in the specified JSON format

Use tools to calculate loans, leases, and depreciation. After calculations, 
respond with ONLY a JSON object matching this structure:

{
    "vehicle": "vehicle name/model",
    "vehicle_price": 0,
    "best_loan": {
        "monthly_payment": 0,
        "total_interest": 0,
        "total_cost": 0,
        "apr": 0,
        "term_months": 0,
        "down_payment": 0
    },
    "best_lease": {
        "monthly_payment": 0,
        "total_lease_payments": 0,
        "residual_value": 0,
        "buyout_cost": 0,
        "total_if_purchased": 0,
        "term_months": 0,
        "apr": 0
    },
    "recommendation": "loan" or "lease",
    "why": "brief explanation for average buyer"
}

Keep the "why" field under 100 words and focus on what matters to buyers:
monthly payment, total cost, and flexibility."""
        },
        {"role": "user", "content": user_message}
    ]
    
    iteration = 0
    max_iterations = 10
    
    while iteration < max_iterations:
        iteration += 1
        
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )
        
        message = response.choices[0].message
        messages.append(message)
        
        if message.tool_calls:
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                
                if function_name == "calculate_loan":
                    result = tool_calculate_loan(**arguments)
                elif function_name == "calculate_lease":
                    result = tool_calculate_lease(**arguments)
                elif function_name == "calculate_depreciation":
                    result = tool_calculate_depreciation(**arguments)
                elif function_name == "web_search":
                    result = json.dumps({
                        "note": "Web search: " + arguments['query'],
                        "message": "Integrate with real search API in production"
                    })
                else:
                    result = json.dumps({"error": "Unknown function"})
                
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": result
                })
        else:
            # Parse and return structured response
            try:
                response_data = json.loads(message.content)
                return FinancingOptions(**response_data)
            except:
                return message.content
    
    return "Max iterations reached"

# ============================================================================
# EXAMPLE USAGE
# ============================================================================

if __name__ == "__main__":
    query = """
    I'm looking at a 2024 Honda Accord priced at $32,000. 
    Find me the best loan option and best lease option. 
    I can put $3,000 down.
    """
    
    result = run_auto_finance_agent(query)
    
    print("🚗 AUTO FINANCING OPTIONS")
    print("=" * 60)
    print(json.dumps(result.model_dump() if isinstance(result, FinancingOptions) else result, indent=2))
    
    # Example with different vehicle
    query2 = """
    Compare financing options for a $45,000 Tesla Model 3.
    I have $5,000 for down payment. Show me best loan vs best lease.
    """
    
    # result2 = run_auto_finance_agent(query2)
    # print(json.dumps(result2.model_dump(), indent=2))
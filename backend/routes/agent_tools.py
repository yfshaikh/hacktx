"""
Server-side tools for the ElevenLabs voice agent
These tools can be called by the agent to fetch data
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from utils.initialize_supabase import get_supabase_client
from typing import Optional
import json

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import logging
import json


from ai_agents.loanAgent import run_auto_finance_agent, FinancingOptions
from ai_agents.trimRecAgent import trim_mapper, TrimRankingOutput
from agents import Runner

logger = logging.getLogger(__name__)


agent_router = APIRouter(prefix="/agents", tags=["agents"])

class SearchCarRequest(BaseModel):
    make: str
    model: str
    year: Optional[str] = None
    fuelType: Optional[str] = None  # e.g., "Regular", "Gasoline or E85", "Regular Gas and Electricity"
    drive: Optional[str] = None  # e.g., "Front-Wheel Drive", "All-Wheel Drive", "4-Wheel Drive"
    minMpg: Optional[int] = None  # Minimum combined MPG
    maxPrice: Optional[int] = None  # Maximum MSRP

class LoanAgent(BaseModel):
    """Request model for loan agent"""
    user_message: str
    model: Optional[str] = "gpt-4o-mini"

class TrimRecAgent(BaseModel):
    """Request model for trim recommendation agent"""
    features: List[str]
    model_candidates: Optional[List[str]] = None

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int

@agent_router.post("/search-car")
async def search_car_tool(request: SearchCarRequest):
    """
    Server-side tool for voice agent to search for a car by make/model
    Returns JSON string ready to be passed to displayCarInfo client tool
    
    Searches scraped_cars table which has real photos from cars.com
    This is called by ElevenLabs as a server tool, then the agent can
    pass the result to the displayCarInfo client tool to show the UI
    """
    try:
        supabase = get_supabase_client()
        
        # Import the formatting function from car_routes
        from .car_routes import format_scraped_car
        
        # Search scraped_cars table (has real images from cars.com)
        query = supabase.table('scraped_cars').select('*')
        query = query.ilike('make', request.make)
        query = query.ilike('name', f'%{request.model}%')
        
        if request.year:
            query = query.eq('year', int(request.year))
        
        # Note: Can add filters for scraped data if needed
        # For now, just get the first match
        result = query.order('year', desc=True).limit(1).execute()
        
        if not result.data or len(result.data) == 0:
            return {
                "success": False,
                "error": f"No vehicle found matching {request.make} {request.model}" + (f" {request.year}" if request.year else ""),
                "carData": None
            }
        
        vehicle = result.data[0]
        formatted_vehicle = format_scraped_car(vehicle)
        
        # Build detailed message for the agent with key information
        year = formatted_vehicle.get('year', 'N/A')
        make = formatted_vehicle.get('make', 'N/A')
        model = formatted_vehicle.get('model', 'N/A')
        msrp = formatted_vehicle.get('msrp')
        horsepower = formatted_vehicle.get('horsepower')
        seating = formatted_vehicle.get('seatingCapacity')
        drivetrain = formatted_vehicle.get('drivetrain')
        body_style = formatted_vehicle.get('bodyStyle')
        mpg = formatted_vehicle.get('combinedMpgForFuelType1')
        
        # Create informative message with all key details
        message_parts = [f"Found {year} {make} {model}"]
        if msrp:
            message_parts.append(f"Price: ${msrp:,}")
        if horsepower:
            message_parts.append(f"Horsepower: {horsepower}")
        if seating:
            message_parts.append(f"Seating: {seating}")
        if drivetrain:
            message_parts.append(f"Drivetrain: {drivetrain}")
        if body_style:
            message_parts.append(f"Body Style: {body_style}")
        if mpg:
            message_parts.append(f"MPG: {mpg}")
        
        message_parts.append("Displaying with real photos from cars.com.")
        
        # Return as JSON string for the agent to pass to client tool
        return {
            "success": True,
            "carData": json.dumps(formatted_vehicle),
            "message": " | ".join(message_parts)
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Error searching vehicle: {str(e)}",
            "carData": None
        }

@agent_router.post(
    "/loan",
    response_model=Dict[str, Any],
    summary="Get Auto Financing Options",
    description="Analyze financing options for a vehicle. Returns best loan and lease options based on user's query."
)
async def get_loan_options(request: LoanAgent):
    
    try:
        logger.info(f"Processing loan agent request: {request.user_message[:100]}...")
        
        # Run the loan agent
        result = run_auto_finance_agent(
            user_message=request.user_message,
            model=request.model
        )
        
        # Handle different return types
        if isinstance(result, FinancingOptions):
            return result.model_dump()
        elif isinstance(result, str):
            # If agent returned a string (error or raw response)
            try:
                # Try to parse as JSON
                return json.loads(result)
            except json.JSONDecodeError:
                # Return as message
                return {"message": result}
        else:
            return result
            
    except Exception as e:
        logger.error(f"Error in loan agent: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process loan agent request: {str(e)}"
        )


@agent_router.post(
    "/trim-recommendation",
    response_model=Dict[str, Any],
    summary="Get Toyota Trim Recommendations",
    description="Get ranked Toyota trim and package recommendations based on desired features"
)
async def get_trim_recommendations(request: TrimRecAgent):
    """Get Toyota trim recommendations based on desired features"""
    try:
        logger.info(f"Processing trim recommendation request with {len(request.features)} features")
        logger.info(f"Features: {request.features}")
        logger.info(f"Model candidates: {request.model_candidates}")
        
        # Prepare input for the agent
        agent_input = {
            "features": request.features
        }
        
        if request.model_candidates:
            agent_input["model_candidates"] = request.model_candidates
        
        # Run the trim mapper agent (async)
        result = await Runner.run(
            trim_mapper, 
            input=json.dumps(agent_input)
        )
        
        # Extract the structured output
        final_output = result.final_output_as(TrimRankingOutput)
        
        return final_output.model_dump()
            
    except Exception as e:
        logger.error(f"Error in trim recommendation agent: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process trim recommendation request: {str(e)}"
        )



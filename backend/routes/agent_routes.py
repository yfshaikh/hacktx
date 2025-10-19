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


class LoanAgent(BaseModel):
    """Request model for loan agent"""
    user_message: str
    model: Optional[str] = "gpt-4o-mini"

class TrimRecAgent(BaseModel):
    
    features: List[str]
    model_candidates: Optional[List[str]]

class ErrorResponse(BaseModel):
    error: str
    detail: Optional[str] = None
    status_code: int


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
 
    try:
        logger.info(f"Processing trim recommendation request with {len(request.features)} features")
        
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




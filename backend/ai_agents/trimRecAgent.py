# trim_mapper.py
# pip install openai-agents pydantic

from __future__ import annotations
import asyncio, json
from typing import List
from pydantic import BaseModel, ConfigDict
from agents import Agent, Runner, WebSearchTool, ModelSettings
from dotenv import load_dotenv
import os
from openai import OpenAI

# Load environment variables
load_dotenv()
api_key = os.getenv('OPENAI_API_KEY')
model = os.getenv('MODEL_CHOICE', 'gpt-4o-mini')

# Initialize OpenAI client
client = OpenAI(api_key=api_key)


class RankedTrim(BaseModel):
    model: str
    year: int
    trim: str
    trim_packages: List[str]
    included_desired_features: List[str]
    feature_gaps: List[str]
    model_config = ConfigDict(extra="forbid")

class TrimRankingOutput(BaseModel):
    ranked_trims: List[RankedTrim]
    model_config = ConfigDict(extra="forbid")


TRIM_MAPPER_SYS_PROMPT = """
You are TrimMapper. Translate a user’s must-have features into the best Toyota trims and factory packages across relevant Toyota models. You only recommend Toyota vehicles.

Input (JSON): { "features": [...], "model_candidates": [...] }

Interpretation rules:
- Treat features as strict requirements unless the user marks otherwise.
- Users may prefix items with:
  - "must:" or "!" → must-have
  - "nice:" → nice-to-have
  - "avoid:" → exclude
- Normalize shorthand to Toyota canon (examples: ACC → Toyota Safety Sense adaptive cruise; lane keep → Lane Tracing Assist; BSM → Blind Spot Monitor; CarPlay; panoramic roof; AWD/4x4; heated/ventilated seats; wireless charging; hybrid/PHEV).

Sourcing rules (critical):
- Map features only to official Toyota trims and factory packages.
- No port/dealer add-ons unless they are listed as official packages on Toyota or an authorized Toyota dealer website.
- You must verify EVERYTHING directly on Toyota’s official sites (e.g., toyota.com, regional toyota pages) or authorized Toyota dealer sites. Do not use third-party aggregators.
- If any requested feature cannot be confirmed from official sources, do NOT claim it. Instead, list it in feature_gaps with a brief reason (e.g., “not shown on Toyota spec page”, “package availability unclear”).

Selection rules:
- Prefer model_candidates if provided; otherwise, consider Toyota’s current U.S. lineup.
- If a feature requires a package or higher trim, include the official package name as shown on Toyota / authorized dealer sites.
- Rank top 3–5 trims that best satisfy must-have features, then nice-to-haves, while honoring avoids.

Output format (strict):
Return ONLY strict JSON with a single key "ranked_trims" (3–5 items). No other keys or text.
Each item must include ONLY:
  - model (string)
  - year (number)
  - trim (string)
  - trim_packages (array of official package names)
  - included_desired_features (array of the user’s desired features you confirmed)
  - feature_gaps (array of desired features not included or unconfirmable, with a brief reason)
Do not output anything else.
"""


web_tool = WebSearchTool(
    search_context_size="high"
)


trim_mapper = Agent(
    name="TrimMapper",
    instructions=TRIM_MAPPER_SYS_PROMPT,
    tools=[web_tool],
    # Structured output enforced here:
    output_type=TrimRankingOutput,

    model=model,
)


async def demo():
    sample_input = {
        "features": [
            "!: AWD",
            "must: BSM",
            "must: CarPlay",
            "nice: panoramic roof",
            "avoid: cloth seats",
            "ventilated seats",
            "ACC",
            "lane keep"
        ],
        "model_candidates": ["RAV4", "Highlander", "Camry"]
    }

    # Pass JSON text as input so the agent treats it as a single payload.
    result = await Runner.run(trim_mapper, input=json.dumps(sample_input))

    final = result.final_output_as(TrimRankingOutput)
    print(final.model_dump_json(indent=2))

if __name__ == "__main__":
    asyncio.run(demo())


'''
JSON Output:
{
      "model": "Highlander",
      "year": 2023,
      "trim": "Platinum",
      "trim_packages": [
        "Platinum Package"
      ],
      "included_desired_features": [
        "AWD",
        "Blind Spot Monitor (BSM)",
        "Apple CarPlay",
        "panoramic roof",
        "ventilated seats",
        "Adaptive Front-Lighting System (ACC)",
        "Lane Tracing Assist"
      ],
      "feature_gaps": [
        "cloth seats"
      ]
    },
'''
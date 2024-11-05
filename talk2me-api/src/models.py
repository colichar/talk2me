from pydantic import BaseModel
from typing import Dict

class ProcessedAudioResponse(BaseModel):
    message: str
    result: Dict[str, str]

from pydantic import BaseModel
from typing import List, Dict


class Box(BaseModel):
    cls: int 
    conf: float
    x: float
    y: float
    w: float
    h: float
    edit: bool

class ImageBoxes(BaseModel):
    image_name: str
    class_names: Dict[str, int]
    boxes: List[Box]
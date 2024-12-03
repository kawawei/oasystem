from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class PageMetadata(BaseModel):
    description: Optional[str] = None
    keywords: List[str] = []
    favicon: Optional[str] = None
    language: str = "zh-TW"

class WebPage(BaseModel):
    url: str
    title: str
    content: str
    links: List[str] = []
    last_updated: datetime = datetime.now()
    metadata: PageMetadata
    score: float = 0.0  # 用於搜索排名 
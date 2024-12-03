from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Search Engine API"
    DEBUG: bool = True
    API_PREFIX: str = "/api"
    
    # 爬蟲設置
    MAX_PAGES: int = 100
    MAX_DEPTH: int = 2
    CRAWL_DELAY: float = 1.0
    USER_AGENT: str = "CustomSearchBot/1.0"
    ALLOWED_DOMAINS: List[str] = []
    
    # 搜索設置
    MIN_SCORE: float = 0.3
    MAX_RESULTS: int = 20
    
    # 內容提取設置
    MAIN_CONTENT_TAGS: List[str] = ['article', 'main', 'div.content', 'div.main']
    IGNORE_TAGS: List[str] = ['script', 'style', 'nav', 'footer', 'header']
    
    # 分詞設置
    STOP_WORDS_FILE: str = "data/stop_words.txt"
    CUSTOM_DICT_FILE: str = "data/custom_dict.txt"
    MIN_WORD_LEN: int = 2
    MAX_WORD_LEN: int = 20
    
    class Config:
        env_file = ".env"

settings = Settings() 
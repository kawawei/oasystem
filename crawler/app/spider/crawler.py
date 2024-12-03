import asyncio
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Set, Dict
from urllib.parse import urljoin, urlparse
from ..models.page import WebPage, PageMetadata
from ..search.engine import SearchEngine
from .parser import HTMLParser
from config.settings import settings

class Crawler:
    def __init__(self):
        self.visited: Set[str] = set()
        self.current_depth: Dict[str, int] = {}
        self.search_engine = SearchEngine()
        self.parser = HTMLParser()
        self.headers = {
            'User-Agent': settings.USER_AGENT,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        }

    async def crawl_page(self, url: str, session: aiohttp.ClientSession, depth: int = 0) -> List[str]:
        """爬取單個頁面並返回新的URL"""
        if depth > settings.MAX_DEPTH:
            return []

        try:
            async with session.get(url, headers=self.headers) as response:
                if response.status == 200:
                    html = await response.text()
                    page = self.parser.parse_html(html, url)
                    if page:
                        self.search_engine.add_document(page)
                        # 獲取新的URL進行深度爬取
                        new_urls = [
                            urljoin(url, link) for link in page.links
                            if self.is_valid_url(link)
                        ]
                        return new_urls
                return []
        except Exception as e:
            print(f"Error crawling {url}: {e}")
            return []

    def is_valid_url(self, url: str) -> bool:
        """檢查URL是否有效且在允許的域名內"""
        try:
            parsed = urlparse(url)
            if not parsed.scheme or not parsed.netloc:
                return False
            if settings.ALLOWED_DOMAINS:
                return any(domain in parsed.netloc for domain in settings.ALLOWED_DOMAINS)
            return True
        except:
            return False

    async def crawl(self, start_urls: List[str], max_pages: int = settings.MAX_PAGES) -> List[WebPage]:
        """深度爬取多個URL"""
        pages = []
        queue = [(url, 0) for url in start_urls]  # (url, depth)
        
        async with aiohttp.ClientSession() as session:
            while queue and len(self.visited) < max_pages:
                current_batch = []
                current_depths = []
                
                while queue and len(current_batch) < 5:
                    url, depth = queue.pop(0)
                    if url not in self.visited:
                        self.visited.add(url)
                        current_batch.append(self.crawl_page(url, session, depth))
                        current_depths.append(depth)

                if current_batch:
                    new_urls_list = await asyncio.gather(*current_batch)
                    # 使用 current_depths 而不是 current_batch
                    for urls, depth in zip(new_urls_list, current_depths):
                        queue.extend((url, depth + 1) for url in urls 
                                  if url not in self.visited)
                    
                    await asyncio.sleep(settings.CRAWL_DELAY)

        return list(self.search_engine.pages.values()) 
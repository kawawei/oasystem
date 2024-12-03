from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict
from ..spider.crawler import Crawler
from config.settings import settings

router = APIRouter()
crawler = Crawler()

@router.get("/search")
async def search(
    q: str = Query(..., min_length=1),
    limit: int = settings.MAX_RESULTS
) -> List[Dict]:
    try:
        results = crawler.search_engine.search(q, limit)
        return [
            {
                "title": page.title,
                "url": url,
                "description": page.metadata.description,
                "score": score,
                "favicon": page.metadata.favicon,
                "language": page.metadata.language,
                "keywords": page.metadata.keywords,
                "last_updated": page.last_updated.isoformat()
            }
            for url, score in results
            if (page := crawler.search_engine.get_page(url))
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/crawl")
async def crawl_urls(urls: List[str]) -> Dict:
    """批量爬取URL"""
    try:
        pages = await crawler.crawl(urls)
        return {
            "status": "success",
            "pages_crawled": len(pages),
            "urls": [page.url for page in pages]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats")
async def get_stats() -> Dict:
    """獲取爬蟲統計信息"""
    return {
        "total_pages": len(crawler.search_engine.pages),
        "total_words": len(crawler.search_engine.index),
        "crawled_domains": len({url.split('/')[2] for url in crawler.visited}),
        "memory_usage_mb": len(str(crawler.search_engine.index)) / 1024 / 1024
    } 
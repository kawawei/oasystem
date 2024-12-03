import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import asyncio
from app.spider.crawler import Crawler
from app.search.engine import SearchEngine

async def test_crawl_and_search():
    # 初始化爬蟲
    crawler = Crawler()
    
    # 測試URL
    test_urls = [
        "https://www.python.org",
        "https://fastapi.tiangolo.com",
    ]
    
    print("開始爬取...")
    pages = await crawler.crawl(test_urls, max_pages=5)
    print(f"爬取完成，共 {len(pages)} 頁")
    
    # 測試搜索
    query = "python web"
    print(f"\n搜索: {query}")
    results = crawler.search_engine.search(query)
    
    print("\n搜索結果:")
    for url, score in results:
        page = crawler.search_engine.get_page(url)
        print(f"\n標題: {page.title}")
        print(f"URL: {url}")
        print(f"相關度: {score:.2f}")
        print(f"描述: {page.metadata.description[:100]}...")

if __name__ == "__main__":
    asyncio.run(test_crawl_and_search()) 
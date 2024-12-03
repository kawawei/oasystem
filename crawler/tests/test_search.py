import asyncio
from app.spider.crawler import Crawler

async def test_search_ranking():
    crawler = Crawler()
    
    # 測試不同類型的URL
    test_urls = [
        "https://www.python.org",
        "https://docs.python.org/3/",
        "https://pypi.org",
        "https://fastapi.tiangolo.com",
        "https://www.djangoproject.com"
    ]
    
    print("開始爬取多個Python相關網站...")
    pages = await crawler.crawl(test_urls, max_pages=10)
    print(f"爬取完成，共 {len(pages)} 頁")
    
    # 測試不同的搜索查詢
    test_queries = [
        "python web framework",
        "python 安裝",
        "python API",
        "python 教程"
    ]
    
    for query in test_queries:
        print(f"\n搜索: {query}")
        results = crawler.search_engine.search(query)
        
        print("\n搜索結果:")
        for url, score in results:
            page = crawler.search_engine.get_page(url)
            print(f"\n標題: {page.title}")
            print(f"URL: {url}")
            print(f"相關度: {score:.4f}")
            print(f"關鍵字: {', '.join(page.metadata.keywords)}")
            print(f"語言: {page.metadata.language}")
            print(f"描述: {page.metadata.description[:100]}...")

if __name__ == "__main__":
    asyncio.run(test_search_ranking()) 
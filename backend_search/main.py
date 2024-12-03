from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from spider import Spider
from datetime import datetime, timedelta

app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 創建爬蟲實例和簡單的內存緩存
spider = Spider()
memory_cache = {}  # 使用字典作為簡單緩存

# 添加在文件開頭的其他類定義旁邊
class SearchRequest(BaseModel):
    query: str
    preferences: dict = {}  # 設置默認值為空字典

@app.post("/api/search")
async def search(request: SearchRequest):
    try:
        # 檢查內存緩存
        cache_key = f"search:{request.query}"
        current_time = datetime.now()
        
        if cache_key in memory_cache:
            cached_data, expire_time = memory_cache[cache_key]
            if current_time < expire_time:
                return {"results": cached_data}
        
        # 執行搜尋
        print(f"搜尋請求: {request}")
        results = spider.search(
            query=request.query,
            language=request.preferences.get('language', 'all'),
            max_results=request.preferences.get('max_results', 20)
        )
        
        # 儲存到內存緩存（1小時過期）
        memory_cache[cache_key] = (results, current_time + timedelta(hours=1))
        
        return {"results": results}
    except Exception as e:
        print(f"搜尋出錯: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/add-url")
async def add_url(request: BaseModel):
    try:
        success = spider.add_url_to_crawl(request.url)
        if success:
            # 立即開始爬取新添加的URL
            spider.crawl(request.url, max_depth=2)
            return {"status": "success"}
        return {"status": "invalid_url"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 
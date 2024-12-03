import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from concurrent.futures import ThreadPoolExecutor
import threading

class Spider:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml'
        }
        self.visited_urls = set()
        self.index = {}  # 網頁內容索引
        self.word_index = {}  # 關鍵字索引
        self.crawled_count = 0
        self.max_pages = 100  # 增加頁面限制
        self.lock = threading.Lock()  # 添加線程鎖
        self.max_workers = 5  # 同時運行的線程數
        self.page_rank = {}   # 網頁的權重分數
        
        # 專注於技術文檔和學習資源
        self.start_urls = [
            "https://www.w3schools.com/python/",
            "https://www.w3schools.com/js/",
            "https://www.w3schools.com/html/",
            "https://www.w3schools.com/css/",
            "https://www.runoob.com/python/",
            "https://www.runoob.com/js/",
            "https://www.runoob.com/html/",
            "https://www.runoob.com/css/"
        ]
        
        # 添加搜尋偏好設置
        self.preferences = {
            'language': ['zh', 'en'],  # 支持中英文
            'max_results': 20,
            'cache_time': 3600  # 緩存1小時
        }
        
        # 添加地區相關配置
        self.region_domains = {
            'tw': ['.tw', '.com.tw', 'runoob.com', 'tw.', 'pixnet.net'],
            'cn': ['.cn', '.com.cn', 'csdn.net', 'zhihu.com'],
            'global': ['.com', '.org', '.net']
        }
        
        # 擴充起始網站，添加地區標記
        self.start_urls = [
            # 台灣網站
            {"url": "https://www.runoob.com/python/", "region": "tw"},
            {"url": "https://ithelp.ithome.com.tw/", "region": "tw"},
            {"url": "https://blog.miniasp.com/", "region": "tw"},
            {"url": "https://www.pixnet.net/", "region": "tw"},
            
            # 國際網站
            {"url": "https://www.w3schools.com/python/", "region": "global"},
            {"url": "https://www.w3schools.com/js/", "region": "global"},
            
            # 中國網站
            {"url": "https://www.csdn.net/", "region": "cn"},
            {"url": "https://www.zhihu.com/", "region": "cn"}
        ]
    
    def crawl_all(self):
        """使用多線程爬取所有起始網站"""
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # 提交所有爬取任務
            futures = [
                executor.submit(self.crawl, site["url"], 2) 
                for site in self.start_urls
            ]
            # 等待所有任務完成
            for future in futures:
                try:
                    future.result()
                except Exception as e:
                    print(f"爬取任務出錯: {str(e)}")
    
    def crawl(self, start_url: str, max_depth: int = 2):
        """爬取網頁並建立索引"""
        if (max_depth <= 0 or 
            start_url in self.visited_urls or 
            self.crawled_count >= self.max_pages):
            return
            
        try:
            print(f"正在爬取 ({self.crawled_count + 1}): {start_url}")
            response = requests.get(start_url, headers=self.headers, timeout=10)
            
            # 檢查是否成功
            if response.status_code != 200:
                print(f"爬取失敗: {start_url}, 狀態碼: {response.status_code}")
                return
                
            # 檢查內容類型
            content_type = response.headers.get('content-type', '').lower()
            if 'text/html' not in content_type:
                print(f"跳過非HTML內容: {start_url}")
                return
                
            response.encoding = 'utf-8'
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # 提取主要內容
            main_content = soup.find('main') or soup.find('article') or soup.find('div', class_='content')
            if main_content:
                content = main_content.get_text(separator=' ', strip=True)
            else:
                content = soup.get_text(separator=' ', strip=True)
            
            # 儲存內容
            with self.lock:
                self.index[start_url] = {
                    'title': (soup.title.string if soup.title else '').strip(),
                    'content': content,
                    'url': start_url,
                    'last_updated': time.time()
                }
                print(f"已索引頁面: {start_url} (內容長度: {len(content)})")
            
            self.visited_urls.add(start_url)
            self.crawled_count += 1
            
            # 只爬取同域名的鏈接
            current_domain = urlparse(start_url).netloc
            links = soup.find_all('a', href=True)
            valid_links = [
                urljoin(start_url, link['href'])
                for link in links
                if self._is_valid_url(urljoin(start_url, link['href'])) and
                urlparse(urljoin(start_url, link['href'])).netloc == current_domain
            ][:5]  # 每頁最多爬5個鏈接
            
            for next_url in valid_links:
                if next_url not in self.visited_urls:
                    time.sleep(1)  # 避免請求過快
                    self.crawl(next_url, max_depth - 1)
                    
        except Exception as e:
            print(f"爬取出錯 {start_url}: {str(e)}")
    
    def calculate_page_rank(self):
        """計算網頁權重"""
        for url in self.index:
            # 基礎分數
            score = 1.0
            
            # 根據標題關鍵字加分
            title = self.index[url]['title'].lower()
            if 'tutorial' in title or '教程' in title:
                score += 0.5
            if 'documentation' in title or '文檔' in title:
                score += 0.3
                
            # 根據連入連結數加分
            incoming_links = sum(1 for page in self.index.values() 
                               if url in page.get('links', []))
            score += incoming_links * 0.1
            
            self.page_rank[url] = score
    
    def _get_url_region(self, url: str) -> str:
        """判斷URL所屬地區"""
        domain = urlparse(url).netloc.lower()
        
        for region, patterns in self.region_domains.items():
            if any(pattern in domain for pattern in patterns):
                return region
        return 'global'
    
    def search(self, query: str, language: str = 'all', region: str = 'tw', max_results: int = 20) -> list:
        """改進的搜尋功能，添加地區優先"""
        try:
            print(f"開始搜尋關鍵字: {query} (語言: {language})")
            
            if not self.index:
                print("索引為空，開始爬取...")
                self.crawl_all()
                
            print(f"當前索引包含 {len(self.index)} 個頁面")
            results = []
            
            # 搜尋詞變體
            query_variants = [
                query.lower(),                    # 原始搜尋詞
                ' ' + query.lower() + ' ',        # 帶空格的搜尋詞
                query.lower().replace(' ', ''),   # 移除空格
                ''.join([                         # 數字轉中文
                    {'1':'一','2':'二','3':'三','4':'四','5':'五',
                     '6':'六','7':'七','8':'八','9':'九','0':'零'
                    }.get(c, c) for c in query
                ])
            ]
            
            print(f"搜尋變體: {query_variants}")  # 添加日誌
            
            # 對每個網頁計算相關度分數
            for url, page_data in self.index.items():
                try:
                    content = str(page_data.get('content', '')).lower()
                    title = str(page_data.get('title', url)).lower()
                    
                    print(f"\n檢查頁面: {url}")  # 添加日誌
                    print(f"標題: {title[:100]}")  # 只顯示前100個字符
                    
                    score = 0.0
                    matched = False
                    
                    # 檢查標題
                    for variant in query_variants:
                        if variant in title:
                            score += 3.0
                            matched = True
                            print(f"標題匹配: {variant}")  # 添加日誌
                    
                    # 檢查內容
                    for variant in query_variants:
                        if variant in content:
                            score += 1.0
                            matched = True
                            count = content.count(variant)
                            score += min(count * 0.1, 1.0)
                            print(f"內容匹配: {variant} (出現 {count} 次)")  # 添加日誌
                    
                    # 非常寬鬆的匹配：任何查詢詞的字符都算分
                    for char in query.lower():
                        if char in content:
                            score += 0.1
                            matched = True
                    
                    if matched or score > 0:  # 降低門檻
                        snippet = self._get_snippet(content, query)
                        results.append({
                            'url': url,
                            'title': page_data.get('title', url),
                            'description': snippet,
                            'score': score
                        })
                        print(f"添加結果: {url} (分數: {score})")
                    
                except Exception as e:
                    print(f"處理頁面時出錯 {url}: {str(e)}")
                    continue
            
            # 根據地區調整分數
            for result in results:
                url = result['url']
                url_region = self._get_url_region(url)
                
                if url_region == region:
                    result['score'] *= 2.0  # 同地區網站分數加倍
                elif url_region == 'global':
                    result['score'] *= 1.2  # 國際網站稍微加分
                
                result['region'] = url_region  # 添加地區信息
            
            # 重新排序
            results.sort(key=lambda x: x['score'], reverse=True)
            return results[:max_results]
            
        except Exception as e:
            print(f"搜尋過程出錯: {str(e)}")
            return []
    
    def _index_page(self, url: str, soup: BeautifulSoup):
        """線程安全的索引建立"""
        content = soup.get_text()
        title = soup.title.string if soup.title else url
        
        with self.lock:  # 使用線程鎖保護共享資源
            # 儲存網頁內容
            self.index[url] = {
                'title': title,
                'content': content
            }
            
            # 建立關鍵字索引
            words = set(content.lower().split())
            for word in words:
                if word not in self.word_index:
                    self.word_index[word] = set()
                self.word_index[word].add(url)
            
            self.crawled_count += 1
            print(f"已完成爬取 ({self.crawled_count}): {url}")
    
    def _get_snippet(self, content: str, query: str, length: int = 200) -> str:
        """獲取包含關鍵字的文本片段"""
        position = content.lower().find(query)
        if position == -1:
            return content[:length] + '...'
            
        start = max(0, position - 100)
        end = min(len(content), position + 100)
        return f"...{content[start:end]}..."
    
    def _is_valid_url(self, url: str) -> bool:
        """檢查URL是否有效"""
        try:
            result = urlparse(url)
            return all([result.scheme, result.netloc])
        except:
            return False
    
    def add_url_to_crawl(self, url: str):
        """添加新的URL到爬取列表"""
        if self._is_valid_url(url) and url not in self.visited_urls:
            region = self._get_url_region(url)
            self.start_urls.append({
                "url": url,
                "region": region
            })
            return True
        return False
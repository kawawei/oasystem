from spider import Spider

# 創建爬蟲實例
spider = Spider()

# 測試搜尋 - 使用維基百科的 Python 頁面
result = spider.search_page(
    url="https://zh.wikipedia.org/wiki/Python",
    query="Python"
)

# 打印結果
print("\n搜尋結果:")
print("標題:", result['title'])
print("網址:", result['url'])
print("描述:", result['description']) 
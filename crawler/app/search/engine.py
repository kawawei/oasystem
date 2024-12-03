from typing import List, Dict
import math
from collections import Counter
from ..models.page import WebPage
from .tokenizer import Tokenizer

class SearchEngine:
    def __init__(self):
        self.index: Dict[str, Dict[str, float]] = {}  # 倒排索引
        self.doc_lengths: Dict[str, float] = {}       # 文檔長度
        self.total_docs = 0                           # 總文檔數
        self.pages: Dict[str, WebPage] = {}          # 存儲頁面內容
        self.tokenizer = Tokenizer()

    def add_document(self, page: WebPage):
        """添加文檔到索引"""
        # 保存頁面
        self.pages[page.url] = page
        
        # 分詞並計算詞頻
        words = self._tokenize(f"{page.title} {page.content}")
        word_freq = Counter(words)
        
        # 更新倒排索引
        doc_length = 0
        for word, freq in word_freq.items():
            if word not in self.index:
                self.index[word] = {}
            # 計算 TF (詞頻)
            tf = 1 + math.log10(freq)
            self.index[word][page.url] = tf
            doc_length += tf * tf
        
        # 保存文檔長度
        self.doc_lengths[page.url] = math.sqrt(doc_length)
        self.total_docs += 1

    def search(self, query: str, limit: int = 10) -> List[tuple[str, float]]:
        """搜索文檔"""
        query_words = self._tokenize(query)
        scores = {}
        
        # 改進：給標題中的關鍵字更高權重
        title_weight = 2.0
        content_weight = 1.0
        
        for word in query_words:
            if word in self.index:
                df = len(self.index[word])
                idf = math.log10(self.total_docs / df)
                
                for doc_url, tf in self.index[word].items():
                    if doc_url not in scores:
                        scores[doc_url] = 0
                    
                    # 檢查詞是否在標題中
                    page = self.pages[doc_url]
                    if word in self._tokenize(page.title):
                        scores[doc_url] += tf * idf * title_weight
                    else:
                        scores[doc_url] += tf * idf * content_weight
        
        # 正規化得分
        for doc_url in scores:
            scores[doc_url] /= self.doc_lengths[doc_url]
        
        # 排序結果
        ranked_docs = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return ranked_docs[:limit]

    def _tokenize(self, text: str) -> List[str]:
        """簡單的分詞實現"""
        return self.tokenizer.tokenize(text)

    def get_page(self, url: str) -> WebPage:
        """獲取頁面內容"""
        return self.pages.get(url)

    def get_suggestions(self, query: str, limit: int = 5) -> List[str]:
        """根據用戶輸入提供搜索建議"""
        query_words = self._tokenize(query)
        suggestions = []
        
        # 從已索引的詞中找相似的
        for word in query_words:
            similar_words = [
                indexed_word for indexed_word in self.index.keys()
                if word in indexed_word or indexed_word in word
            ]
            suggestions.extend(similar_words)
        
        # 根據詞頻排序
        word_freq = Counter(suggestions)
        return [word for word, _ in word_freq.most_common(limit)]
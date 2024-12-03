import jieba
from typing import List
from config.settings import settings

class Tokenizer:
    def __init__(self):
        # 加載停用詞
        self.stop_words = self._load_stop_words()
        # 加載自定義詞典
        self._load_custom_dict()

    def tokenize(self, text: str) -> List[str]:
        """
        對文本進行分詞
        
        Args:
            text: 要分詞的文本
            
        Returns:
            分詞後的詞列表，已過濾停用詞
        """
        # 使用結巴分詞
        words = jieba.cut(text)
        # 過濾停用詞和空白
        return [
            word.lower() for word in words
            if word.strip() and word not in self.stop_words
        ]

    def _load_stop_words(self) -> set:
        """加載停用詞表"""
        try:
            with open(settings.STOP_WORDS_FILE, 'r', encoding='utf-8') as f:
                return set(line.strip() for line in f)
        except:
            return set()

    def _load_custom_dict(self):
        """加載自定義詞典"""
        try:
            jieba.load_userdict(settings.CUSTOM_DICT_FILE)
        except:
            pass 